import { useState, useRef, useEffect } from "react";

export const useIndexedDb = () => {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const dbRef = useRef(null);

  useEffect(() => {
    const request = indexedDB.open("stash", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      const store = db.createObjectStore("file", { keyPath: "id" });
      store.createIndex("file_obj", "fileObj", { unique: false });
      dbRef.current = db;
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      dbRef.current = db;
      setConnected(true);
      console.log("Database Opened Successfully!", db);
    };

    request.onerror = (event) => {
      setError(event.target.error);
      console.error("Error in setting up indexedDb", event.target.error);
    };
  }, []);

  const addFileIdb = (item) => {
    if (!dbRef.current) {
      console.error("Database not ready!");
      return;
    }

    const transaction = dbRef.current.transaction(["file"], "readwrite");
    const store = transaction.objectStore("file");
    const request = store.add(item);

    request.onsuccess = () => console.log("successfully added item!", item);
    request.onerror = () => console.error("could not add item!", item);
  };

  const getAllFileIdb = () => {
    return new Promise((resolve, reject) => {
      if (!dbRef.current) {
        console.error("Database not ready !");
        reject("Database not ready");
        return;
      }
      const transaction = dbRef.current.transaction(["file"], "readonly");
      const store = transaction.objectStore("file");
      const request = store.getAll();

      request.onsuccess = () => {
        console.log("fetched all files", request.result);
        resolve(request.result);
      };
      request.onerror = () => {
        console.error("Error fetching files:", request.error);
        reject(request.error);
      };
    });
  };

  const removeFileIdb = (id) => {
    return new Promise((resolve, reject) => {
      if (!dbRef.current) {
        console.error("Database not ready !");
        reject("Database not ready");
        return;
      }
      const transaction = dbRef.current.transaction(["file"], "readwrite");
      const store = transaction.objectStore("file");
      const request = store.delete(id);

      request.onsuccess = () => resolve(id);
      request.onerror = (event) => reject(event.target.error);
    });
  };

  const clearAllFilesIdb = () => {
    return new Promise((resolve, reject) => {
      if (!dbRef.current) {
        console.error("Database not ready !");
        reject("Database not ready");
        return;
      }
      const transaction = dbRef.current.transaction(["file"], "readwrite");
      const store = transaction.objectStore("file");
      const request = store.clear();

      request.onsuccess = () => resolve(true);
      request.onerror = (event) => reject(event.target.error);
    });
  };
  return {
    addFileIdb,
    getAllFileIdb,
    removeFileIdb,
    clearAllFilesIdb,
    connected,
    error,
  };
};
