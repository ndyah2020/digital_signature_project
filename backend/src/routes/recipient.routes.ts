import { Router } from "express";
const router = Router();
import { RecipientController } from "../controllers/recipient.controller";
import { authMiddleware } from "../middlewares/auth.middlewares";

const controller = new RecipientController();

router.get("/contract/:contractId/get-recipient", authMiddleware, (req, res) => controller.getRecipientbyContract(req, res))
export default router;
