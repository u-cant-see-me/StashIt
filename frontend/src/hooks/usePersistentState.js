import { useEffect, useState } from "react";

const usePersistentState = (key, defaultValue) => {
  const [state, setState] = useState(() => {
    const stored = sessionStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  });

  useEffect(() => {
    sessionStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
};

export default usePersistentState;
