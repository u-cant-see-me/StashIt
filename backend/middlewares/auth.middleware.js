import asyncHandler from "express-async-handler";
import supabase from "../config/supabaseClient.js";

const protect = asyncHandler(async (req, res, next) => {
  const { stashKey } = req.query;

  if (!stashKey.trim()) {
    return res.status(400).json({ message: "stash key is required" });
  }

  const { data, error } = await supabase
    .from("stash")
    .select("*")
    .eq("stash_key", stashKey);

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  if (!data || data.length < 1) {
    return res.status(404).json({ message: "no such stash key" });
  }

  req.data = { ...data[0] };

  next();
});

export default protect;
