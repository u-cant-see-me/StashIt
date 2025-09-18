import express from "express";
import {
  downloadFileUrlController,
  retryUploadUrl,
  uploadController,
} from "../controllers/file.controller.js";
import protect from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/upload", uploadController);
router.get("/download", protect, downloadFileUrlController);
router.post("/retry", retryUploadUrl);
export default router;
