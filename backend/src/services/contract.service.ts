import cloudinary from "../config/cloudinary";
import { AppDataSource } from "../config/data_source";
import { Contract, ContractStatus } from "../entities/Contract";
import { AuditLogService } from "../services/auditLog.service";
import { User, UserRole } from "../entities/User";
import { ContractRecipient, SignStatus } from "../entities/ContractRecipient";
const fs = require("fs");
const crypto = require("crypto");

export class ContractService {
  private contractRepository = AppDataSource.getRepository(Contract);
  private auditLogService = new AuditLogService();
  private recipientRepository = AppDataSource.getRepository(ContractRecipient);
  private userRepository = AppDataSource.getRepository(User);
  // create contract
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
      select: {
        id: true,
        title: true,
        description: true,
        file_url: true,
        hash: true,
        status: true,
        createdBy: {
          email: true,
        },
      },
    });
  }
  async getContractById(id: number) {
    const contract = await this.contractRepository.findOne({
      where: { id },
      relations: ["createdBy", "signatures", "signatures.user"],
      select: {
        id: true,
        title: true,
        description: true,
        file_url: true,
        hash: true,
        status: true,
        createdBy: {
          email: true,
        },
        signatures: {
          id: true,
          signatureHash: true,
          isValid: true,
          signedAt: true,
          user: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
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
  // Gán hợp đồng cho người dùng (chỉ creator hoặc admin)
  async assignContractToUser(
    contractId: number,
    senderId: number,
    recipientIds: number[]
  ) {
    const contract = await this.contractRepository.findOne({
      where: { id: contractId },
    });
    if (!contract) throw new Error("Không tìm thấy hợp đồng");
    // Lấy thông tin người tạo (để kiểm tra quyền)
    const actor = await this.userRepository.findOne({
      where: { id: senderId },
    });
    if (!actor) throw new Error("Không tìm thấy người gửi");
    if (actor.role !== UserRole.ADMIN && contract.createdBy?.id !== senderId) {
      throw new Error(
        "Chỉ admin hoặc người tạo hợp đồng được phép gán người ký"
      );
    }
    await this.recipientRepository.delete({ contract: { id: contractId } });

    const recipients = recipientIds.map((userId) =>
      this.recipientRepository.create({
        contractId: contractId,
        userId: userId,
        sign_status: SignStatus.PENDING,
        signed_at: null,
      })
    );
    await this.recipientRepository.save(recipients);
    // Nếu hợp đồng là draft, khi assign -> chuyển sang pending
    if (contract.status === ContractStatus.DRAFT)
      contract.status = ContractStatus.PENDING;
    contract.updatedAt = new Date();
    await this.contractRepository.save(contract);
    await this.auditLogService.createLog(
      senderId,
      "ASSIGN_CONTRACT",
      `Gán hợp đồng #${contractId} cho người dùng: [${recipientIds.join(", ")}]`
    );
    return contract;
  }

  // Cập nhật metadata hợp đồng (chỉ admin hoặc creator)
  async updateContractMetadata(
    contractId: number,
    updateData: Partial<Contract>,
    actorId: number,
    actorRole: UserRole
  ) {
    const contract = await this.contractRepository.findOne({
      where: { id: contractId },
    });
    if (!contract) throw new Error("Không tìm thấy hợp đồng");

    // Quyền: admin hoặc người tạo mới được update (nếu bạn muốn signer creator cũng được)
    if (actorRole !== UserRole.ADMIN && contract.createdBy?.id !== actorId) {
      throw new Error("Không có quyền cập nhật hợp đồng");
    }

    // Nếu hợp đồng đã signed => không update file/hash
    if (contract.status === ContractStatus.SIGNED) {
      // block sensitive fields like hash, file_url, file_size, file_type
      const { title, description } = updateData;
      contract.title = title ?? contract.title;
      contract.description = description ?? contract.description;
    } else {
      Object.assign(contract, updateData);
    }
    contract.updatedAt = new Date();
    await this.contractRepository.save(contract);
    await this.auditLogService.createLog(
      actorId,
      "UPDATE_CONTRACT_METADATA",
      `Cập nhật metadata hợp đồng #${contractId}`
    );
    return contract;
  }

  // xóa hợp đồng
  async deleteContract(
    contractId: number,
    actorId: number,
    actorRole: UserRole,
    force = false
  ) {
    const contract = await this.contractRepository.findOne({
      where: { id: contractId },
    });
    if (!contract) throw new Error("Không tìm thấy hợp đồng");

    if (contract.status === ContractStatus.SIGNED && !force) {
      throw new Error(
        "Không thể xóa hợp đồng đã được ký (signed). Yêu cầu admin với force=true để ép xóa."
      );
    }

    // Only admin can delete
    if (actorRole !== UserRole.ADMIN) {
      throw new Error("Chỉ admin mới được xóa hợp đồng");
    }

    await this.contractRepository.remove(contract);
    await this.auditLogService.createLog(
      actorId,
      "DELETE_CONTRACT",
      `Xóa hợp đồng #${contractId} ${force ? "(force)" : ""}`
    );
    return { success: true };
  }
}
