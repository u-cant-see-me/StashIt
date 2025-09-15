import asyncHandler from "express-async-handler";
import supabase from "../config/supabaseClient.js";
import generatePassKey from "../utils/generatePassKey.js";

export const uploadController = asyncHandler(async (req, res) => {
  const { files } = req.body;
  if (!files) {
    res.status(400);
    throw new Error("No files provided ");
  }
  console.log("files ", files);

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

    const uniqueFileName = `${Date.now()}-${fileName}`;

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
  const { file_paths } = req.query;

  const signedUrl = [];

  for (const file_path of file_paths) {
    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage
        .from("stash")
        .createSignedUploadUrl(file_path, 60 * 60);

    if (signedUrlError) {
      res.status(400);
      throw new Error(signedUrlError.message);
    }

    signedUrl.push(signedUrlData);
  }
  res.status(201).json({
    signedUrl,
  });
});

export const downloadFileUrlController = asyncHandler(async (req, res) => {
  console.log("Requested file data:", req.data);

  const stashData = req.data;
  const files = stashData.files;
  const downloadUrls = [];

  for (const file of files) {
    if (!file.file_path) {
      res.status(500);
      throw new Error("missing file path");
    }

    const { data: downloadUrl, error } = await supabase.storage
      .from("stash")
      .createSignedUrl(file.file_path, 60 * 60);

    if (downloadUrl) {
      downloadUrls.push({ ...file, downloadUrl });
    }

    if (error) {
      res.status(400);
      throw new Error(error);
    }
  }

  res.json({ downloadUrls });
});
