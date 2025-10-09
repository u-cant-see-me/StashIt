import { useState, useRef } from "react";
import { useFile } from "../contexts/FileContext";
import axios from "axios";
import { generateMetaData } from "../utils/utils";
import { useKey } from "../contexts/KeyContext";
import { useSessionContext } from "../contexts/SessionContext";
import toast from "react-hot-toast";
export const useUpload = () => {
  const { files, updateState, expiry, abortController, filesRef } = useFile();
  const { addKey } = useKey();
  const [uploadState, setUploadState] = useState({
    uploading: false,
    progress: 0,
    error: null,
    currFile: null,
  });
  const currFile = useRef(null);
  const { setSessionInfo, requestState, setRequestState } = useSessionContext();
  const [uploadUrls, setUploadUrls] = useState([]);

  const addUrls = (signedUrls) => {
    for (const url of signedUrls) {
      updateState({ uploadUrl: url.uploadUrl, path: url.path }, url.id);
    }
  };

  const sendRequest = async () => {
    try {
      setRequestState({ status: "connecting", error: "null" });
      setSessionInfo((prev) => ({ ...prev, uploadStatus: "requesting" }));

      const metadata = generateMetaData(files);

      const url = `${import.meta.env.VITE_BASE_URL}/api/file/upload`;

      const res = await axios.post(url, {
        files: metadata,
        expiry,
      });

      const { signedUrls, stashKey } = await res.data;

      addUrls(signedUrls);
      setUploadUrls(signedUrls);
      addKey(stashKey);

      setRequestState({ status: "connected", error: null });
      return signedUrls;
    } catch (error) {
      setRequestState({ status: "error", error: error.message });
      setSessionInfo((prev) => ({ ...prev, uploadStatus: "idle" }));

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
    const timeoutMs = 5 * 60 * 1000;
    console.log("curr file uploading", fileObj.name);
    const constroller = new AbortController();
    abortController.current = constroller;
    const timeoutId = setTimeout(() => {
      console.log("aborted");
      toast.error("Request time out");
      constroller.abort();
    }, timeoutMs);

    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        await axios.put(url, fileObj, {
          headers: { "Content-Type": fileType },
          signal: constroller.signal,
          onUploadProgress: (e) => {
            const percent = Math.round((e.loaded * 100) / e.total);
            setUploadState((prev) => ({ ...prev, progress: percent }));
            updateState({ progress: percent }, id);
          },
        });
        clearTimeout(timeoutId);
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
    setSessionInfo((prev) => ({ ...prev, uploadStatus: "uploading" }));
    for (const url of urls) {
      console.log("url", url);

      const file = filesRef.current.find((file) => file.fileInfo.id === url.id);
      if (!file) {
        console.warn("skipping file with id : " + url.id);
        continue;
      }
      currFile.current = file;
      setUploadState((prev) => ({ ...prev, currFile: file }));
      updateState({ status: "uploading" }, file.fileInfo.id);
      try {
        await uploadWithRetry(
          url.uploadUrl,
          file.fileObj,
          file.fileInfo.type,
          file.fileInfo.id
        );
        updateState({ status: "success" }, file.fileInfo.id);
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
        toast.error(error.message);
      }
    }
    console.log("done");

    setUploadState((prev) => ({ ...prev, uploading: false }));
    setRequestState({ status: "idle", error: null });
    setSessionInfo((prev) => ({
      ...prev,
      uploadStatus: "finished",
      newRequest: true,
    }));
  };

  return {
    sendRequest,
    uploadAllFiles,
    uploadState,
    requestState,
    uploadUrls,
  };
};
