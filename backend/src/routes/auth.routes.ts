// src/routes/auth.routes.ts
import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { loginUserSchema, registerUserSchema } from "../dto/user.dto";
import { validateSchema } from "../middlewares/validate";

const router = Router();
const controller = new AuthController();

// Đăng ký người dùng
router.post("/register", validateSchema(registerUserSchema), (req, res) => {
  controller.register(req, res);
});

// Đăng nhập
router.post("/login", validateSchema(loginUserSchema), (req, res) => {
  controller.login(req, res);
});

export default router;
