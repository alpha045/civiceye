import { Router } from "express";
import User from "../models/User.js";
import Complaint from "../models/Complaint.js";
import { protect, authorize } from "../middleware/auth.js";
import jwt from "jsonwebtoken";
// NodeMailer utility import
import { sendOTP } from "../utils/sendEmail.js"; 

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "civiceye_jwt_secret_2024";

router.use(protect, authorize("superadmin"));

// 1. ANALYTICS ROUTE
router.get("/analytics", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalComplaints = await Complaint.countDocuments();
    const resolved = await Complaint.countDocuments({ status: "Resolved" });
    const pending = await Complaint.countDocuments({ status: "Pending" });
    const resolutionRate = totalComplaints > 0 ? Math.round((resolved / totalComplaints) * 100) : 0;

    const recentUsers = await User.find({ role: "user" }).sort({ createdAt: -1 }).limit(5);
    const byStatus = await Complaint.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
    const byCategory = await Complaint.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]);

    res.json({ totalUsers, totalAdmins, totalComplaints, resolved, pending, resolutionRate, recentUsers, byStatus, byCategory });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET ALL USERS ROUTE
router.get("/users", async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = { role: "user" };
    if (search) query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
    const total = await User.countDocuments(query);
    const users = await User.find(query).sort({ createdAt: -1 }).skip((Number(page) - 1) * Number(limit)).limit(Number(limit));
    res.json({ users, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. GET ALL ADMINS ROUTE
router.get("/admins", async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).sort({ createdAt: -1 });
    res.json({ admins });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. CREATE NEW ADMIN ROUTE (🎯 FIX: TEXT EMAIL FOR SENDOTP UTILITY)
router.post("/admins", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already registered" });
    
    // Bypass Security Layer: Directly verify and active the admin account
    const admin = await User.create({ 
      name, 
      email, 
      phone, 
      password, 
      role: "admin",
      isEmailVerified: true, 
      isActive: true         
    });

    // 📬 Send Welcome Email via plain text parameter injection
    try {
      // 🎯 CRITICAL FIX: HTML tags hata kar message ko ek simple single line text block bana diya
      // Taaki sendOTP utility me jab ye string concatenated ho, toh mail chain tute na.
      const cleanTextMessage = `Admin Account Created Successfully! Welcome ${name}. Your login temporary password is: ${password} . Please login and change it ASAP.`;
      
      await sendOTP(email, cleanTextMessage);
      console.log(`[MAIL SUCCESS]: Welcome credentials triggered for Admin: ${email}`);
    } catch (mailErr) {
      // Catching email error taaki user creation crash na ho agar nodemailer block kare
      console.log("[MAIL ERROR]: Mail channel integration failed:", mailErr.message);
    }

    res.status(201).json({ 
      success: true,
      message: "Admin registered and auto-verified successfully!",
      admin, 
      token: jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: "7d" }) 
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. TOGGLE USER STATUS ROUTE
router.put("/users/:id/toggle", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. DELETE USER ROUTE
router.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;