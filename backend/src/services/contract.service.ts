import cloudinary from "../config/cloudinary";
import { AppDataSource } from "../config/data_source";
import { Contract, ContractStatus } from "../entities/Contract";
import { AuditLogService } from "../services/auditLog.service";

const fs = require("fs");
const crypto = require("crypto");

export class ContractService {
  private contractRepository = AppDataSource.getRepository(Contract);
  private auditLogService = new AuditLogService();

  async createContract(
    file: import("multer").File,
    title: string,
    description: string,
    createdBy: number
  ) {
    const fileBuffer = fs.readFileSync(file.path);
    const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: "image", 
      type: "upload",
      upload_preset: "unsigned_raw",
      folder: "contracts", 
      public_id: file.originalname.replace(/\.[^/.]+$/, ""), 
    });

    const viewUrl = result.secure_url.replace(
      "/image/upload/", 
      "/image/upload/fl_attachment:false/"
    );
    
    fs.unlinkSync(file.path);

    const contract = this.contractRepository.create({
      title,
      description,
      file_url: viewUrl, // Lưu URL đã sửa đúng
      fileType: file.mimetype,
      fileSize: file.size,
      hash,
      status: ContractStatus.DRAFT,
      createdBy: { id: createdBy },
    });

    await this.contractRepository.save(contract);
    await this.auditLogService.createLog(
      createdBy,
      "CREATE_CONTRACT",
      `Tạo hợp đồng: ${title}`
    );
    return contract;
  }
  // Lấy tất cả hợp đồng
  async getAllContracts() {
    return await this.contractRepository.find({
      relations: ["createdBy"],
    });
  }
  async getContractById(id: number) {
    const contract = await this.contractRepository.findOne({
      where: { id },
      relations: ["createdBy", "signatures", "signatures.user"],
    });
    if (!contract) throw new Error("Không tìm thấy hợp đồng");
    return contract;
  }
  // Cập nhật trạng thái hợp đồng
  async updateStatus(id: number, status: string, userId: number) {
    const validStatuses = ["draft", "pending", "signed", "cancelled"];
    if (!validStatuses.includes(status))
      throw new Error("Trạng thái không hợp lệ");

    const contract = await this.contractRepository.findOne({
      where: { id },
      relations: ["createdBy"],
    });
    if (!contract) throw new Error("Không tìm thấy hợp đồng");

    // (Tuỳ chọn) có thể kiểm tra role của user trước khi đổi trạng thái

    contract.status = status as ContractStatus;
    contract.updatedAt = new Date();
    await this.contractRepository.save(contract);
    await this.auditLogService.createLog(
      userId,
      "UPDATE_CONTRACT_STATUS",
      `Cập nhật hợp đồng #${id} sang trạng thái '${status}'`
    );
    return contract;
  }
}
