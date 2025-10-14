import { Request, Response } from "express";
import { ContractService } from "../services/contract.service";

export class ContractController {
  private service = new ContractService();

  async create(req: Request, res: Response) {
    try {
      const { title, description } = req.body;
      const user = (req as any).user;
      console.log(">>> req.file:", req.file);
      console.log(">>> req.body:", req.body);
      if (!req.file) {
        return res
          .status(400)
          .json({ message: "Vui lòng chọn file hợp đồng để upload" });
      }

      const contract = await this.service.createContract(
        req.file,
        title,
        description,
        user.sub
      );

      return res.status(201).json({
        message: "Tạo hợp đồng thành công",
        data: contract,
      });
    } catch (error: any) {
      console.error("Lỗi khi tạo hợp đồng:", error);
      return res
        .status(500)
        .json({ message: error.message || "Lỗi khi tạo hợp đồng" });
    }
  }

  // [GET] /contracts  → Danh sách hợp đồng
  async getAll(req: Request, res: Response) {
    try {
      const list = await this.service.getAllContracts();
      return res.status(200).json(list);
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Lỗi khi lấy danh sách hợp đồng" });
    }
  }

  // [PATCH] /contracts/:id/status  → Cập nhật trạng thái (draft → pending/signed)
  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const user = (req as any).user;

      const updated = await this.service.updateStatus(
        parseInt(id),
        status,
        user.sub
      );
      return res.status(200).json({
        message: "Cập nhật trạng thái hợp đồng thành công",
        data: updated,
      });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}
