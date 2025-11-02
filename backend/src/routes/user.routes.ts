import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middlewares";

const router = Router();
const controller = new UserController();

// Lấy tất cả người dùng (có thể yêu cầu quyền admin)
router.get("/", authMiddleware, (req, res) => controller.getAllUsers(req, res));

// Cập nhật người dùng theo ID
router.put("/:id", authMiddleware, (req, res) =>
  controller.updateUser(req, res)
);

router.get("/:email", authMiddleware, (req, res) => controller.getUserByEmail(req, res))

router.post("/check-password", authMiddleware, (req, res) => controller.checkPassword(req, res))
export default router;
