export const formatBytes = (bytes) => {
  if (bytes < 1024) return { size: bytes + "B", valid: true };
  if (bytes < 1024 * 1024)
    return { size: (bytes / 1024).toFixed(1) + "Kb", valid: true };
  const size = (bytes / (1024 * 1024)).toFixed(1);
  const valid = size <= 50 ? true : false;
  return { size: size + "Mb", valid };
};

export const isValidStashKey = (stashKey) => {
  if (stashKey.length < 11) return false; // minimum possisible size of a stash key is 12
  const keyComponents = stashKey.split("-"); //it has minimum of 3 components can be 4 as well
  const len = keyComponents.length;
  if (len < 3) return false;
  if (keyComponents[len - 1].length !== 6) return false; //last component of key is always 6 digits long

  return true;
};

export const generateMetaData = (files) => {
  return files.map((file) => {
    if (file.fileInfo.formattedSize.valid) return file.fileInfo;
  });
};

export const convertToFile = (text, title) => {
  const blob = new Blob([text], { type: "text/plain" });
  const t = title.slice(-3) === "txt" ? title : title + ".txt";
  return new File([blob], t, { type: "text/plain" });
};

export const getDate = () => {
  const timeStamp = Date.now();
  const date = new Date(timeStamp);
  return `${date.getDate()}-${date.getMonth()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
};
