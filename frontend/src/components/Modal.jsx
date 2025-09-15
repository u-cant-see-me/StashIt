import { createPortal } from "react-dom";
const modalRoot = document.getElementById("modal-root");

const Modal = ({ children, onClose, preview }) => {
  if (!modalRoot) return null;
  return createPortal(
    <div className=" fixed inset-0 flex items-center justify-center bg-black/50">
      {preview ? (
        <div className="bg-white text-black rounded-lg p-6 relative">
          {children}
          <button
            onClick={onClose}
            className="mt-4 px-3 py-1 bg-red-500 text-white rounded"
          >
            Close
          </button>
        </div>
      ) : (
        <> {children}</>
      )}
    </div>,
    modalRoot
  );
};

export default Modal;
