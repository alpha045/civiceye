import "./env.js";
import app from "../backend/src/app.js";
import { connectDB } from "../backend/src/config/db.js";

let isDbConnected = false;

export default async function handler(req, res) {
  if (!isDbConnected) {
    try {
      await connectDB();
      isDbConnected = true;
    } catch (err) {
      console.error("Database connection error:", err);
    }
  }
  return app(req, res);
}
