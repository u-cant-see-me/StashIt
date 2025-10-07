import { useFile } from "../contexts/FileContext";
import { useEffect, useRef, useState } from "react";
import ProgressBar from "./ui/ProgressBar";
import { useDropzone } from "react-dropzone";
import { generateFileObj } from "../utils/fileObj";
import { useSessionContext } from "../contexts/SessionContext";
import toast from "react-hot-toast";
import Modal from "./Modal";
import { RenderPreview } from "./RenderPreview";
import { FileIcon } from "./ui/FileIcon";
import TextEditModal from "./ui/TextEditModal";
import { isDocx } from "../utils/utils";
const FileList = ({ retry }) => {
  const { files, addFile, removeFile, clearFiles } = useFile();
  const { sessionInfo } = useSessionContext();
  const [open, setOpen] = useState(false);
  const preview = useRef(null);
  const [openTextEditor, setOpenTextEditor] = useState(false);

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

  const handlePreview = (f) => {
    preview.current = {
      type: f.fileInfo.type,
      url: URL.createObjectURL(f.fileObj),
    };
    if (
      sessionInfo.uploadStatus === "idle" &&
      f.fileInfo.type.includes("text")
    ) {
      setOpenTextEditor(true);
      preview.current.file = f;
    } else if (isDocx(f.fileInfo.type)) {
      setOpen(true);
      preview.current.file = f;
    } else {
      setOpen(true);
    }
  };
  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [files]);
  return (
    <div
      {...getRootProps()}
      className={`p-4 h-50 sm:h-60 overflow-auto border 
    ${
      isDragActive && sessionInfo.uploadStatus === "idle"
        ? "border-dashed border-[#5c5c5cff] bg-gray-900/40 "
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
            onClick={() => handlePreview(file)}
          >
            <div className="min-w-0 w-full space-y-2">
              <p className="truncate text-sm max-w-[95%] font-medium text-neutral-300">
                {file.fileInfo.name}
              </p>
              <p
                className={`flex gap-2 text-xs ${
                  file.fileInfo.formattedSize.valid
                    ? "text-neutral-500"
                    : "text-red-400"
                }`}
              >
                {file.fileInfo.formattedSize.size}
                <span>
                  <FileIcon type={file.fileInfo.type} />
                </span>
              </p>
            </div>
            <span className="flex-1 flex items-center justify-end">
              {file.state.status === "pending" ? (
                <button
                  className="text-neutral-500 hover:text-red-400 text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.fileInfo.id);
                  }}
                >
                  ✕
                </button>
              ) : file.state.status !== "uploading" ? (
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
            className="flex justify-between text-xs sm:text-sm text-neutral-500"
          >
            <span className="flex-1" />
            <p className="flex-1">
              {isDragActive ? "Drop files here" : "Drag and drop files.."}
            </p>
            <span>
              <button
                type="button"
                className="flex-1 bg-neutral-900 px-2 py-1 rounded-md hover:text-neutral-400 "
                onClick={() => clearFiles()}
              >
                Clear
              </button>
            </span>
          </div>
        )}
      </ul>
      {open && (
        <Modal onClose={() => setOpen(false)} preview={true}>
          <RenderPreview preview={preview} setOpen={setOpen} />
        </Modal>
      )}
      {openTextEditor && (
        <Modal onClose={() => setOpen(false)} preview={false}>
          <TextEditModal
            file={preview.current.file}
            setShowModal={setOpenTextEditor}
          />
        </Modal>
      )}
    </div>
  );
};

export default FileList;
