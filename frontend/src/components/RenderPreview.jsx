import { useEffect, useRef, useState } from "react";
import CopyBtn from "./ui/CopyBtn";
import toast from "react-hot-toast";
import { renderAsync } from "docx-preview";
import { isDocx } from "../utils/utils";
export const RenderPreview = ({ preview, setOpen }) => {
  const { type, url } = preview.current;
  const [text, setText] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchText = async () => {
      if (type.includes("text")) {
        const res = await fetch(url);
        if (!res.ok) console.error("error in loading file");
        const text = await res.text();
        setText(text);
      }
    };
    const extractBuffer = async () => {
      if (Object.keys(preview.current).includes("file")) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async (e) => resolve(e.target.result);
          reader.onerror = (err) => reject(err);
          reader.readAsArrayBuffer(preview.current.file.fileObj);
        });
      } else {
        const res = await fetch(url);
        if (!res.ok) return console.error("Error fetching DOCX");
        return await res.arrayBuffer();
      }
    };
    const renderDoc = async (buffer) => {
      containerRef.current.innerHTML = "";
      await renderAsync(buffer, containerRef.current, null, {
        className: "docx",
        inWrapper: true,
        ignoreWidth: false,
        ignoreHeight: false,
        breakPages: true,
      });
    };
    const loadFiles = async () => {
      try {
        if (type.includes("text")) await fetchText();

        if (isDocx(type)) {
          const buffer = await extractBuffer();
          renderDoc(buffer);
        }
      } catch (error) {
        console.error(error.message);
      }
    };
    loadFiles();
  }, [type, url]);

  if (type.includes("image")) {
    return (
      <img
        src={url}
        alt="preview"
        className="max-w-full  max-h-[80vh] object-contain rounded"
      />
    );
  }

  if (type.includes("video")) {
    return (
      <video
        src={url}
        className="max-w-full  max-h-[80vh] object-contain rounded"
        controls
        autoPlay
        loop
        muted
      />
    );
  }

  if (type.includes("audio")) {
    return (
      <audio src={url} className="max-w-full" controls autoPlay loop muted />
    );
  }

  if (type.includes("pdf")) {
    return (
      <iframe
        src={url}
        className="w-[90vw] h-[60vh] md:w-[80vw]  lg:w-[50vw] lg:h-[75vh]"
      />
    );
  }
  if (type.includes("text")) {
    const extractText = async () => {
      const res = await fetch(url);
      if (!res.ok) console.error("couldnt fetch file data");

      const text = await res.text();
      console.log(text);
    };
    extractText();
    return (
      <div className="relative  w-[70vw] md:w-[50vw] h-[60vh]">
        <div className="h-full bg-black text-white border border-gray-200 rounded-md font-mono overflow-auto whitespace-pre-wrap p-2">
          {text}
        </div>
        <span className="absolute right-0 bottom-0 translate-y-10">
          <CopyBtn text={text} />
        </span>
      </div>
    );
  }

  if (isDocx(type)) {
    return (
      <div className="relative w-[90vw] h-[60vh] md:w-[80vw]  lg:w-[50vw] lg:h-[75vh] overflow-auto">
        <div ref={containerRef} className="absolute inset-0"></div>
      </div>
    );
  }
  setOpen(false);
  toast.error("preview not available");
  return null;
};
