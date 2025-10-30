import { Router } from "express";
import * as multer from "multer";
import { ContractController } from "../controllers/contract.controller";
import { authMiddleware } from "../middlewares/auth.middlewares";
import { UserRole } from "../entities/User";
import { requireRole } from "../middlewares/requireRole";

const router = Router();
const upload = multer({ dest: "uploads/" });
const controller = new ContractController();

// POST /contracts → tạo hợp đồng mới
router.post("/", upload.single("file"), authMiddleware, (req, res) =>
  controller.create(req, res)
);

// GET /contracts → lấy danh sách hợp đồng
router.get("/", authMiddleware, (req, res) => controller.getAll(req, res));

router.get("/get-create-recipient", authMiddleware, (req, res) => controller.getAllByCreateAndRecipient(req, res))

router.get("/:id", authMiddleware, (req, res) => controller.getById(req, res));

// PATCH /contracts/:id/status → cập nhật trạng thái
router.get("/verify_contracts/:id", authMiddleware,(req, res) => controller.verifyContracts(req, res));

router.get("/view/:id", authMiddleware, (req, res) =>
  controller.view(req, res)
);


router.patch("/:id/status", authMiddleware, (req, res) =>
  controller.updateStatus(req, res)
);

router.post(
  "/:id/assign",
  authMiddleware,
  requireRole(UserRole.ADMIN, UserRole.SIGNER),
  (req, res) => controller.assign(req, res)
);

// update (PATCH)
router.patch(
  "/:id",
  authMiddleware,
  requireRole(UserRole.ADMIN, UserRole.SIGNER),
  (req, res) => controller.update(req, res)
);

// delete
router.delete("/:id", authMiddleware, requireRole(UserRole.ADMIN), (req, res) =>
  controller.delete(req, res)
);

export default router;
