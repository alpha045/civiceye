import mongoose from "mongoose";
import { logger } from "../lib/logger.js";

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    logger.warn("MONGO_URI not set — running without database connection");
    return;
  }
  try {
    await mongoose.connect(uri);
    logger.info("MongoDB connected successfully");
  } catch (err) {
    logger.error({ err }, "MongoDB connection failed");
    process.exit(1);
  }
}
