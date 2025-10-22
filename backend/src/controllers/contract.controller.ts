import { Request, Response } from "express";
import { ContractService } from "../services/contract.service";
import { UserRole } from "../entities/User";
export class ContractController {
  private service = new ContractService();

  async create(req: Request, res: Response) {
    try {
      const { title, description } = req.body;
      const user = (req as any).user;
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
  // lấy hợp đồng theo id
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const contract = await this.service.getContractById(parseInt(id));
      return res.status(200).json(contract);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  async verifyContracts(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "Thiếu ID của hợp đồng" });
      }
      const result = await this.service.verifyContractIntegrity(parseInt(id));
      if (result.status === 'error') {

        return res.status(400).json({ message: result.message });
      }

      return res.status(200).json({
        message: result.message,
        data: { status: result.status }
      });

    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  async downloadContract(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { fileName, mimeType, fileBuffer } =
        await this.service.downloadContractFile(parseInt(id));

      res.setHeader("Content-Type", mimeType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(fileName)}"`
      );
      res.setHeader("Content-Length", fileBuffer.length);

      res.end(fileBuffer);
    } catch (error: any) {
      console.error("Lỗi khi tải file:", error);
      res
        .status(500)
        .json({ message: error.message || "Lỗi khi tải file xuống" });
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
  // POST /contracts/:id/assign  → gán contract cho 1 list userIds
  async assign(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { recipientIds } = req.body;
      const user = (req as any).user;
      if (!Array.isArray(recipientIds) || recipientIds.length === 0) {
        return res
          .status(400)
          .json({ message: "recipientIds phải là mảng id" });
      }

      const updated = await this.service.assignContractToUser(
        parseInt(id),
        user.sub,
        recipientIds
      );
      return res.status(200).json({ message: "Gán thành công", data: updated });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  // PATCH /contracts/:id -> cập nhật hợp đồng
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const updateData = req.body;
      const updated = await this.service.updateContractMetadata(
        parseInt(id),
        updateData,
        user.sub,
        user.role
      );
      return res
        .status(200)
        .json({ message: "Cập nhật thành công", data: updated });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  // DELETE /contracts/:id
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const force = req.query.force === "true";
      const user = (req as any).user;
      const result = await this.service.deleteContract(
        parseInt(id),
        user.sub,
        user.role,
        force
      );
      return res.status(200).json({ message: "Xóa thành công", data: result });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}
