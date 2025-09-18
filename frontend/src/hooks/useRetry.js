import { useState } from "react";
import axios from "axios";

export const useRetry = () => {
  const url = `${import.meta.env.VITE_BASE_URL}/api/file/retry`;

  const retryRequest = async (filePaths) => {
    try {
      const res = await axios.post(url, { file_paths: filePaths });
      const { signedUrl } = await res.data;
      console.log(signedUrl);
      return signedUrl;
    } catch (error) {
      console.error(error.message);
    }
  };

  return { retryRequest };
};
