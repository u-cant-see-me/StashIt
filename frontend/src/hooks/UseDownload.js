import { useCallback, useState } from "react";
import axios from "axios";
import { isValidStashKey } from "../utils/utils";
import { useKey } from "../contexts/KeyContext";

export const useDownload = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addDownloadKey } = useKey();

  const sendRequest = useCallback(async (stashKey) => {
    if (isValidStashKey(stashKey)) {
      const url = `${import.meta.env.VITE_BASE_URL}/api/file/download`;

      setIsLoading(true);
      setError(null);

      try {
        const res = await axios.get(url, { params: { stashKey } });
        const { downloadUrls } = await res.data;
        setData(downloadUrls);
        setIsLoading(false);
        addDownloadKey(stashKey);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response) {
            // Server responded with an error
            console.error("Error status:", error.response.status);
            console.error("Error data:", error.response.data);
            setError(error.response.data.message);
          } else if (error.request) {
            // Request was made but no response
            console.error("No response received:", error.request);
            setError("No response received");
          } else {
            // Something happened in setting up the request
            console.error("Error message:", error.message);
            setError(error.message);
          }
        } else {
          console.error("Unexpected error:", error);
        }

        setIsLoading(false);
      }
    }
  }, []);
  return { data, isLoading, error, sendRequest };
};
