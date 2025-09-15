import { useFile } from "../contexts/FileContext";
import { useKey } from "../contexts/KeyContext";
import { Check, X } from "lucide-react";
import KeyHolder from "./KeyHolder";

const NewRequest = ({ setUploadDone }) => {
  const { files, clearFiles } = useFile();
  const { key, removeKey } = useKey();
  const handleNewRequest = () => {
    sessionStorage.removeItem("page");
    clearFiles();
    removeKey();
    setUploadDone(false);
  };
  return (
    <div className="flex flex-col items-center justify-center  p-6 space-y-4">
      <p className="text-green-400 text-lg font-semibold">Upload complete!</p>
      {/* <ul className=" p-2 text-white font-mono text-sm">
        {files.map((file) => (
          <li
            key={file.fileInfo.id}
            className="flex items-center justify-center space-x-2"
          >
            <span>{file.fileInfo.name}</span>
            {file.state.status === "success" ? (
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-green-500">
                <Check className="text-white" size={12} />
              </span>
            ) : (
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-red-500">
                <X className="text-white" size={12} />
              </span>
            )}
          </li>
        ))}
      </ul> */}
      {key && <KeyHolder />}
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
