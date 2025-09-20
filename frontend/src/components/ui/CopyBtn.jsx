import { useState } from "react";
import toast from "react-hot-toast";
import { Check, Copy } from "lucide-react";
const CopyBtn = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text) => {
    if (text && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
        toast.success("copied to clipboard ");
      } catch (error) {
        console.error(error.message);
        toast.error("failed to copy ");
      }
    }
  };

  return (
    <button
      type="button"
      onClick={() => copyToClipboard(text)}
      className="flex items-center gap-1 px-3 py-1 rounded-lg border border-neutral-300 hover:bg-neutral-200 transition"
    >
      {copied ? (
        <>
          <Check size={16} /> <span className="text-xs">Copied!</span>
        </>
      ) : (
        <>
          <Copy size={16} /> <span className="text-xs">Copy</span>
        </>
      )}
    </button>
  );
};

export default CopyBtn;
