import { useSessionContext } from "../contexts/SessionContext";

const Nav = () => {
  const { sessionInfo, setSessionInfo } = useSessionContext();
  const setToUpload = () =>
    setSessionInfo((prev) => ({ ...prev, page: "main" }));
  const setToDownload = () =>
    setSessionInfo((prev) => ({ ...prev, page: "download" }));
  const underline = `absolute bottom-0 left-1/2 w-0 h-[2px] bg-black
      transform -translate-x-1/2 origin-center transition-all duration-300 ease-in-out `;
  return (
    <div className="font-monoton flex items-center p-4">
      <div className="text-xl sm:text-2xl flex-1">Stash It ..</div>

      {/* Center Nav */}
      <div className="flex-1 flex justify-center">
        <ul className="flex space-x-6 cursor-pointer text-sm sm:text-lg">
          <li className="relative group">
            <button type="button" onClick={setToUpload}>
              Upload
            </button>
            <span
              className={`${underline} ${
                sessionInfo.page === "main" ? "scale-x-100 w-full" : "scale-x-0"
              }`}
            />
          </li>
          <li className="relative group">
            <button type="button" onClick={setToDownload}>
              Download
            </button>
            <span
              className={`${underline} ${
                sessionInfo.page === "download"
                  ? "scale-x-100 w-full"
                  : "scale-x-0"
              }`}
            />
          </li>
        </ul>
      </div>

      {/* Right side empty spacer */}
      <div className="hidden md:flex flex-1"></div>
    </div>
  );
};

export default Nav;
