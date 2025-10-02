import { nanoid } from "nanoid";
import { formatBytes } from "./utils";
export const generateFileObj = (file) => {
  return {
    fileInfo: {
      id: nanoid(8),
      name: file.name,
      type: file.type
        ? file.type
        : file.name.split(".").length > 1
        ? file.name.split(".").pop()
        : "Unknown",
      size: file.size,
      formattedSize: formatBytes(file.size),
    },
    fileObj: file,
    state: {
      status: "pending",
      progress: 0,
      error: null,
      aborted: false,
      uploadUrl: null,
    },
  };
};
