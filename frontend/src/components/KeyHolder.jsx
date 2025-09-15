import { useState } from "react";
import { useKey } from "../contexts/KeyContext";
import toast from "react-hot-toast";
import { Check, Copy } from "lucide-react";
const KeyHolder = () => {
  const { key } = useKey();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    if (key && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(key);
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
    <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-neutral-100 text-neutral-900 shadow-sm">
      <span className="font-mono text-sm truncate">{key}</span>

      <button
        type="button"
        onClick={copyToClipboard}
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
    </div>
  );
};

export default KeyHolder;
