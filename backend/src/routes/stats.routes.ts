// src/routes/stats.routes.ts
import { Router } from "express";
const router = Router();
import { authMiddleware } from "../middlewares/auth.middlewares";
import { StatsController } from "../controllers/stats.controller";

const controller = new StatsController();

router.get("/dashboard-stats", authMiddleware, (req, res) => controller.getDashboardStats(req, res));
router.get("/contract-stats", authMiddleware, (req, res) => controller.getContractStat(req, res))
router.get("/users-stats", authMiddleware, (req, res) => controller.getUsersStat(req, res))

export default router;
