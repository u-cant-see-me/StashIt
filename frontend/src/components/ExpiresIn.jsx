import { useEffect, useState } from "react";

const ExpiresIn = ({ value, onChange }) => {
  const [comments, setComments] = useState("");

  const onceComments = [
    "Not a feature, just me dodging Supabase bills 💸",
    "Self-destruct mode engaged 💥",
    "One night stand of databases 🍷",
    "Deletes faster than your ex’s texts 💔",
    "like your last situationship",
  ];
  const thirtyComments = [
    "I see you finish early just like me",
    "will help my pocket",
  ];

  useEffect(() => {
    if (value === "30m")
      setComments(
        thirtyComments[Math.floor(Math.random() * thirtyComments.length)]
      );
    if (value === "1h")
      setComments(
        "one of the three serious values in options rest just fall back to 1hr"
      );
    if (value === "once")
      setComments(
        onceComments[Math.floor(Math.random() * onceComments.length)]
      );
    if (value === "infinity") setComments("databases hate this one trick");
    if (value === "random") setComments("🤡");
    if (value === "elon") setComments("until we colonize Mars 🚀");
    if (value === "author") setComments("until author finds a gf ...");
  }, [value]);

  return (
    <div className="mt-2 text-neutral-200 flex items-center gap-2 outline-none">
      <label className="block text-xs font-monoton mb-1">Expiry</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-neutral-900 text-white text-xs px-2 py-1 rounded-md"
      >
        <option value="once">After one use</option>
        <option value="30m">30 min</option>
        <option value="1h">1 Hour</option>
        <option value="custom">Custom…</option>
        <option value="infinity">infinity</option>
        <option value="random">surprise me</option>
        <option value="elon">elon</option>
        <option value="author">author</option>
      </select>
      <span className="text-xs text-neutral-800">{comments}</span>
    </div>
  );
};

export default ExpiresIn;
