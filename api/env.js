import dotenv from "dotenv";
import path from "path";

// Bootstrap environment variables before any application modules are evaluated
dotenv.config({ path: path.resolve(process.cwd(), "backend/.env") });
dotenv.config();
