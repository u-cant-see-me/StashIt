import { convertToFile, formatBytes, getDate } from "../utils/utils";
import { useFile } from "../contexts/FileContext";
import { nanoid } from "nanoid";
import { useState, useRef, useEffect } from "react";
import Modal from "./Modal";
import toast from "react-hot-toast";

const AddFile = () => {
  const { addFile } = useFile();
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const titleRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    const fileArr = Array.from(e.target.files);

    for (const file of fileArr) {
      const updatedFile = {
        fileInfo: {
          id: nanoid(8),
          name: file.name,
          type: file.type
            ? file.type
            : file.name.split(".").length > 1
            ? file.name.split(".").pop()
            : "Unknown",
          size: file.size,
          formattedSize: formatBytes(file.size),
        },
        fileObj: file,
        state: {
          status: "pending", //"pending" | "uploading" | "success" | "error"
          progress: 0,
          error: null, // last recorded error
          aborted: false,
          uploadUrl: null,
        },
      };

      addFile(updatedFile);
    }
  };
  const handleSave = () => {
    const content = contentRef.current.value;
    if (content) {
      const title = titleRef.current.value || "Untitled-" + getDate();
      const file = convertToFile(content, title.trim());
      const snippet = {
        fileInfo: {
          id: nanoid(8),
          name: file.name,
          type: file.type,
          size: file.size,
          formattedSize: formatBytes(file.size),
        },
        fileObj: file,
        state: {
          status: "pending", //"pending" | "uploading" | "success" | "error"
          progress: 0,
          error: null, // last recorded error
          aborted: false,
          uploadUrl: null,
        },
      };
      addFile(snippet);
      setShowModal(false);
    } else {
      toast.error("Text content can not be empty");
    }
  };
  const sonarWave =
    "animate-sonar absolute w-full h-full rounded-full opacity-0 bg-white";

  return (
    <div className="absolute top-0 left-0">
      <div
        className="relative h-20 w-20 "
        onClick={() => setShowMenu((prev) => !prev)}
      >
        {/* Waves outside */}
        <div className={`${sonarWave} sonar-delay-1 z-0`}></div>
        <div className={`${sonarWave} sonar-delay-2 z-0`}></div>
        <div className={`${sonarWave} sonar-delay-3 z-0`}></div>

        {/* Circle button */}
        <div className="absolute inset-0 flex items-center justify-center bg-white text-black rounded-full z-10 ">
          <span className="text-3xl">+</span>
          {showMenu && (
            <div
              ref={menuRef}
              className="absolute top-0 right-0 transform translate-x-24 translate-y-4"
            >
              <ul className="w-40 bg-neutral-900 text-white rounded-xl shadow-lg overflow-hidden animate-fadeIn">
                <li
                  className="px-4 py-3 flex items-center gap-2 hover:bg-neutral-700 cursor-pointer transition"
                  onClick={() => {
                    fileInputRef.current.click();
                  }}
                >
                  📁 <span>Files</span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleChange}
                  />
                </li>
                <li
                  className="px-4 py-3 flex items-center gap-2 hover:bg-neutral-700 cursor-pointer transition"
                  onClick={() => setShowModal(true)}
                >
                  📝 <span>Text</span>
                </li>
                <li className="px-4 py-3 flex items-center gap-2 hover:bg-neutral-700 cursor-pointer transition">
                  💻 <span>Code</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      {showModal && (
        <Modal onClose={() => setShowModal(false)} preview={false}>
          <div className="w-[28rem] bg-white rounded-2xl shadow-2xl p-6 flex flex-col gap-4 animate-fadeIn">
            <h2 className="text-xl font-semibold text-gray-800">
              <input
                type="text"
                name="text"
                placeholder="Title"
                ref={titleRef}
                className="border-b border-gray-300 w-full outline-none"
              />
            </h2>

            <textarea
              name="text"
              rows="6"
              placeholder="Write something here..."
              ref={contentRef}
              autoFocus
              className="w-full resize-none p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-800"
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
        </Modal>
      )}
    </div>
  );
};

export default AddFile;
