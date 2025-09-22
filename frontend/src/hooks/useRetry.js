import { useState } from "react";
import axios from "axios";

export const useRetry = () => {
  const url = `${import.meta.env.VITE_BASE_URL}/api/file/retry`;
  const [isConnecting, setIsConnecting] = useState(false);
  const retryRequest = async (filePaths) => {
    try {
      console.log("fp", filePaths);

      setIsConnecting(true);
      const res = await axios.post(url, { file_paths: filePaths });
      const { signedUrl } = await res.data;
      console.log(signedUrl);
      return signedUrl;
    } catch (error) {
      console.error(error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  return { retryRequest, isConnecting };
};
