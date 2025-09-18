import { AudioLines, Play, Image, File } from "lucide-react";

export const FileIcon = ({ type }) => {
  const size = 14;
  if (type.includes("image")) return <Image size={size} color="#e236e2ff" />; // purple
  if (type.includes("video")) return <Play size={size} color="cyan" />;
  if (type.includes("audio"))
    return <AudioLines size={size} color="#40E0D0" />; // turquoise hex
  else return <File size={size} color="green" />;
};
