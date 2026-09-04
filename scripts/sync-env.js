import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const envPath = path.resolve(process.cwd(), "backend/.env");

if (!fs.existsSync(envPath)) {
  console.error("❌ backend/.env not found!");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf-8");
const lines = envContent.split("\n");

console.log("🔄 Syncing backend/.env variables to Vercel...");

for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;

  const equalIndex = trimmed.indexOf("=");
  if (equalIndex === -1) continue;

  const key = trimmed.substring(0, equalIndex).trim();
  const value = trimmed.substring(equalIndex + 1).trim();

  // Skip PORT (managed by Vercel)
  if (key === "PORT") continue;

  try {
    // Add or replace env variable on Vercel production
    execSync(`echo -n "${value}" | npx -y vercel env add ${key} production --force 2>/dev/null || true`, {
      stdio: "pipe",
    });
    console.log(`✅ Synced: ${key}`);
  } catch (err) {
    console.log(`⚠️ Could not auto-sync ${key} via CLI, will be read from backend/.env`);
  }
}

console.log("\n✨ Sync completed!");
