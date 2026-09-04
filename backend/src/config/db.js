import mongoose from "mongoose";
import { logger } from "../lib/logger.js";

const FALLBACK_URI = "mongodb+srv://vikashjiii780_db_user:j0uRl3V6cyho0dmJ@cluster0.mtxoz0q.mongodb.net/civiceye?retryWrites=true&w=majority&appName=Cluster0";

export async function connectDB() {
  const uri = process.env.MONGO_URI || FALLBACK_URI;
  if (!uri) {
    logger.warn("MONGO_URI not set — running without database connection");
    return;
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (mongoose.connection.readyState === 2) {
    return new Promise((resolve, reject) => {
      mongoose.connection.once("open", resolve);
      mongoose.connection.once("error", reject);
    });
  }

  try {
    await mongoose.connect(uri);
    logger.info("MongoDB connected successfully");
  } catch (err) {
    logger.error({ err }, "MongoDB connection failed");
    if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
      process.exit(1);
    }
    throw err;
  }
}
