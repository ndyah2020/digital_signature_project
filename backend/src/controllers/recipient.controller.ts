import { Request, Response } from "express";
import { RecipientService } from "../services/recipient.service";



export class RecipientController {
    private recipientService = new RecipientService();
   async getRecipientbyContract(req: Request, res: Response) {
    try {
      const contractIdStr = req.params.contractId;
      const contractId = parseInt(contractIdStr);

      if (isNaN(contractId) || contractId <= 0) {
        return res.status(400).json({ message: "Định dạng contractId không hợp lệ." });
      }

      const result = await this.recipientService.getRecipientbyContract(contractId);
      if (!result) {
         return res.status(404).json({ message: "Không tìm thấy hợp đồng hoặc người nhận." });
      }

      return res.status(200).json(result);

    } catch (error: any) {
      console.error("Lỗi khi lấy người được gán:", error);
      return res.status(500).json({ message: error.message || "Lỗi lấy dữ liệu" });
    }
  }
}