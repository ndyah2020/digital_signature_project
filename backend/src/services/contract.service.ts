import axios from "axios";
import cloudinary from "../config/cloudinary";
import * as path from 'path';
import { AppDataSource } from "../config/data_source";
import { Contract, ContractStatus } from "../entities/Contract";
import { AuditLogService } from "../services/auditLog.service";
import { User, UserRole } from "../entities/User";
import { ContractRecipient, SignStatus } from "../entities/ContractRecipient";
import { Response } from "express";


const fs = require("fs");
const crypto = require("crypto");

export class ContractService {

  private recipientRepository = AppDataSource.getRepository(ContractRecipient);
  private userRepository = AppDataSource.getRepository(User);
  private contractRepository = AppDataSource.getRepository(Contract);
  private auditLogService = new AuditLogService();

  async createContract(
    file: import("multer").File,
    title: string,
    description: string,
    createdBy: number,
  ) {
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    const cleanBaseName = baseName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9-]/g, "_")
      .replace(/_{2,}/g, "_");

    const finalPublicId = `${cleanBaseName}${extension}`;
    const fileBuffer = fs.readFileSync(file.path);
    const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: "raw",
      type: "upload",
      folder: "contracts",
      public_id: finalPublicId,
      use_filename: true,
      unique_filename: false,
    });
    const viewUrl = result.secure_url.replace(
      "/upload/",
      `/upload/fl_attachment:${finalPublicId.split('.')[0]}/`
    );

    fs.unlinkSync(file.path);

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

  // service
  async getAllContractsByCreateAndRecipient(userId: number) {
    return this.contractRepository.find({
      where: [
        { createdBy: { id: userId } },
        { recipientLinks: { user: { id: userId } } },
      ],
      relations: ["createdBy", "recipientLinks", "recipientLinks.user"],
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


  async verifyContractIntegrity(id: number): Promise<{ status: string; message: string }> {
    let contract;
    try {
      contract = await this.contractRepository.findOne({ where: { id } });
      if (!contract) {
        throw new Error("404: Không tìm thấy hợp đồng");
      }

      const storedHash = contract.hash;
      const fileUrl = contract.file_url;

      if (!fileUrl) {
        throw new Error("404: Không tìm thấy file URL của hợp đồng này.");
      }

      const response = await axios.get(fileUrl, {
        responseType: 'arraybuffer',
      });

      const fileBuffer = Buffer.from(response.data);
      const calculatedHash = crypto
        .createHash('sha256')
        .update(fileBuffer)
        .digest('hex');

      if (calculatedHash === storedHash) {
        return { status: 'verified', message: 'File toàn vẹn.' };
      } else {
        console.warn(`[HASH MISMATCH] Hợp đồng #${id}. Lưu trữ: ${storedHash}, Tính toán: ${calculatedHash}`);
        return { status: 'mismatch', message: 'Cảnh báo: File không khớp với bản gốc!' };
      }

    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;

        if (status === 404) {
          throw new Error(`404: File không tồn tại trên Cloudinary.`);
        }
        if (status === 401 || status === 403) {
          let errorBody = 'Lỗi không được phép';
          try {
            const errorDataString = Buffer.from(error.response.data).toString('utf-8');
            const errorJson = JSON.parse(errorDataString);
            errorBody = errorJson.error?.message || errorBody;
          } catch (e) { }

          if (errorBody.includes('untrusted customer') || errorBody.includes('Unauthorized')) {
            throw new Error(`401: Lỗi Cloudinary: Tài khoản chưa được xác minh (untrusted). Vui lòng thêm thẻ thanh toán.`);
          }
        }
        throw new Error(`500: Lỗi từ Cloudinary: ${error.response.statusText}`);
      }
      throw error;
    }
  }

  async viewContract(contractId: number, userId: number, res: Response) {
    const contract = await this.contractRepository.findOne({
      where: { id: contractId },
      relations: [
        "createdBy",
        "recipientLinks",
        "recipientLinks.user",
      ],
    });
    if (!contract) throw new Error("Không tìm thấy hợp đồng");

    const isOwner = contract.createdBy?.id === userId;
    const isRecipient = contract.recipientLinks.some(
      (r) => r.user && r.user.id === userId
    );

    if (!isOwner && !isRecipient) {
      throw new Error("Bạn không có quyền xem hợp đồng này");
    }

    const fileUrl = contract.file_url;
    if (!fileUrl) {
      throw new Error("Hợp đồng này chưa có file đính kèm");
    }

    const response = await axios.get(fileUrl, { responseType: "stream" });
    res.setHeader("Content-Type", "application/pdf");
    response.data.pipe(res);
  }



  async getContractById(id: number) {
    const contract = await this.contractRepository
      .createQueryBuilder("contract")
      // Liên kết bảng
      .leftJoinAndSelect("contract.createdBy", "createdBy")
      .leftJoinAndSelect("contract.signatures", "signatures")
      .leftJoinAndSelect("signatures.user", "signatureUser")
      .leftJoinAndSelect("contract.recipientLinks", "recipientLinks")
      .leftJoinAndSelect("recipientLinks.user", "recipientUser")

      // Điều kiện
      .where("contract.id = :id", { id })

      // Các trường cần lấy
      .select([
        "contract.id",
        "contract.title",
        "contract.description",
        "contract.hash",
        "contract.status",
        "contract.file_url",
        "contract.fileType",
        "contract.fileSize",
        "contract.createdAt",
        "contract.updatedAt",

        // Người tạo hợp đồng
        "createdBy.id",
        "createdBy.name",
        "createdBy.email",

        // Chữ ký
        "signatures.id",
        "signatures.signatureHash",
        "signatures.isValid",
        "signatures.signedAt",
        "signatureUser.id",
        "signatureUser.name",
        "signatureUser.email",


        "recipientLinks.sign_status",
        "recipientLinks.signed_at",
        "recipientUser.id",
        "recipientUser.name",
        "recipientUser.email",
      ])
      .getOne();

    if (!contract) throw new Error("Không tìm thấy hợp đồng");

    return contract;
  }


  async updateStatus(id: number, status: string, userId: number) {
    const validStatuses = ["draft", "pending", "signed", "cancelled"];
    if (!validStatuses.includes(status))
      throw new Error("Trạng thái không hợp lệ");

    const contract = await this.contractRepository.findOne({
      where: { id },
      relations: ["createdBy"],
    });
    if (!contract) throw new Error("Không tìm thấy hợp đồng");

    if (contract.createdBy.id !== userId) {
      throw new Error("Bạn không có quyền cập nhật trạng thái hợp đồng này");
    }
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

  async assignContractToUser(
    contractId: number,
    senderId: number,
    recipientIds: number[]
  ) {
    const contract = await this.contractRepository.findOne({
      where: { id: contractId },
    });
    if (!contract) throw new Error("Không tìm thấy hợp đồng");

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

