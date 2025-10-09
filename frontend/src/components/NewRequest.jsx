import { useFile } from "../contexts/FileContext";
import { useKey } from "../contexts/KeyContext";
import KeyHolder from "./KeyHolder";
import { useEffect, useState } from "react";
import { useSessionContext } from "../contexts/SessionContext";
import { PulseLoader } from "react-spinners";

const NewRequest = () => {
  const { clearFiles, updateState, filesRef, fileVersion, findFailedFiles } =
    useFile();
  const { key, removeKey } = useKey();
  const [failedFile, setFailedFiles] = useState([]);
  const { setSessionInfo } = useSessionContext();

  useEffect(() => {
    for (const file of filesRef.current) {
      if (
        file.state.status !== "success" &&
        file.state.status !== "uploading"
      ) {
        updateState({ status: "error" }, file.fileInfo.id);
      }
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setFailedFiles(findFailedFiles(), 0);
    });
  }, [fileVersion]);

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
    <div className="relative flex flex-col items-center justify-center   space-y-4">
      <p className="text-green-400 text-sm sm:text-lg font-semibold">
        Uploaded files {filesRef.current.length - failedFile.length}/
        {filesRef.current.length}!
      </p>

      {key && filesRef.current.length - failedFile.length > 0 && <KeyHolder />}

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
