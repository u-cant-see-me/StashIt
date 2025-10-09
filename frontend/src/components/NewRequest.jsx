import { useFile } from "../contexts/FileContext";
import { useKey } from "../contexts/KeyContext";
import KeyHolder from "./KeyHolder";
import { useEffect } from "react";
import { useSessionContext } from "../contexts/SessionContext";

const NewRequest = () => {
  const { clearFiles, updateState, files, failedFiles } = useFile();
  const { key, removeKey } = useKey();
  const { setSessionInfo } = useSessionContext();

  useEffect(() => {
    files.forEach((file) => {
      if (!["success", "uploading"].includes(file.state.status)) {
        updateState({ status: "error" }, file.fileInfo.id);
      }
    });
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

  const successCount = files.length - failedFiles.length;

  return (
    <div className="relative flex flex-col items-center justify-center space-y-4">
      <p className="text-green-400 text-sm sm:text-lg font-semibold">
        Uploaded files {successCount}/{files.length}!
      </p>

      {key && successCount > 0 && <KeyHolder />}

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
