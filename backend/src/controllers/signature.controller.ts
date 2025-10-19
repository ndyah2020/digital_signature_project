import { Request, Response } from "express";
import { SignatureService } from "../services/signature.service";

export class SignatureController {
  private signatureService = new SignatureService();

  // POST /signatures/sign
  async signContract(req: Request, res: Response) {
    try {
      const { contractId, password } = req.body;
      const userId = (req as any).user.sub; // Lấy userId từ token JWT

      if (!contractId || !password) {
        return res
          .status(400)
          .json({ message: "Thiếu contractId hoặc password" });
      }

      const signature = await this.signatureService.signContract(
        contractId,
        userId,
        password
      );

      return res.status(201).json({
        message: "Ký hợp đồng thành công",
        signature,
      });
    } catch (error: any) {
      console.error("Lỗi khi ký hợp đồng:", error);
      return res.status(400).json({ message: error.message });
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
