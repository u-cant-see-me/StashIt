import { useState, useRef } from "react";
import { Download } from "lucide-react";
import { PulseLoader } from "react-spinners";
import toast from "react-hot-toast";
import Modal from "./Modal";
import ProgressBar from "./ui/ProgressBar";
import { RenderPreview } from "./RenderPreview";
import { FileIcon } from "./ui/FileIcon";
import { useSessionContext } from "../contexts/SessionContext";

const DownloadList = () => {
  const [currFileDownloading, setCurrFileDownloading] = useState(null);
  const [progress, setProgress] = useState({});
  const [isConnecting, setIsConnecting] = useState(false);
  const preview = useRef(null);
  const [open, setOpen] = useState(false);
  const { downloadUrls: files } = useSessionContext();
  const handlePreview = (file) => {
    if (file.id === currFileDownloading) return null;
    setOpen(true);
    preview.current = file;
  };
  const handleDownload = async (id) => {
    const file = files.find((f) => f.id === id);
    console.log(file.downloadUrl);
    if (!file) return;

    try {
      setCurrFileDownloading(file.id);
      setIsConnecting(true);
      setProgress({ id: file.id, percent: 0 });

      const res = await fetch(file.downloadUrl);
      if (!res.ok) throw new Error("failed to fetch file");

      const contentLength = res.headers.get("Content-Length");
      if (!contentLength) {
        console.warn("No content length headers , cannot track progress");
      } else {
        setIsConnecting(false);
      }

      const total = parseInt(contentLength, 10);
      let loaded = 0;

      const reader = res.body.getReader();
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        chunks.push(value);
        loaded += value.length;

        if (total) {
          const percent = Math.round((loaded / total) * 100);
          console.log(percent);
          setProgress((prev) => ({ ...prev, percent }));
        }
      }

      const blob = new Blob(chunks);
      console.log("blob", blob);

      const url = window.URL.createObjectURL(blob);
      console.log("url", url);

      const a = document.createElement("a");
      a.href = url;
      a.download = file.name || "download";
      document.body.appendChild(a);

      a.click();
      a.remove();

      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error(`Download failed: ${error.message}`);
      toast.error(`Download failed: ${error.message}`);
    } finally {
      setCurrFileDownloading(null);
      setProgress({});
      setIsConnecting(false);
    }
  };
  return (
    <div className=" h-100 p-4 border-b border-neutral-900">
      <ul className="flex flex-col  items-center h-full  overflow-auto">
        {files.map((file) => (
          <li
            key={file.id}
            className="relative w-full lg:w-[70%] flex items-center justify-between text-sm font-mono border-b p-4
                 border-neutral-900
 "
            onClick={() => handlePreview(file)}
          >
            <div className="min-w-0">
              <p className="truncate text-neutral-300">{file.name}</p>
              <p className="flex gap-2 text-neutral-500">
                <span>{file.formattedSize.size}</span>
                <span className="flex items-center justify-center">
                  <FileIcon type={file.type} />
                </span>
              </p>
            </div>
            <span className="flex items-center justify-center">
              {currFileDownloading !== file.id ? (
                <button
                  type="button "
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(file.id);
                  }}
                  disabled={currFileDownloading === file.id}
                >
                  <Download color="#c0c0c0ff" size={20} />
                </button>
              ) : isConnecting ? (
                <PulseLoader color="#ffffff" size={5} />
              ) : (
                <span className="text-sm text-green-400">
                  {progress.percent}%
                </span>
              )}
            </span>
            {currFileDownloading === file.id && (
              <ProgressBar percent={progress.percent} />
            )}
          </li>
        ))}
      </ul>
      {open && (
        <Modal onClose={() => setOpen(false)} preview={true}>
          <RenderPreview preview={preview} />
        </Modal>
      )}
    </div>
  );
};

export default DownloadList;
