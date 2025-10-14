import { AppDataSource } from "../config/data_source";
import { drive } from "../config/googleDrive";
const fs = require("fs");
const crypto = require("crypto");
import { ContractStatus } from "../entities/Contract";
export class ContractService {
  private contractRepository = AppDataSource.getRepository("Contract");
  async createContract(
    file: import("multer").File,
    title: string,
    description: string,
    createdBy: number
  ) {
    // Băm nội dung file (SHA-256)
    const fileBuffer = fs.readFileSync(file.path);
    const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

    // Upload lên Google Drive
    const driveResponse = await drive!.files.create({
      requestBody: { name: file.originalname, mimeType: file.mimetype },
      media: { mimeType: file.mimetype, body: fs.createReadStream(file.path) },
      fields: "id",
    });

    const driveFileId = driveResponse.data.id;

    // Xóa file tạm
    fs.unlinkSync(file.path);

    // Lưu metadata vào DB
    const contract = this.contractRepository.create({
      title,
      description,
      drive_file_id: driveFileId,
      file_type: file.mimetype,
      file_size: file.size,
      hash,
      status: ContractStatus.DRAFT,
      created_by: createdBy,
    });

    await this.contractRepository.save(contract);

    return {
      message: "Tạo hợp đồng thành công",
      contract,
    };
  }
  async getAllContracts() {
    return await this.contractRepository.find({
      order: { created_at: "DESC" },
    });
  }

  // Cập nhật trạng thái hợp đồng
  async updateStatus(id: number, status: string, userId: number) {
    const validStatuses = ["draft", "pending", "signed", "cancelled"];
    if (!validStatuses.includes(status))
      throw new Error("Trạng thái không hợp lệ");

    const contract = await this.contractRepository.findOne({ where: { id } });
    if (!contract) throw new Error("Không tìm thấy hợp đồng");

    // (Tuỳ chọn) có thể kiểm tra role của user trước khi đổi trạng thái

    contract.status = status;
    contract.updated_at = new Date();
    await this.contractRepository.save(contract);
    return contract;
  }
}
