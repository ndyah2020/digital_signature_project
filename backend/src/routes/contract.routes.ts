import { Router } from "express";
import multer from "multer";
import { ContractController } from "../controllers/contract.controller";
import { authMiddleware } from "../middlewares/auth.middlewares";

const router = Router();
const upload = multer({ dest: "uploads/" });
const controller = new ContractController();

// POST /contracts → tạo hợp đồng mới
router.post("/", authMiddleware, upload.single("file"), (req, res) =>
  controller.create(req, res)
);

// GET /contracts → lấy danh sách hợp đồng
router.get("/", authMiddleware, (req, res) => controller.getAll(req, res));

// PATCH /contracts/:id/status → cập nhật trạng thái
router.patch("/:id/status", authMiddleware, (req, res) =>
  controller.updateStatus(req, res)
);

export default router;
