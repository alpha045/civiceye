import mongoose from "mongoose";

const timelineSchema = new mongoose.Schema({
  status: String,
  message: String,
  date: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const complaintSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    // USER SELECTED CATEGORY
    category: {
      type: String,
      required: true,
      enum: ["Road", "Electricity", "Water", "Sanitation", "Traffic", "Other"],
      default: "Other",
    },
    // AI DETECTED CATEGORY
    aiCategory: {
      type: String,
      enum: ["Road", "Electricity", "Water", "Sanitation", "Traffic", "Other"],
    },
    duplicate: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      required: true,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Pending", "Under Review", "In Progress", "Resolved", "Rejected"],
      default: "Pending",
    },
    // 🚨 CRITICAL STRUCTURAL FIX: Missing image path schema wire injected!
    image: {
      type: String,
      default: "",
    },
    imageHash: {
      type: String,
    },
    address: {
      type: String,
      required: true,
    },
    assignedDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    adminRemarks: {
      type: String,
    },
    timeline: [timelineSchema],
  },
  {
    timestamps: true,
  }
);

complaintSchema.pre("save", async function (next) {
  if (!this.trackingId) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let id = "CIV-";
    for (let i = 0; i < 6; i++) {
      id += chars[Math.floor(Math.random() * chars.length)];
    }
    this.trackingId = id;

    this.timeline.push({
      status: "Pending",
      message: "Complaint registered successfully.",
    });
  }
  next();
});

export default mongoose.model("Complaint", complaintSchema);