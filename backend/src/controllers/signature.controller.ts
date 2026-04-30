import { Request, Response } from "express";
import { SignatureService } from "../services/signature.service";

export class SignatureController {
  private signatureService = new SignatureService();

  // POST /signatures/sign
  async signContract(req: Request, res: Response) {
    try {
      const userId = (req as any).user.sub; 

      const { contractId, password} = req.body as {
        contractId: number;
        password: string;
      };

      if (!contractId || !password) {
        return res
          .status(400)
          .json({ message: "Thiếu contractId hoặc password" });
      }

      // --- Gọi service ---
      const result = await this.signatureService.signContract(
        contractId,
        userId,
        password,
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

  // POST /signatures/verify 
  async verifySignature(req: Request, res: Response) {
    try {
      const {signatures, url_contract} = req.body
      const result = await this.signatureService.verifySignatures(signatures, url_contract);
      return res.status(200).json({
        access: result,
        message: result ? "Chữ ký hợp lệ" : "Chữ ký không hợp lệ",
      });
    } catch (error: unknown) {
      console.error("Lỗi khi xác minh chữ ký:", error);
      const message = error instanceof Error ? error.message : "Unknown error occurred";
      return res.status(500).json({ message, access: false });
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

  async checkSigner(req: Request, res: Response) {
    try {
      const userId = req.user.sub;
      const contractId = req.body.contractId
      const result = await this.signatureService.checkSigner(userId, contractId);
      return res.status(200).json(result);
    }catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}
