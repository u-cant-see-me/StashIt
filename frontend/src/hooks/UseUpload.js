import { useState, useRef } from "react";
import { useFile } from "../contexts/FileContext";
import axios from "axios";
import { generateMetaData } from "../utils/utils";
import { useKey } from "../contexts/KeyContext";

export const useUpload = () => {
  const { files, updateState } = useFile();
  const { addKey } = useKey();
  const [requestState, setRequestState] = useState({
    status: null,
    error: null,
  });
  const [uploadState, setUploadState] = useState({
    uploading: false,
    progress: 0,
    error: null,
    currFile: null,
  });
  const currFile = useRef(null);

  const [uploadUrls, setUploadUrls] = useState([]);

  const addUrls = (signedUrls) => {
    for (const url of signedUrls) {
      updateState({ uploadUrl: url.uploadUrl, path: url.path }, url.id);
    }
  };

  const sendRequest = async () => {
    try {
      setRequestState({ status: "pending", error: "null" });

      const metadata = generateMetaData(files);

      const url = `${import.meta.env.VITE_BASE_URL}/api/file/upload`;

      const res = await axios.post(url, {
        files: metadata,
      });

      const { signedUrls, stashKey } = await res.data;

      addUrls(signedUrls);
      setUploadUrls(signedUrls);
      addKey(stashKey);

      setRequestState({ status: "success", error: null });
      return signedUrls;
    } catch (error) {
      setRequestState({ status: "error", error: error.message });

      console.error(error.message);
    }
  };

  // Wi-Fi hiccup → socket reset mid-upload.
  // Cloudflare burps → temporary 502.
  // Local connection timeout. in these cases retry makes sense as link isnt expired yet
  const uploadWithRetry = async (
    url,
    fileObj,
    fileType,
    id,
    maxRetries = 5
  ) => {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        await axios.put(url, fileObj, {
          headers: { "Content-Type": fileType },
          onUploadProgress: (e) => {
            const percent = Math.round((e.loaded * 100) / e.total);
            setUploadState((prev) => ({ ...prev, progress: percent }));
            updateState({ progress: percent }, id);
          },
        });
        return "success";
      } catch (err) {
        if (!shouldRetry(err)) throw err; // skip retries on permanent errors
        attempt++;
        if (attempt >= maxRetries) throw err;

        const delay = 1000 * 2 ** attempt; // exponential backoff
        console.warn(`Retrying upload in ${delay / 1000}s...`);
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  };
  const shouldRetry = (error) => {
    if (error.code === "ECONNABORTED" || error.message === "Network Error") {
      return true; // network drop
    }

    if (error.response) {
      const status = error.response.status;
      if ([500, 502, 503, 504, 429].includes(status)) return true;
    }

    return false; // everything else = don’t retry
  };

  const uploadAllFiles = async (urls = uploadUrls) => {
    setUploadState((prev) => ({ ...prev, uploading: true }));

    try {
      for (const url of urls) {
        const file = files.find((file) => file.fileInfo.id === url.id);
        currFile.current = file;

        setUploadState((prev) => ({ ...prev, currFile: file }));
        updateState({ status: "uploading" }, file.fileInfo.id);

        const result = await uploadWithRetry(
          url.uploadUrl,
          file.fileObj,
          file.fileInfo.type,
          file.fileInfo.id,
          1
        );

        updateState({ status: "success" }, file.fileInfo.id);
      }
    } catch (error) {
      if (error.code === "ECONNABORTED") {
        console.error("Request timed out");
      } else if (!error.response) {
        console.error("Network error (server unreachable)");
      } else {
        console.error("Server error:", error.response.status, error.message);
      }
      setUploadState((prev) => ({ ...prev, error: error.message }));
      console.log(uploadState.currFile);
      updateState(
        { status: "error", error: error.message },
        currFile.current.fileInfo.id
      );
    } finally {
      setUploadState((prev) => ({ ...prev, uploading: false }));
    }
  };

  return {
    sendRequest,
    uploadAllFiles,
    uploadState,
    requestState,
    uploadUrls,
  };
};
