import express from "express";
import dotenv from "dotenv";
import fileRoutes from "./routes/file.route.js";
import errorHandler from "../../ChatApp/backend/middleware/errorHandler.js";
import cors from "cors";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const allowedOrigin = process.env.FRONTEND_URL;

app.use(cors({ origin: allowedOrigin }));

app.use(express.json());

app.use("/api/file", fileRoutes);

app.use(errorHandler);

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
