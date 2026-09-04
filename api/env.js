import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Search for backend/.env across local dev and Vercel lambda container environments
const candidates = [
  path.resolve(process.cwd(), "backend/.env"),
  path.resolve(process.cwd(), ".env"),
  path.resolve(__dirname, "../backend/.env"),
  path.resolve(__dirname, "backend/.env"),
  path.resolve(__dirname, ".env"),
];

for (const candidate of candidates) {
  if (fs.existsSync(candidate)) {
    dotenv.config({ path: candidate });
    break;
  }
}

dotenv.config();

// Ensure production NODE_ENV on Vercel
if (process.env.VERCEL && !process.env.NODE_ENV) {
  process.env.NODE_ENV = "production";
}

// Fallback essential credentials if Vercel deployment stripped .env
if (!process.env.MONGO_URI) {
  process.env.MONGO_URI = "mongodb+srv://vikashjiii780_db_user:j0uRl3V6cyho0dmJ@cluster0.mtxoz0q.mongodb.net/civiceye?retryWrites=true&w=majority&appName=Cluster0";
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "civiceye_jwt_secret_2024";
}
