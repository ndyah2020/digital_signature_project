// src/routes/auditLog.routes.ts
import { Router } from "express";

import { auditLogController } from "../controllers/auditLogs.controller";
import { authMiddleware } from "../middlewares/auth.middlewares";

const router = Router();
const controller = new auditLogController();

router.get("/", authMiddleware , (req, res) => controller.getAll(req, res))

export default router;
