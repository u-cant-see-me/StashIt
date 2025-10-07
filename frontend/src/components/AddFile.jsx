import { convertToFile, getDate } from "../utils/utils";
import { useFile } from "../contexts/FileContext";
import { useState, useRef, useEffect } from "react";
import Modal from "./Modal";
import toast from "react-hot-toast";
import UploadMenu from "./ui/UploadMenu";
import TextInputModal from "./ui/TextInputModal";
import { Plus } from "lucide-react";
import { generateFileObj } from "../utils/fileObj";

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
      const updatedFile = generateFileObj(file);
      addFile(updatedFile);
    }
  };

  const handleSave = () => {
    const content = contentRef.current.value;
    if (content) {
      const title = titleRef.current.value || "Untitled-" + getDate();
      const file = convertToFile(content, title.trim());
      const snippet = generateFileObj(file);
      addFile(snippet);
      setShowModal(false);
    } else {
      toast.error("Text content can not be empty");
    }
  };

  const sonarWave =
    "animate-sonar absolute w-full h-full rounded-full opacity-0 bg-white";

  return (
    <div className="md:absolute md:top-0 md:left-0 relative">
      {/* Desktop trigger */}
      <input
        type="file"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={handleChange}
      />
      <div
        className="hidden lg:block relative h-20 w-20"
        onClick={() => setShowMenu((prev) => !prev)}
      >
        <div className={`${sonarWave} sonar-delay-1 z-0`}></div>
        <div className={`${sonarWave} sonar-delay-2 z-0`}></div>
        <div className={`${sonarWave} sonar-delay-3 z-0`}></div>

        <div className="absolute cursor-pointer inset-0 flex items-center justify-center bg-white text-black rounded-full z-10">
          <span>
            <Plus size={25} />
          </span>
        </div>
      </div>

      {/* Mobile trigger */}
      <button
        type="button"
        className="lg:hidden bg-white text-black outline-none w-10 h-10 rounded-lg"
        onClick={() => setShowMenu((prev) => !prev)}
      >
        <span className="text-xl">+</span>
      </button>

      {showMenu && (
        <UploadMenu
          menuRef={menuRef}
          fileInputRef={fileInputRef}
          setShowModal={setShowModal}
        />
      )}

      {showModal && (
        <Modal onClose={() => setShowModal(false)} preview={false}>
          <TextInputModal
            titleRef={titleRef}
            contentRef={contentRef}
            setShowModal={setShowModal}
            handleSave={handleSave}
          />
        </Modal>
      )}
    </div>
  );
};

export default AddFile;
