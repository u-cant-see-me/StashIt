import { useFile } from "../contexts/FileContext";
import { useKey } from "../contexts/KeyContext";
import { Check, X } from "lucide-react";
import KeyHolder from "./KeyHolder";
import { useEffect, useRef } from "react";

const NewRequest = ({ setUploadDone, retry }) => {
  const { files, clearFiles, updateState } = useFile();
  const { key, removeKey } = useKey();
  const failedFile = useRef([]);

  useEffect(() => {
    failedFile.current = [];
    for (const file of files) {
      if (file.state.status === "pending" || file.state.status === "error") {
        console.log(file.fileInfo.name);

        failedFile.current.push(file);
        updateState({ status: "error" }, file.fileInfo.id);
      }
    }
  }, []);

  const handleNewRequest = () => {
    sessionStorage.removeItem("page");
    clearFiles();
    removeKey();
    setUploadDone(false);
  };
  return (
    <div className="flex flex-col items-center justify-center  p-6 space-y-4">
      <p className="text-green-400 text-lg font-semibold">
        Uploaded files {files.length - failedFile.current.length}/{files.length}
        !
      </p>
      {failedFile.current.length > 0 && (
        <button
          type="button"
          className="py-2 px-4 bg-red-400 text-white"
          onClick={() => retry(failedFile.current)}
        >
          Retry All
        </button>
      )}
      {key && files.length - failedFile.current.length > 0 && <KeyHolder />}

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
