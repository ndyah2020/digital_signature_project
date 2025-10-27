import { Router } from "express";
import { TwoFAController } from "../controllers/twofa.controller";
import { authMiddleware } from "../middlewares/auth.middlewares";

const router = Router();
const controller = new TwoFAController();

router.post("/setup-2fa", authMiddleware, (req, res) =>
  controller.setup(req, res)
);
router.post("/enable-2fa", authMiddleware, (req, res) =>
  controller.enable(req, res)
);
router.post("/request-email-otp", authMiddleware, (req, res) =>
  controller.sendEmailOtp(req, res)
);
router.post("/verify-email-otp", authMiddleware, (req, res) =>
  controller.verifyEmailOtp(req, res)
);

export default router;
