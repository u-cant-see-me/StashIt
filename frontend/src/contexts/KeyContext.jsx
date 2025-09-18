import { createContext, useContext, useState } from "react";
import usePersistentState from "../hooks/usePersistentState";

const KeyContext = createContext();

export const KeyProvider = ({ children }) => {
  const [key, setKey] = usePersistentState(null);
  const [downloadKey, setDownloadKey] = useState("");
  const addKey = (key) => {
    setKey(key);
  };
  const removeKey = () => {
    setKey(null);
  };
  const addDownloadKey = (key) => {
    setDownloadKey(key);
  };
  const removeDownloadKey = () => {
    setDownloadKey(null);
  };
  return (
    <KeyContext.Provider
      value={{
        key,
        addKey,
        removeKey,
        downloadKey,
        addDownloadKey,
        removeDownloadKey,
      }}
    >
      {children}
    </KeyContext.Provider>
  );
};
export const useKey = () => {
  return useContext(KeyContext);
};
