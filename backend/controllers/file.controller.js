import asyncHandler from "express-async-handler";
import supabase from "../config/supabaseClient.js";
import generatePassKey from "../utils/generatePassKey.js";

// @desc   Upload file
// @route  POST /api/file/upload
// @access Public
export const uploadController = asyncHandler(async (req, res) => {
  const { files, expiry } = req.body;
  if (!files) {
    res.status(400);
    throw new Error("No files provided ");
  }

  if (!expiry) {
    throw new Error({ message: "Expiration needs to be specified" });
  }

  const stashKey = generatePassKey();

  if (!stashKey) {
    res.status(400);
    throw new Error("failure in generating pass key");
  }

  const fileInfoArray = [];
  let totalSize = 0;

  for (const file of files) {
    const fileName = file.name;
    if (!fileName) {
      res.status(400);
      throw new Error("missing file name");
    }

    if (file.size > 50 * 1024 * 1024) {
      res.status(400);
      throw new Error("file should be less than 50 Mb");
    }

    const uniqueFileName = `${Date.now() + file.id}-${fileName}`;

    const filePath = `${stashKey}/${uniqueFileName}`;

    fileInfoArray.push({ ...file, file_path: filePath });

    totalSize += file.size;
  }
  console.log("file info arr", fileInfoArray, "size", totalSize);

  const { data, error } = await supabase
    .from("stash")
    .insert({
      stash_key: stashKey,
      files: fileInfoArray,
      size: totalSize,
      expiry:
        expiry === "once" || expiry === "30m" || expiry === "1h"
          ? expiry
          : "1h",
    })
    .select();

  if (error) {
    res.status(400);
    throw new Error(error.message || JSON.stringify(error));
  }

  //fetch upload url from supabase
  const signedUrls = [];
  for (const fileInfo of fileInfoArray) {
    console.log(fileInfo);
    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage
        .from("stash")
        .createSignedUploadUrl(fileInfo.file_path, 60 * 60);

    if (signedUrlError) {
      res.status(400);
      throw new Error(signedUrlError.message);
    }

    signedUrls.push({
      id: fileInfo.id,
      name: fileInfo.name,
      uploadUrl: signedUrlData.signedUrl,
      path: signedUrlData.path,
    });
  }

  res.status(201).json({
    signedUrls,
    stashKey,
  });
});

// @desc   get retry urls for partially uploaded files or consumed urls
// @route  POST /api/file/retry
// @access Public
export const retryUploadUrl = asyncHandler(async (req, res) => {
  const { file_paths } = req.body;
  const signedUrl = [];

  for (const file_path of file_paths) {
    console.log(file_path);
    let { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("stash")
      .createSignedUploadUrl(file_path.path, 60 * 60);

    if (signedUrlError && signedUrlError.statusCode === "409") {
      console.log(`File already exists: ${file_path.path}, deleting...`);

      const { error: deleteError } = await supabase.storage
        .from("stash")
        .remove([file_path.path]);

      if (deleteError) {
        res.status(400);
        throw new Error(deleteError.message);
      }

      const retry = await supabase.storage
        .from("stash")
        .createSignedUploadUrl(file_path.path, 60 * 60);

      signedUrlData = retry.data;
      signedUrlError = retry.error;
    }

    if (signedUrlError) {
      res.status(400);
      throw new Error(signedUrlError.message);
    }

    signedUrl.push({ uploadUrl: signedUrlData.signedUrl, id: file_path.id });
  }
  res.status(201).json({
    signedUrl,
  });
});

// @desc   get download urls
// @route  GET /api/file/download
// @access Private
export const downloadFileUrlController = asyncHandler(async (req, res) => {
  const stashData = req.data;
  const tableId = stashData.id;

  const files = stashData.files;
  const expiry = stashData.expiry;

  const { data, error } = await supabase
    .from("stash")
    .update({ used: true })
    .eq("id", tableId)
    .eq("used", false) // only update if still unused
    .select(); // return updated rows

  if (error) {
    console.error("Error updating key:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }

  if (expiry === "once" && (!data || data.length === 0)) {
    return res.status(400).json({ message: "Key already used" });
  }

  console.log("Key successfully marked as used:", tableId);

  //Promise.allSettled to handle partial failures
  const results = await Promise.allSettled(
    files.map(async (file) => {
      if (!file.file_path) throw new Error("missing file path");

      const { data: signed, error: signedErr } = await supabase.storage
        .from("stash")
        .createSignedUrl(file.file_path, 60 * 60);

      if (signedErr)
        throw new Error(
          `Failed to create URL for ${file.name}: ${signedErr.message}`
        );

      return { ...file, downloadUrl: signed.signedUrl };
    })
  );

  const successfulFiles = [];
  const failedFiles = [];

  results.forEach((result, idx) => {
    if (result.status === "fulfilled") {
      successfulFiles.push(result.value);
    } else {
      console.error(
        `Error generating URL for file ${files[idx].name}:`,
        result.reason.message
      );
      failedFiles.push({ ...files[idx], message: result.reason.message });
    }
  });

  return res.json({
    downloadUrls: successfulFiles,
    createdAt: stashData.created_at,
  });
});
