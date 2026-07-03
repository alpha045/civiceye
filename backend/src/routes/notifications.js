import { Router } from "express";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get(
  "/",
  protect,
  async (req, res) => {

    try {

      const notifications =
        await Notification.find({
          userId: req.user._id,
        }).sort({
          createdAt: -1,
        });

      res.json({
        notifications,
      });

    } catch (error) {

      res.status(500).json({
        error: error.message,
      });

    }
  }
);

router.get(
  "/unread-count",
  protect,
  async (req, res) => {

    try {

      const count =
        await Notification.countDocuments({
          userId: req.user._id,
          isRead: false,
        });

      res.json({
        count,
      });

    } catch (error) {

      res.status(500).json({
        error: error.message,
      });

    }
  }
);

router.put(
  "/mark-read",
  protect,
  async (req, res) => {

    try {

      await Notification.updateMany(
        {
          userId: req.user._id,
          isRead: false,
        },
        {
          isRead: true,
        }
      );

      res.json({
        message:
          "Notifications marked as read",
      });

    } catch (error) {

      res.status(500).json({
        error: error.message,
      });

    }
  }
);

export default router;