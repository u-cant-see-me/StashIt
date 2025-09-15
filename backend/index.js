import express from "express";
import { upload } from "./config/multer.js";
import dotenv from "dotenv";
import supabase from "./config/supabaseClient.js";
import fileRoutes from "./routes/file.route.js";
import errorHandler from "../../ChatApp/backend/middleware/errorHandler.js";
import cors from "cors";
dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(cors({ origin: "http://localhost:5173" }));

app.use(express.json());

app.use("/api/file", fileRoutes);

app.use(errorHandler);

app.post("/pic", upload.single("image"), async (req, res) => {
  console.log(req.file); // file info
  console.log(req.body); // text field

  const { data, error } = await supabase.storage
    .from("test")
    .upload(req.file.originalname, req.file.buffer, {
      cacheControl: "3600",
      upsert: true, // overwrite if exists
    });
  console.log("Data", data, "Error", error);
  res.send("Image uploaded successfully!");
});

app.get("/warrior", async (req, res) => {
  // const { data, error } = await supabase.storage
  //   .from("test") // your bucket name
  //   .list("", { limit: 100, offset: 0 });

  const { data, error } = await supabase.storage
    .from("test")
    .createSignedUrl("warrior.jpg", 60 * 60);

  res.json({
    data,
    error,
  });
});

app.get("/upload-url", async (req, res) => {
  const { data, error } = await supabase.storage
    .from("test")
    .createSignedUploadUrl("hello", 60 * 60);
  res.json({
    data,
    error,
  });
});
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
