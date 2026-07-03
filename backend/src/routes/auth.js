import { sendOTP } from "../utils/sendEmail.js";
import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
let otpStore = {};

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "civiceye_jwt_secret_2024";

function generateToken(id) {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" });
}

// 1. REGISTER USER ROUTE
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Name, email and password are required" });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already registered" });
    const user = await User.create({ name, email, phone, password });
    res.status(201).json({ user, token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. LOGIN USER ROUTE
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    if (!user.isActive) return res.status(403).json({ error: "Account is deactivated" });
    res.json({ user, token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. GET PROFILE ROUTE
router.get("/profile", protect, async (req, res) => {
  res.json({ user: req.user });
});

// 4. UPDATE PROFILE ROUTE
router.put("/profile", protect, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone }, { new: true });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. UPDATE PASSWORD ROUTE (Logged-In User/Admin ke liye)
router.put("/password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. SEND OTP ROUTE (General Email Verification ke liye)
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    otpStore[email] = otp;

    await sendOTP(email, otp);

    res.json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: error.message,
    });
  }
});

// 7. VERIFY OTP ROUTE (General Email Verification ke liye)
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (otpStore[email] !== otp) {
      return res.status(400).json({
        error: "Invalid OTP",
      });
    }

    delete otpStore[email];

    res.json({
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: error.message,
    });
  }
});

// ==========================================
// 🎯 NEW PASSWORD RESET ENGINE PIPELINES
// ==========================================

// 8. FORGOT PASSWORD ROUTE (OTP Trigger Engine)
// URL: http://localhost:5001/api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ error: "User with this email does not exist" });
    }

    // 6-Digit Reset OTP code generation
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Database state parameters assignment (Valid for 15 Minutes)
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; 
    await user.save();

    // Delivery pipeline push (Using plain-text format)
    try {
      const cleanTextMessage = `CivicEye Security Update: Your password reset OTP is ${otp} . This code will expire in 15 minutes. Please do not share it.`;
      await sendOTP(user.email, cleanTextMessage);
      console.log(`[RESET OTP SUCCESS]: Delivered securely to ${user.email}`);
    } catch (mailErr) {
      console.error("Reset mail channel failure:", mailErr.message);
      return res.status(500).json({ error: "Failed to dispatch email. Please check your network context." });
    }

    return res.status(200).json({
      success: true,
      message: "Password reset OTP sent successfully to your email."
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 9. RESET PASSWORD ROUTE (OTP Verification & Overwrite)
// URL: http://localhost:5001/api/auth/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "All fields (email, otp, newPassword) are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters long" });
    }

    // Validate user, code matching and active lifespan token window
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() } // Strict time filter check
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid OTP or OTP has expired" });
    }

    // Update operational parameters (pre-save hook hashes this automatically)
    user.password = newPassword;
    
    // Memory footprint clear out configuration
    user.resetPasswordOTP = null;
    user.resetPasswordExpires = null;
    await user.save();

    console.log(`[PASSWORD CHANGED]: Credentials updated successfully for ${email}`);

    return res.status(200).json({
      success: true,
      message: "Password updated successfully! You can now log in with your new password."
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;