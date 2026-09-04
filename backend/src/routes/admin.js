import { io } from "../lib/socket.js";
import Notification from "../models/Notification.js";

import { Router } from "express";
import Complaint from "../models/Complaint.js";
import Department from "../models/Department.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/dashboard", protect, async (req, res) => {
  try {
    const totalComplaints =
      await Complaint.countDocuments();

    const pendingComplaints =
      await Complaint.countDocuments({
        status: "Pending",
      });

    const resolvedComplaints =
      await Complaint.countDocuments({
        status: "Resolved",
      });

    const inProgressComplaints =
      await Complaint.countDocuments({
        status: "In Progress",
      });

    const highPriorityComplaints =
      await Complaint.countDocuments({
        priority: "High",
      });

    const totalUsers =
      await User.countDocuments();

    const recentComplaints =
      await Complaint.find()
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .limit(5);

    res.json({
      total: totalComplaints,
      pending: pendingComplaints,
      resolved: resolvedComplaints,
      inProgress: inProgressComplaints,
      highPriority: highPriorityComplaints,
      totalUsers,
      recentComplaints,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

router.get("/complaints", protect, async (req, res) => {
  try {
    const complaints =
      await Complaint.find()
        .populate("userId", "name email")
        .populate(
          "assignedDepartment",
          "name"
        )
        .sort({ createdAt: -1 });

    res.json({
      complaints,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

router.get(
  "/complaints/:id",
  protect,
  async (req, res) => {
    try {
      const complaint =
        await Complaint.findById(
          req.params.id
        )
          .populate(
            "userId",
            "name email"
          )
          .populate(
            "assignedDepartment",
            "name"
          );

      if (!complaint) {
        return res.status(404).json({
          error: "Complaint not found",
        });
      }

      res.json({
        complaint,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        error: error.message,
      });
    }
  }
);

router.put(
  "/complaints/:id",
  protect,
  async (req, res) => {
    try {
      const {
        status,
        adminRemarks,
        assignedDepartment,
      } = req.body;

      const complaint =
        await Complaint.findById(
          req.params.id
        );

      if (!complaint) {
        return res.status(404).json({
          error: "Complaint not found",
        });
      }

      complaint.status = status;

      complaint.adminRemarks =
        adminRemarks;

      complaint.assignedDepartment =
        assignedDepartment || null;

      complaint.timeline.push({
        status,
        message: `Complaint updated to ${status}`,
        updatedBy: req.user._id,
      });

      await complaint.save();

      console.log(
        "USER ID:",
        complaint.userId
      );

      await Notification.create({
        userId: complaint.userId,
        title: "Complaint Updated",
        message: `Your complaint "${complaint.title}" status changed to ${status}`,
        type: "status_update",
        complaintId: complaint._id,
      });

      if (complaint.userId) {

  console.log(
    "EMITTING TO:",
    complaint.userId.toString()
  );

  io.to(
    complaint.userId.toString()
  ).emit("new_notification", {
    title: "Complaint Updated",
    message: `Your complaint status changed to ${status}`,
  });

  console.log("EVENT EMITTED");
}

      const updatedComplaint =
        await Complaint.findById(
          req.params.id
        )
          .populate(
            "userId",
            "name email"
          )
          .populate(
            "assignedDepartment",
            "name"
          );

      res.json({
        complaint: updatedComplaint,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        error: error.message,
      });
    }
  }
);

router.get("/departments", protect, async (req, res) => {
  try {
    const departments =
      await Department.find().sort({
        createdAt: -1,
      });

    res.json({
      departments,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

router.post("/departments", protect, async (req, res) => {
  try {
    const { name } = req.body;

    const exists =
      await Department.findOne({
        name,
      });

    if (exists) {
      return res.status(400).json({
        error: "Department already exists",
      });
    }

    const department =
      await Department.create({
        name,
      });

    res.status(201).json({
      department,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

router.put(
  "/departments/:id",
  protect,
  async (req, res) => {
    try {
      const { name } = req.body;

      const department =
        await Department.findByIdAndUpdate(
          req.params.id,
          { name },
          { new: true }
        );

      if (!department) {
        return res.status(404).json({
          error: "Department not found",
        });
      }

      res.json({
        department,
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  }
);

router.delete(
  "/departments/:id",
  protect,
  async (req, res) => {
    try {
      const department =
        await Department.findByIdAndDelete(
          req.params.id
        );

      if (!department) {
        return res.status(404).json({
          error: "Department not found",
        });
      }

      res.json({
        message:
          "Department deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  }
);

router.get("/reports", protect, async (req, res) => {
  try {
    const byStatus =
      await Complaint.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

    const byCategory =
      await Complaint.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
      ]);

    const byPriority =
      await Complaint.aggregate([
        {
          $group: {
            _id: "$priority",
            count: { $sum: 1 },
          },
        },
      ]);

    const monthly =
      await Complaint.aggregate([
        {
          $group: {
            _id: {
              year: {
                $year: "$createdAt",
              },
              month: {
                $month: "$createdAt",
              },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
      ]);

    res.json({
      byStatus,
      byCategory,
      byPriority,
      monthly,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: error.message,
    });
  }
});

export default router;