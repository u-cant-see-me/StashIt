const ProgressBar = ({ percent }) => {
  return (
    <div className="absolute bottom-0 left-0 h-1 w-full overflow-hidden rounded bg-green-200/20">
      <div
        className="h-full bg-green-400 transition-all duration-300 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
};

export default ProgressBar;
