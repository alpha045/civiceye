import "./env.js";
import app from "../backend/src/app.js";
import { connectDB } from "../backend/src/config/db.js";

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.error("Database connection error:", err);
    if (!req.url.includes("health")) {
      return res.status(500).json({
        error: "Database Connection Error",
        message: err.message || "Failed to connect to MongoDB",
        hint: !process.env.MONGO_URI
          ? "MONGO_URI is missing in Vercel Environment Variables"
          : "Check MongoDB Atlas Network Access (ensure 0.0.0.0/0 is active)",
      });
    }
  }
  return app(req, res);
}
