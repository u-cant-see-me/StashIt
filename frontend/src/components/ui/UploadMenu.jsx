const UploadMenu = ({ menuRef, fileInputRef, handleChange, setShowModal }) => {
  return (
    <div
      ref={menuRef}
      className="absolute z-11 top-0 right-0 transform -translate-x-10 md:translate-x-24 translate-y-4"
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
      </ul>
    </div>
  );
};

export default UploadMenu;
