import mongoose from "mongoose";
import User from "../models/User.js";
import Department from "../models/Department.js";


const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("MONGO_URI environment variable is required to run the seed script.");
  process.exit(1);
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const demoUsers = [
    { name: "Demo User", email: "user@demo.com", phone: "+91 98765 43210", password: "demo123", role: "user" },
    { name: "Demo Admin", email: "admin@demo.com", phone: "+91 98765 43211", password: "demo123", role: "admin" },
    { name: "Super Admin", email: "super@demo.com", phone: "+91 98765 43212", password: "demo123", role: "superadmin" },
  ];

  for (const userData of demoUsers) {
    const exists = await User.findOne({ email: userData.email });
    if (!exists) {
      await User.create(userData);
      console.log(`Created: ${userData.email} (${userData.role})`);
    } else {
      console.log(`Exists: ${userData.email} — skipped`);
    }
  }

  const defaultDepts = [
    { name: "Roads", description: "Road maintenance and repairs", head: "Ramesh Kumar" },
    { name: "Electricity", description: "Electricity supply and faults", head: "Priya Sharma" },
    { name: "Water Supply", description: "Water supply and drainage", head: "Anil Verma" },
    { name: "Sanitation", description: "Waste management and cleanliness", head: "Sunita Patel" },
    { name: "Police", description: "Law and order complaints", head: "Inspector D. Rao" },
    { name: "Others", description: "Miscellaneous civic issues", head: "Admin Officer" },
  ];

  for (const deptData of defaultDepts) {
    const exists = await Department.findOne({ name: deptData.name });
    if (!exists) {
      await Department.create(deptData);
      console.log(`Created department: ${deptData.name}`);
    }
  }

  console.log("\nSeed complete!");
  console.log("Demo accounts:");
  console.log("  user@demo.com    / demo123 → Citizen Portal");
  console.log("  admin@demo.com   / demo123 → Admin Panel");
  console.log("  super@demo.com   / demo123 → Super Admin");
  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
