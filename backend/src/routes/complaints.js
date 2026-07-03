import { Router } from "express";
import mongoose from "mongoose"; // 🎯 CRITICAL: ID Type Casting ke liye zaroori h
import Complaint from "../models/Complaint.js"; 
import Department from "../models/Department.js";     
import Notification from "../models/Notification.js"; 

// 🚨 UPDATED IMPORT: Aapki custom configured cloudinary file se connect kiya
import cloudinary from "../config/cloudinary.js"; 

// 🎯 ALL PATHS DYNAMICALLY SYNCED WITH YOUR AUTH.JS WORKING IMPORT
import { protect } from "../middleware/auth.js"; 
import upload from "../services/uploadService.js"; 
// 🎯 Hamari upgraded Groq dispatcher utility ko call karega
import { detectCategoryAI } from "../services/openaiService.js"; 

const router = Router();

// 🎯 ROUTE 1: GET ALL COMPLAINTS (Dashboard automatic load fetch)
// URL: http://localhost:5001/api/complaints
router.get("/", protect, async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user._id);

    console.log("=== CIVIC-EYE DATABASE FETCH ===");
    console.log("Querying complaints for logged-in user:", req.user._id);

    const complaints = await Complaint.find({
      $or: [
        { userId: userObjectId },
        { userId: req.user._id }
      ]
    }).sort({ createdAt: -1 });

    console.log(`[SUCCESS]: Found ${complaints.length} complaints in DB.`);

    return res.status(200).json({
      success: true,
      count: complaints.length,
      complaints: complaints || [],
    });

  } catch (err) {
    console.error("Dashboard DB Pipeline Error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch complaints from database",
      details: err.message,
    });
  }
});

// 🎯 ROUTE 2: REGISTER NEW COMPLAINT (🎯 UPGRADED WITH DIRECT CLOUDINARY CAPTURE & AUTO GROQ)
// URL: http://localhost:5001/api/complaints
router.post(
  "/",
  protect,
  upload.single("image"),
  async (req, res) => {
    try {
      let {
        title,
        description,
        category,
        priority,
        address,
      } = req.body;

      // 1. Strict Request Field Validation
      if (!title || !description || !address) {
        return res.status(400).json({
          error: `Validation failed: ${!title ? 'Title ' : ''}${!description ? 'Description ' : ''}${!address ? 'Address ' : ''}is required.`,
        });
      }

      // 2. Frontend Data Synchronization Enum Fix
      if (category) {
        category = category.trim();
        if (category === "Roads") category = "Road";
        if (category === "Water Supply") category = "Water";
        if (category === "Others") category = "Other";
        if (category === "Electricity" || category === "Street Light") category = "Electricity";
        if (category === "Sanitation" || category === "Garbage") category = "Sanitation";
      }

      // 🚨 CRITICAL FIX: Cloudinary Core Ingestion Core System
      let image = "";
      
      if (req.file) {
        console.log("=== MULTER DETECTED FILE ===", req.file);
        try {
          // Check if multer storage engine already uploaded it (CloudinaryStorage link setup)
          if (req.file.path && (req.file.path.startsWith("http://") || req.file.path.startsWith("https://"))) {
            image = req.file.path;
          } else {
            // Manual upload trigger directly using local file disk path stream
            const uploadResult = await cloudinary.uploader.upload(req.file.path, {
              folder: "civiceye_complaints",
              resource_type: "image"
            });
            image = uploadResult.secure_url; // Absolute dynamic secure web link!
            console.log("[CLOUDINARY SUCCESS]: Uploaded URL ->", image);
          }
        } catch (uploadErr) {
          console.error("Cloudinary Engine Core Upload Error:", uploadErr.message);
          // Fallback check if secure_url directly attached on req.file object by some storage config
          image = req.file.secure_url || req.file.path || "";
        }
      } else {
        console.log("[WARNING]: No file detected by Multer payload parser.");
      }

      let imageHash = "";

      // 3. AI Core Category Auto-Detection Engine (Groq Powered ⚡) - FIXED ENUM FALLBACK
      let aiCategory = "Other";
      try {
        if (typeof detectCategoryAI === "function") {
          const rawAiCategory = await detectCategoryAI(title, description);
          if (typeof rawAiCategory === "string") {
            const cleanedAi = rawAiCategory.trim();
            
            // Standardizing Mongoose Model Enum matches strictly
            if (cleanedAi === "Roads" || cleanedAi === "Road") aiCategory = "Road";
            else if (cleanedAi === "Water Supply" || cleanedAi === "Water") aiCategory = "Water";
            else if (cleanedAi === "Electricity") aiCategory = "Electricity";
            else if (cleanedAi === "Sanitation") aiCategory = "Sanitation";
            else if (cleanedAi === "Traffic") aiCategory = "Traffic";
            else {
              // 🚨 ENUM VALIDATION FIX: Agar AI "No category found." bhejta h, to use safe "Other" bnao
              aiCategory = "Other"; 
            }
          }
        }
      } catch (error) {
        console.log("AI Category Processing Error:", error.message);
        aiCategory = "Other"; // Try block fails fallback
      }

      const finalCategory = (category && category !== "Other") ? category : aiCategory;
      const finalPriority = priority || "Medium";

      // 4. Dynamic Internal Department Assignment
      const assignedDepartment = await Department.findOne({
        name: { $regex: new RegExp(`^${finalCategory}$`, "i") }
      });

      console.log("=== CIVIC-EYE PIPELINE LOG ===");
      console.log({
        title,
        category: finalCategory,
        priority: finalPriority,
        department: assignedDepartment?.name || "Unassigned (General / Other)",
        address: address,
        finalImageUrl: image
      });

      // 5. Database Entity Initialization
      const complaint = await Complaint.create({
        userId: req.user._id, 
        title: title.trim(),
        description: description.trim(),
        category: finalCategory,
        aiCategory, // 👈 Safe enum string passed here now!
        assignedDepartment: assignedDepartment?._id || null, 
        priority: finalPriority,
        duplicate: false,
        address: address.trim(),
        image, // Cloudinary ka absolute dynamic secure url store hoga DB me
        imageHash,
      });

      // 6. In-App Notification Stream Event Creation
      await Notification.create({
        userId: req.user._id,
        title: "Complaint Registered",
        message: `Your complaint "${title}" has been registered successfully. Tracking ID: ${complaint.trackingId}.`,
        type: "general",
        complaintId: complaint._id,
      });

      // 7. Success Response Handling
      return res.status(201).json({
        success: true,
        message: `Complaint auto-routed to ${assignedDepartment?.name || "General"} Department successfully!`,
        complaint,
      });

    } catch (err) {
      console.error("Critical Route Interception Error:", err);
      return res.status(500).json({
        error: "Database ingestion failed structure constraint match",
        details: err.message,
      });
    }
  }
);

// 🎯 ROUTE 3: TRACK SINGLE COMPLAINT BY TRACKING ID
// URL: http://localhost:5001/api/complaints/track/:trackingId
router.get("/track/:trackingId", async (req, res) => {
  try {
    const { trackingId } = req.params;

    console.log("=== TRACKING COMPLAINT ===");
    console.log("Searching for Tracking ID:", trackingId);

    const complaint = await Complaint.findOne({
      trackingId: trackingId.trim().toUpperCase()
    });

    if (!complaint) {
      console.log(`[FAILED]: Complaint with ID ${trackingId} not found.`);
      return res.status(404).json({
        error: "Complaint not found with this Tracking ID"
      });
    }

    console.log("[SUCCESS]: Complaint found!", complaint.title);

    return res.status(200).json({
      success: true,
      complaint
    });

  } catch (err) {
    console.error("Tracking Route Error:", err);
    return res.status(500).json({
      error: "Server error while tracking complaint",
      details: err.message
    });
  }
});

export default router;