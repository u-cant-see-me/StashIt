import { createContext, useContext, useState } from "react";
import usePersistentState from "../hooks/usePersistentState";

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [sessionInfo, setSessionInfo] = usePersistentState("sessionInfo", {
    uploadStatus: "idle",
    page: "main",
    newRequest: false,
    error: null,
  });
  const [downloadUrls, setDownloadUrls] = useState([]);

  return (
    <SessionContext.Provider
      value={{ sessionInfo, setSessionInfo, downloadUrls, setDownloadUrls }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSessionContext = () => {
  return useContext(SessionContext);
};
