import { useFile } from "../contexts/FileContext";
import { useEffect, useRef } from "react";
import ProgressBar from "./ui/ProgressBar";
import { useDropzone } from "react-dropzone";
import { generateFileObj } from "../utils/fileObj";
import { useSessionContext } from "../contexts/SessionContext";
import toast from "react-hot-toast";
const FileList = ({ retry }) => {
  const { files, addFile, removeFile } = useFile();
  const { sessionInfo } = useSessionContext();
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (droppedFiles) => {
      if (sessionInfo.uploadStatus !== "idle") {
        toast.error("Files can only be added before upload");
        return;
      }
      const fileList = Array.from(droppedFiles);
      for (const f of fileList) {
        const file = generateFileObj(f);
        addFile(file);
      }
    },
    multiple: true,
    onClick: false,
    noClick: true,
    noKeyboard: true,
  });

  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [files]);
  return (
    <div
      {...getRootProps()}
      className={`p-4 h-100 sm:h-60 overflow-auto border 
    ${
      isDragActive && sessionInfo.uploadStatus === "idle"
        ? "border-dashed border-[#5c5c5cff] "
        : "border-solid border-neutral-900"
    }
       rounded-lg`}
    >
      <input {...getInputProps()} />
      <ul className="space-y-2 ">
        {files.length === 0 && (
          <li className="text-xs sm:text-sm text-neutral-500">
            <p>Press + to add files or</p>
            <p>Drag and Drop files</p>
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
        {files.length > 0 && sessionInfo.uploadStatus === "idle" && (
          <div
            ref={endRef}
            className="text-center text-[#5c5c5cff] text-xs sm:text-sm text-neutral-500"
          >
            {isDragActive ? "Drop files here" : "Drag and drop files.."}
          </div>
        )}
      </ul>
    </div>
  );
};

export default FileList;
