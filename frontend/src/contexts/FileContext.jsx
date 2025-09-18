import { createContext, useContext } from "react";
import usePersistentState from "../hooks/usePersistentState";

const FileContext = createContext();

export const FileProvider = ({ children }) => {
  const [files, setFile] = usePersistentState("uploads", []);
  const [expiry, setExpiry] = usePersistentState("expiry", "once");

  const addFile = (file) => {
    setFile((prev) => [...prev, file]);
  };

  const removeFile = (id) => {
    setFile((prev) =>
      prev.filter((file) => {
        if (file.fileInfo.id !== id) return file;
      })
    );
  };

  const clearFiles = () => {
    setFile([]);
  };

  const updateState = (update, id) => {
    setFile((prev) => {
      const updatedFile = prev.map((file) => {
        if (file.fileInfo.id === id) {
          file.state = { ...file.state, ...update };
        }
        return file;
      });
      return updatedFile;
    });
  };

  return (
    <FileContext.Provider
      value={{
        files,
        addFile,
        removeFile,
        updateState,
        clearFiles,
        setExpiry,
        expiry,
      }}
    >
      {children}
    </FileContext.Provider>
  );
};

export const useFile = () => {
  return useContext(FileContext);
};
