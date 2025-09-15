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
router.get("/retry", retryUploadUrl);
export default router;
