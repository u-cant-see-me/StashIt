import { useEffect, useState } from "react";
import CopyBtn from "./ui/CopyBtn";
export const RenderPreview = ({ preview }) => {
  const { type, downloadUrl } = preview.current;
  const [text, setText] = useState("");

  useEffect(() => {
    const fetchText = async () => {
      if (type.includes("text")) {
        const res = await fetch(downloadUrl);
        if (!res.ok) console.error("error in loading file");
        const text = await res.text();
        setText(text);
      }
    };
    fetchText();
  }, [type, downloadUrl]);

  if (type.includes("image")) {
    return (
      <img
        src={downloadUrl}
        alt="preview"
        className="max-w-full  max-h-[80vh] object-contain rounded"
      />
    );
  }

  if (type.includes("video")) {
    return (
      <video
        src={downloadUrl}
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
      <audio
        src={downloadUrl}
        className="max-w-full"
        controls
        autoPlay
        loop
        muted
      />
    );
  }

  if (type.includes("pdf")) {
    return <iframe src={downloadUrl} className="w-[50vw] h-[75vh]" />;
  }
  if (type.includes("text")) {
    const extractText = async () => {
      const res = await fetch(downloadUrl);
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

  return null;
};
