import { useEffect, useState } from "react";
import DownloadList from "./DownloadList";
import { useDownload } from "../hooks/UseDownload";
import { useDebounce } from "../hooks/UseDebounce";
import { useSessionContext } from "../contexts/SessionContext";
const Download = () => {
  const [stashKey, setStashKey] = useState("");
  const { isLoading, error, sendRequest } = useDownload();
  const debouncedKey = useDebounce(stashKey, 1000);
  const { downloadUrls } = useSessionContext();

  const handleInputKey = (event) => {
    setStashKey(event.target.value.trim());
  };
  useEffect(() => {
    sendRequest(debouncedKey);
  }, [debouncedKey, sendRequest]);

  return (
    <div className="w-full">
      <div className="flex flex-col items-center justify-center w-full ">
        <div className=" flex  items-center justify-center  w-full md:w-[50%] ">
          <input
            type="text"
            placeholder="enter-stash-key"
            onChange={handleInputKey}
            value={stashKey}
            className="
              flex-2 m-2 
              max-w-md
              px-0
              py-2
              text-sm sm:text-base
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
          {/* <span className="flex flex-1 items-center justify-center">
            <button
              type="button"
              // onClick={downloadAll}
              className="text-xs sm:text-sm text-neutral-500 bg-neutral-900 px-2 py-1 rounded-md hover:text-neutral-400 "
            >
              Download All
            </button>
          </span> */}
        </div>
        <div className="text-sm mb-2">
          {isLoading && <span className="text-neutral-600">Searching ...</span>}
          {error && <span className="text-neutral-500">{error}</span>}
        </div>
      </div>
      <div>{downloadUrls && downloadUrls.length > 0 && <DownloadList />}</div>
    </div>
  );
};

export default Download;
