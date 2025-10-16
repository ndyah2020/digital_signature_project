import cloudinary from "../config/cloudinary";
import { AppDataSource } from "../config/data_source";

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

    // Upload lên Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: "raw", // Cho phép PDF hoặc file khác
      type: "upload",
      upload_preset: "unsigned_raw",
      folder: "contracts", // Tạo folder trên Cloudinary
      public_id: file.originalname.replace(/\.[^/.]+$/, ""), // Tên file (không kèm đuôi)
    });
    const viewUrl = result.secure_url.replace(
      "/upload/",
      "/upload/fl_attachment:false/"
    );
    // Xóa file tạm
    fs.unlinkSync(file.path);

    // Lưu metadata vào DB
    const contract = this.contractRepository.create({
      title,
      description,
      file_url: viewUrl,
      fileType: file.mimetype,
      fileSize: file.size,
      hash,
      status: ContractStatus.DRAFT,
      createdBy: createdBy,
    });

    await this.contractRepository.save(contract);

    return {
      message: "Tạo hợp đồng thành công",
      contract,
    };
  }
  async getAllContracts() {
    return await this.contractRepository.find();
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
