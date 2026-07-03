import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path"; // 👈 1. Path module import kiya local directories trace karne ke liye
import { logger } from "./lib/logger.js";
import router from "./routes/index.js";

const app = express();

app.use(pinoHttp({ logger }));

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 👈 2. CRITICAL FIX: Uploads folder ko publicly accessible banayein
// Yeh line Express ko batati hai ki agar koi URL "/uploads" se shuru ho, toh use absolute files ki tarah deliver karein
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// API routes
app.use("/api", router);

// health check
app.get("/", (req, res) => {
  res.send("Backend Running Successfully");
});

export { app };
export default app;