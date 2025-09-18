import { useEffect, useRef, useState } from "react";
import AddFile from "./AddFile";
import { useFile } from "../contexts/FileContext";
import NewRequest from "./NewRequest";
import { PulseLoader } from "react-spinners";
import { useUpload } from "../hooks/useUpload";
import ProgressBar from "./ui/ProgressBar";
import ExpiresIn from "./ExpiresIn";
import { useRetry } from "../hooks/useRetry";

const Main = () => {
  const endRef = useRef(null);
  const { files, removeFile, expiry, setExpiry } = useFile();

  const [uploadDone, setUploadDone] = useState(() => {
    return sessionStorage.getItem("page") === "newRequest";
  });
  const { sendRequest, uploadAllFiles, uploadState, requestState } =
    useUpload();
  const { retryRequest } = useRetry();

  useEffect(() => {
    const page = sessionStorage.getItem("page");
    if (page === "newRequest") {
      setUploadDone(true);
    }
  }, []);

  const startUpload = async () => {
    const uploadUrls = await sendRequest();
    if (uploadUrls) {
      await uploadAllFiles(uploadUrls);
      sessionStorage.setItem("page", "newRequest");
      setUploadDone(true);
    }
  };

  const retry = async (files) => {
    //expetcs an array
    console.log(files);

    const pathArr = files.map((file) => ({
      path: file.state.path,
      id: file.fileInfo.id,
    }));
    // const arr = [{ path: file.state.path, id: file.fileInfo.id }];
    // console.log(arr);

    const retryUrl = await retryRequest(pathArr);
    await uploadAllFiles(retryUrl);
    console.log("done");
  };
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [files]);

  return (
    <div className="relative flex flex-col items-center justify-center ">
      <div className="hidden md:flex flex-shrink-0">
        {!uploadDone && <AddFile />}
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
                          <button type="button" onClick={() => retry(file)}>
                            Retry
                          </button>
                        )}
                      </span>
                    ) : (
                      <PulseLoader size={5} color="#fff" />
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
            {files.length > 0 && !uploadDone && (
              <button
                type="button"
                className="relative py-2 px-6 bg-black text-white rounded-md overflow-hidden
                   transition-all duration-300 hover:bg-white hover:text-black
                   border border-black"
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
            {!uploadDone && <AddFile />}
          </div>
        </div>

        {uploadDone && (
          <>
            <NewRequest setUploadDone={setUploadDone} retry={retry} />
          </>
        )}
      </div>
    </div>
  );
};

export default Main;
