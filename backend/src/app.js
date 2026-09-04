import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path"; // 👈 1. Path module import kiya local directories trace karne ke liye
import { logger } from "./lib/logger.js";
import router from "./routes/index.js";

const app = express();

app.use(pinoHttp({ logger }));

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        process.env.NODE_ENV !== "production"
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 👈 2. CRITICAL FIX: Uploads folder ko publicly accessible banayein
// Yeh line Express ko batati hai ki agar koi URL "/uploads" se shuru ho, toh use absolute files ki tarah deliver karein
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Diagnostic health check
app.get(["/health", "/api/health"], (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };
  res.json({
    status: "ok",
    database: states[dbState] || "unknown",
    dbReadyState: dbState,
    hasMongoUri: !!process.env.MONGO_URI,
    hasJwtSecret: !!process.env.JWT_SECRET,
    time: new Date().toISOString(),
  });
});

// API routes - support both /api/auth/... and direct /auth/...
app.use("/api", router);
app.use("/", router);

// health check
app.get("/", (req, res) => {
  res.send("CivicEye Backend Running Successfully");
});

export { app };
export default app;