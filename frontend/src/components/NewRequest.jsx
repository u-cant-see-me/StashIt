import { useFile } from "../contexts/FileContext";
import { useKey } from "../contexts/KeyContext";
import KeyHolder from "./KeyHolder";
import { useEffect, useState } from "react";
import { useSessionContext } from "../contexts/SessionContext";
import { PulseLoader } from "react-spinners";

const NewRequest = ({ retry, isConnecting }) => {
  const { files, clearFiles, updateState } = useFile();
  const { key, removeKey } = useKey();
  const [failedFile, setFailedFiles] = useState([]);
  const { setSessionInfo } = useSessionContext();

  useEffect(() => {
    const f = [];
    for (const file of files) {
      if (file.state.status === "pending" || file.state.status === "error") {
        f.push(file);
        updateState({ status: "error" }, file.fileInfo.id);
      }
    }
    setFailedFiles(f);
  }, []);

  const handleNewRequest = () => {
    sessionStorage.removeItem("page");
    clearFiles();
    removeKey();
    setSessionInfo((prev) => ({
      ...prev,
      uploadStatus: "idle",
      newRequest: false,
    }));
  };
  return (
    <div className="relative flex flex-col items-center justify-center  p-6 space-y-4">
      <p className="text-green-400 text-lg font-semibold">
        Uploaded files {files.length - failedFile.length}/{files.length}!
      </p>
      {failedFile.length > 0 && (
        <button
          type="button"
          className="absolute top-0 right-0 py-2 px-4 bg-red-400 text-white"
          onClick={() => {
            console.log(failedFile);

            retry(failedFile);
          }}
          // disabled={!isConnecting}
        >
          {isConnecting ? <PulseLoader size={5} color="#fff" /> : "Retry All"}
        </button>
      )}
      {key && files.length - failedFile.length > 0 && <KeyHolder />}

      <button
        onClick={handleNewRequest}
        className="px-4 py-2 bg-neutral-800 text-neutral-200 rounded-md hover:bg-neutral-700 transition"
      >
        Start New Request
      </button>
    </div>
  );
};

export default NewRequest;
