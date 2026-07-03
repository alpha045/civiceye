import { Router } from "express";
import authRoutes from "./auth.js";
import complaintRoutes from "./complaints.js";
import adminRoutes from "./admin.js";
import superadminRoutes from "./superadmin.js";
import notificationRoutes from "./notifications.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/complaints", complaintRoutes);
router.use("/admin", adminRoutes);
router.use("/superadmin", superadminRoutes);
router.use(
  "/notifications",
  notificationRoutes
);


export default router;