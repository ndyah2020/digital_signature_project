import { Router } from "express";
import { SignatureController } from "../controllers/signature.controller";
import { authMiddleware } from "../middlewares/auth.middlewares";

const router = Router();
const controller = new SignatureController();

// Ký hợp đồng
router.post("/sign", authMiddleware, (req, res) =>
  controller.signContract(req, res)
);
// Xác minh 1 chữ ký (theo signature id)
// router.post("/:id/verify", authMiddleware, (req, res) =>
//   controller.verifySignature(req, res)
// );
// Lấy chữ ký theo hợp đồng
router.get("/:contractId", authMiddleware, (req, res) =>
  controller.getSignaturesByContract(req, res)
);
// Lấy chữ ký theo ID
router.get("/id/:signatureId", authMiddleware, (req, res) =>
  controller.getSignatureById(req, res)
);
// Lấy tất cả chữ ký
router.get("/", authMiddleware, (req, res) =>
  controller.getAllSignatures(req, res)
);

router.post("/check-signer", authMiddleware, (req, res) => 
  controller.checkSigner(req, res)
);

export default router;
