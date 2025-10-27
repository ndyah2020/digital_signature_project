import { Request, Response } from "express";
import { SignatureService } from "../services/signature.service";

export class SignatureController {
  private signatureService = new SignatureService();

  // POST /signatures/sign
  async signContract(req: Request, res: Response) {
    try {
      const userId = (req as any).user.sub; // lấy từ JWT payload
      const {
        contractId,
        password,
        totpToken, // từ body
        emailOtp, // fallback
      } = req.body as {
        contractId: number;
        password: string;
        totpToken?: string;
        emailOtp?: string;
      };

      // --- Validate input ---
      if (!contractId || !password) {
        return res
          .status(400)
          .json({ message: "Thiếu contractId hoặc password" });
      }

      // Nếu user có bật TOTP mà client không gửi mã
      const user = (req as any).user;
      if (user?.isTotpEnabled && !totpToken) {
        return res.status(400).json({
          message: "Tài khoản này đã bật 2FA, vui lòng nhập mã TOTP.",
        });
      }

      // --- Gọi service ---
      const result = await this.signatureService.signContract(
        contractId,
        userId,
        password,
        totpToken || "", // tránh undefined
        emailOtp || ""
      );

      return res.status(201).json({
        message: result.message,
        signatureId: result.signatureId,
        isValid: result.isValid,
      });
    } catch (error: any) {
      console.error("Lỗi khi ký hợp đồng:", error);
      return res
        .status(400)
        .json({ message: error.message || "Lỗi ký hợp đồng" });
    }
  }
  // POST /signatures/:id/verify
  async verifySignature(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ message: "Thiếu signature id" });

      const result = await this.signatureService.verifySignature(Number(id));
      return res.status(200).json({
        message: result.isValid ? "Chữ ký hợp lệ" : "Chữ ký không hợp lệ",
        ...result,
      });
    } catch (error: any) {
      console.error("Lỗi khi xác minh chữ ký:", error);
      return res.status(400).json({ message: error.message });
    }
  }
  // GET /signatures/:contractId
  async getSignaturesByContract(req: Request, res: Response) {
    try {
      const { contractId } = req.params;
      const signatures = await this.signatureService.getSignaturesByContract(
        parseInt(contractId)
      );
      return res.json(signatures);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
  async getSignatureById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const signature = await this.signatureService.getSignatureById(
        parseInt(id)
      );
      return res.json(signature);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
  // GET /signatures
  async getAllSignatures(req: Request, res: Response) {
    try {
      const list = await this.signatureService.getAllSignatures();
      return res.json(list);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}
