import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

// 🚨 CRITICAL FIX: Config hone se PEHLE .env file ko load karna compulsory hai
dotenv.config();

console.log("=== ☁️ CIVIC-EYE CLOUDINARY CONFIG DEBUG ===");
console.log("Cloud Name Detected :", process.env.CLOUDINARY_CLOUD_NAME ? "✅ Loaded" : "❌ NOT FOUND");
console.log("API Key Detected    :", process.env.CLOUDINARY_API_KEY ? "✅ Loaded" : "❌ NOT FOUND");
console.log("=============================================");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;