import { Request, Response } from "express";
import { TwoFAService } from "../services/twofa.service";

const service = new TwoFAService();

export class TwoFAController {
  // Tạo secret & QR code (chưa bật)
  async setup(req: Request, res: Response) {
    try {
      const userId = (req as any).user.sub;
      const result = await service.generateTotpSecret(userId);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  // Xác minh mã 6 số để bật 2FA
  async enable(req: Request, res: Response) {
    try {
      const userId = (req as any).user.sub;
      const { token } = req.body;
      const result = await service.enableTotp(userId, token);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  // Gửi email OTP
  async sendEmailOtp(req: Request, res: Response) {
    try {
      const userId = (req as any).user.sub;
      const {contractId} = req.body
      const result = await service.sendEmailOtp(userId, contractId);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  // Xác minh email OTP
  async verifyEmailOtp(req: Request, res: Response) {
    try {
      const userId = (req as any).user.sub;
      const { code, contractId } = req.body;
      const result = await service.verifyEmailOtp(userId, contractId ,code);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}
