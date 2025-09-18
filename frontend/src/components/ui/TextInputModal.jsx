const TextInputModal = ({ titleRef, contentRef, setShowModal, handleSave }) => {
  return (
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
  );
};

export default TextInputModal;
