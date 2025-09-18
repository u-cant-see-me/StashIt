import asyncHandler from "express-async-handler";
import supabase from "../config/supabaseClient.js";
import generatePassKey from "../utils/generatePassKey.js";

export const uploadController = asyncHandler(async (req, res) => {
  const { files, expiry } = req.body;
  if (!files) {
    res.status(400);
    throw new Error("No files provided ");
  }
  console.log("files ", files, expiry);

  const stashKey = generatePassKey();

  if (!stashKey) {
    res.status(400);
    throw new Error("failure in generating pass key");
  }

  console.log(stashKey);

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
      expiry,
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
    console.log(signedUrlData);
    console.log(signedUrlError);
  }

  res.status(201).json({
    signedUrls,
    stashKey,
  });
});

export const retryUploadUrl = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { file_paths } = req.body;
  console.log(file_paths);

  const signedUrl = [];

  for (const file_path of file_paths) {
    console.log(file_path.path);

    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage
        .from("stash")
        .createSignedUploadUrl(file_path.path, 60 * 60);

    console.log(signedUrlData, signedUrlError);

    if (signedUrlError && signedUrlError.statusCode === "409") {
      console.log(`File already exists: ${file_path.path}, deleting...`);

      const { error: deleteError } = await supabase.storage
        .from("stash")
        .remove(file_path.path);

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

export const downloadFileUrlController = asyncHandler(async (req, res) => {
  console.log("Requested file data:", req.data);
  const stashData = req.data;
  const tableId = stashData.id;

  const files = stashData.files;
  const expiry = stashData.expiry;

  const downloadUrls = await Promise.all(
    files.map(async (file) => {
      if (!file.file_path) throw new Error("missing file path");
      const { data, error } = await supabase.storage
        .from("stash")
        .createSignedUrl(file.file_path, 60 * 60);
      if (error) throw new Error(error.message);
      return { ...file, downloadUrl: data };
    })
  );

  const filePaths = files.map((f) => f.file_path);

  if (expiry === "once") {
    // delete stash data
    const { data: deleteData, error: deleteError } = await supabase.storage
      .from("stash")
      .remove(filePaths);
    if (deleteError) {
      console.error("Storage delete error", deleteError.message);
    } else {
      console.log("success delelted data ", deleteData);
      //delete stash table
      const { error: tableError } = await supabase
        .from("stash")
        .delete()
        .eq("id", tableId);
      if (tableError) {
        console.error("table delete error", tableError.message);
      } else {
        console.log("success delelted table ");
      }
    }
  }

  res.json({ downloadUrls, createdAt: req.data.created_at });
});
