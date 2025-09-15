export const RenderPreview = ({ preview }) => {
  const { type, downloadUrl } = preview.current;

  if (type.includes("image")) {
    return (
      <img
        src={downloadUrl.signedUrl}
        alt="preview"
        className="max-w-full max-h-[80vh] object-contain rounded"
      />
    );
  }

  if (type.includes("video")) {
    return (
      <video
        src={downloadUrl.signedUrl}
        className="max-w-full max-h-[80vh] object-contain rounded"
        controls
        autoPlay
        loop
        muted
      />
    );
  }

  if (type.includes("audio")) {
    return (
      <audio
        src={downloadUrl.signedUrl}
        className="w-full"
        controls
        autoPlay
        loop
        muted
      />
    );
  }

  if (type.includes("pdf") || type.includes("text")) {
    return <iframe src={downloadUrl.signedUrl} className="w-[50vw] h-[75vh]" />;
  }

  return null;
};
