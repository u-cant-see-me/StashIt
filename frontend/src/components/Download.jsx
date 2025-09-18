import { useEffect, useState } from "react";
import DownloadList from "./DownloadList";
import { useDownload } from "../hooks/UseDownload";
import { useDebounce } from "../hooks/useDebounce";
import { useKey } from "../contexts/KeyContext";

const Download = () => {
  const [stashKey, setStashKey] = useState("");
  const { data, isLoading, error, sendRequest } = useDownload();
  const { downloadKey } = useKey();
  const debouncedKey = useDebounce(stashKey, 1000);

  const handleInputKey = (event) => {
    setStashKey(event.target.value.trim());
  };
  useEffect(() => {
    sendRequest(debouncedKey);
  }, [debouncedKey, sendRequest]);

  return (
    <div className="md:p-10 w-full">
      <div className="flex flex-col items-center justify-center w-full ">
        <div className=" flex  items-center justify-center pt-4  md:p-4 w-[70%] md:w-[50%]">
          <input
            type="text"
            placeholder="enter-stash-key"
            onChange={handleInputKey}
            value={stashKey}
            className="
              w-full m-2 
              max-w-md
              px-0
              py-2
              bg-transparent
              border-b
              border-neutral-700
              text-neutral-200
              placeholder-neutral-500
              focus:outline-none
              focus:border-green-400
              transition
              duration-200
            "
          />
        </div>
        <div className="text-sm mb-2">
          {isLoading && <span className="text-neutral-600">Searching ...</span>}
          {error && <span className="text-neutral-500">{error}</span>}
        </div>
      </div>
      <div>{data && data.length > 0 && <DownloadList files={data} />}</div>
    </div>
  );
};

export default Download;
