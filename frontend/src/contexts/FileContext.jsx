import { createContext, useContext, useEffect } from "react";
import usePersistentState from "../hooks/usePersistentState";
import { useIndexedDb } from "../hooks/useIndexedDb";

const FileContext = createContext();

export const FileProvider = ({ children }) => {
  const [files, setFile] = usePersistentState("uploads", []);
  const [expiry, setExpiry] = usePersistentState("expiry", "once");
  const {
    addFileIdb,
    getAllFileIdb,
    removeFileIdb,
    clearAllFilesIdb,
    connected,
  } = useIndexedDb();

  useEffect(() => {
    if (!connected) return;

    const fetchAllfiles = async () => {
      if (files.length === 0) {
        await clearAllFilesIdb();
        return;
      }
      const fileObjs = await getAllFileIdb();
      setFile((prev) => {
        const updated = prev.map((f) => {
          const obj = fileObjs.find((obj) => f.fileInfo.id === obj.id);
          return obj ? { ...f, fileObj: obj.fileObj } : f;
        });
        return updated;
      });
    };
    fetchAllfiles();
  }, [connected]);

  const addFile = (file) => {
    setFile((prev) => [...prev, file]);
    if (connected) {
      addFileIdb({ id: file.fileInfo.id, fileObj: file.fileObj });
    }
  };

  const removeFile = async (id) => {
    await removeFileIdb(id);

    setFile((prev) =>
      prev.filter((file) => {
        if (file.fileInfo.id !== id) return file;
      })
    );
  };

  const clearFiles = async () => {
    await clearAllFilesIdb();
    setFile([]);
  };

  const updateState = (update, id) => {
    setFile((prev) => {
      let found = false;

      const updatedFile = prev.map((file) => {
        if (file.fileInfo.id === id) {
          found = true;
          return {
            ...file,
            state: { ...file.state, ...update },
          };
        }
        return file;
      });

      if (!found) {
        console.warn(`updateState: no file found with id ${id}`);
      }

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
