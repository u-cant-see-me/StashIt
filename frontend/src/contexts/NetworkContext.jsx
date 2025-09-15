import { useState, useEffect, createContext, useContext } from "react";

const NetworkStatusContext = createContext(true);
export const useNetworkStatus = () => useContext(NetworkStatusContext);

const NetworkProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);

  useEffect(() => {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-950 text-neutral-200">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">📡 No Internet Connection</h1>
          <p className="text-neutral-400">Check your network and try again.</p>
        </div>
      </div>
    );
  }
  return (
    <NetworkStatusContext.Provider value={isOnline}>
      {children}
    </NetworkStatusContext.Provider>
  );
};

export default NetworkProvider;
