import { useEffect, useState, useRef } from "react";
import { getDate, convertToFile } from "../../utils/utils";
import { generateFileObj } from "../../utils/fileObj";
import { useFile } from "../../contexts/FileContext";
import toast from "react-hot-toast";
const TextEditModal = ({ file, setShowModal }) => {
  const [title, setTitle] = useState(file.fileInfo.name);
  const [content, setContent] = useState("");
  const originalValue = useRef(null);
  const { addFile, removeFile } = useFile();
  useEffect(() => {
    if (!file?.fileObj) return;
    const processFile = async () => {
      const textContent = await file.fileObj.text();
      originalValue.current = {
        title,
        content: textContent.trim(),
      };
      setContent(textContent.trim());
    };
    processFile();
  }, [file]);

  const handleSave = () => {
    if (
      originalValue.current.title === title.trim() &&
      originalValue.current.content === content.trim()
    ) {
      setShowModal(false);
      return null;
    }
    removeFile(file.fileInfo.id);
    if (content) {
      const titlef = title || "Untitled-" + getDate();
      const file = convertToFile(content, titlef.trim());
      const snippet = generateFileObj(file);
      addFile(snippet);
      setShowModal(false);
      toast.success("file successfully edited");
    } else {
      toast.error("Text content can not be empty");
    }
  };
  return (
    <div className="w-[28rem] bg-white rounded-2xl shadow-2xl p-6 flex flex-col gap-4 animate-fadeIn">
      <h2 className="text-xl font-semibold text-gray-800">
        <input
          type="text"
          name="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="border-b border-gray-300 w-full outline-none"
        />
      </h2>

      <textarea
        name="text"
        rows="6"
        placeholder="Write something here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        autoFocus
        className="w-full min-h-50 sm:min-h-70 text-base resize-none p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-800"
      />

      <div className="flex justify-end gap-3">
        <button
          type="button"
          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 transition"
          onClick={() => setShowModal(false)}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default TextEditModal;
