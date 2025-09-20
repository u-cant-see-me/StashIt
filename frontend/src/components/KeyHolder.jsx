import { useKey } from "../contexts/KeyContext";
import CopyBtn from "./ui/CopyBtn";

const KeyHolder = () => {
  const { key } = useKey();

  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-neutral-100 text-neutral-900 shadow-sm">
      <span className="font-mono text-sm truncate">{key}</span>
      <CopyBtn text={key} />
    </div>
  );
};

export default KeyHolder;
