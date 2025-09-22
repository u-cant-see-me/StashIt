import { useEffect, useRef } from "react";
import AddFile from "./AddFile";
import { useFile } from "../contexts/FileContext";
import NewRequest from "./NewRequest";
import { PulseLoader } from "react-spinners";
import { useUpload } from "../hooks/useUpload";
import ProgressBar from "./ui/ProgressBar";
import ExpiresIn from "./ExpiresIn";
import { useRetry } from "../hooks/UseRetry";
import { useSessionContext } from "../contexts/SessionContext";
const Main = () => {
  const endRef = useRef(null);
  const { files, removeFile, expiry, setExpiry, updateState } = useFile();
  const { sendRequest, uploadAllFiles, uploadState, requestState } =
    useUpload();
  const { retryRequest, isConnecting } = useRetry();
  const { sessionInfo } = useSessionContext();

  const startUpload = async () => {
    if (sessionInfo.uploadStatus !== "uploading") {
      const uploadUrls = await sendRequest();
      if (uploadUrls) {
        await uploadAllFiles(uploadUrls);
        sessionStorage.setItem("page", "newRequest");
      }
    } else {
      retry(files);
    }
  };

  const updateInvalidUrls = async (files) => {
    //only get retry url of ones which are partially used
    const usedLinkFiles = files.filter((f) => f.state.progress > 0);
    const pathArr = usedLinkFiles.map((f) => ({
      path: f.state.path,
      id: f.fileInfo.id,
    }));
    const retryUrls = await retryRequest(pathArr);
    for (const url of retryUrls) {
      updateState({ uploadUrl: url.uploadUrl }, url.id);
    }
  };
  const retry = async (files) => {
    console.log("retrying");
    let updatedFiles = files.filter((f) => f.state.status !== "success");
    console.log(updatedFiles);
    //expetcs an array

    const retryUrls = [];
    await updateInvalidUrls(updatedFiles);
    for (const file of updatedFiles) {
      retryUrls.push({ uploadUrl: file.state.uploadUrl, id: file.fileInfo.id });
    }
    await uploadAllFiles(retryUrls);
    console.log("done");
  };
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [files]);

  return (
    <div className="relative flex flex-col items-center justify-center ">
      <div className="hidden md:flex flex-shrink-0">
        {sessionInfo.uploadStatus === "idle" && <AddFile />}
      </div>
      <div className="w-full md:w-[80%]">
        <div>
          <div className="p-4 h-60 overflow-auto border border-neutral-900 rounded-lg">
            <ul className="space-y-2 ">
              {files.length === 0 && (
                <li className="text-sm text-neutral-500">
                  <p>Press + to add files</p>
                  <p>Files must not exceed 50 MB</p>
                </li>
              )}

              {files.map((file) => (
                <li
                  key={file.fileInfo.id}
                  ref={file.state.status === "uploading" ? endRef : null}
                  className="relative flex space-x-4 border-b border-neutral-800 pb-2 last:border-none"
                >
                  <button
                    className="text-neutral-500 hover:text-red-400 text-sm"
                    onClick={() => removeFile(file.fileInfo.id)}
                  >
                    ✕
                  </button>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-neutral-300">
                      {file.fileInfo.name}
                    </p>
                    <p
                      className={`text-xs ${
                        file.fileInfo.formattedSize.valid
                          ? "text-neutral-500"
                          : "text-red-400"
                      }`}
                    >
                      {file.fileInfo.formattedSize.size}
                    </p>
                  </div>
                  <span className="flex-1 flex items-center justify-end">
                    {file.state.status !== "uploading" ? (
                      <span
                        className={`text-sm ${
                          file.state.status === "pending"
                            ? "text-yellow-400"
                            : file.state.status === "success"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {file.state.status !== "error" ? (
                          file.state.status
                        ) : (
                          <button type="button" onClick={() => retry([file])}>
                            Retry
                          </button>
                        )}
                      </span>
                    ) : (
                      <span className="text-green-400 text-xs font-mono">
                        {file.state.progress}%
                      </span>
                    )}
                  </span>
                  {file.state.status === "uploading" && (
                    <ProgressBar percent={file.state.progress} />
                  )}
                </li>
              ))}
              {files.length > 0 && <div ref={endRef} />}
            </ul>
          </div>
          <ExpiresIn value={expiry} onChange={setExpiry} />
        </div>

        <div className="flex mt-4">
          <div className="flex-1">
            {files.length > 0 && !sessionInfo.newRequest && (
              <button
                type="button"
                className={`relative py-2 px-6 bg-black text-white rounded-md overflow-hidden
                   transition-all duration-300 ${
                     requestState.status === "idle"
                       ? "hover:bg-white hover:text-black"
                       : ""
                   }
                   border border-black`}
                disabled={requestState.status !== "idle"}
                onClick={() => startUpload()}
              >
                {requestState.status === "idle" ? (
                  "Upload"
                ) : requestState.status === "connecting" ? (
                  <PulseLoader size={5} color="#fff" />
                ) : (
                  "Connected"
                )}
              </button>
            )}
          </div>
          <div className="md:hidden relative flex flex-1 justify-end">
            {sessionInfo.uploadStatus === "idle" && <AddFile />}
          </div>
        </div>

        {sessionInfo.newRequest && (
          <>
            <NewRequest retry={retry} isConnecting={isConnecting} />
          </>
        )}
      </div>
    </div>
  );
};

export default Main;
