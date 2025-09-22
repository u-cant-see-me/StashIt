import { createContext, useContext } from "react";
import usePersistentState from "../hooks/UsePersistentState";

const KeyContext = createContext();

export const KeyProvider = ({ children }) => {
  const [key, setKey] = usePersistentState("key", null);
  const addKey = (key) => {
    setKey(key);
  };
  const removeKey = () => {
    setKey(null);
  };

  return (
    <KeyContext.Provider
      value={{
        key,
        addKey,
        removeKey,
      }}
    >
      {children}
    </KeyContext.Provider>
  );
};
export const useKey = () => {
  return useContext(KeyContext);
};
