import { AppDataSource } from "../config/data_source";
import { Contract, ContractStatus } from "../entities/Contract";
import { Signature } from "../entities/Signature";
import { User, UserRole } from "../entities/User";
import { AuditLogService } from "../services/auditLog.service";
import { ContractRecipient, SignStatus } from "../entities/ContractRecipient";
const crypto = require("crypto");
export class SignatureService {
  private signatureRepository = AppDataSource.getRepository(Signature);
  private userRepository = AppDataSource.getRepository(User);
  private contractRepository = AppDataSource.getRepository(Contract);
  private auditService = new AuditLogService();
  // ký hợp đồng
  async signContract(contractId: number, userId: number, password: string) {
    return await AppDataSource.manager.transaction(async (tx) => {
      const contractRepo = tx.getRepository(Contract);
      const recipientRepo = tx.getRepository(ContractRecipient);
      const signatureRepo = tx.getRepository(Signature);
      const userRepo = tx.getRepository(User);

      // Lấy thông tin hợp đồng và người dùng
      const contract = await contractRepo.findOne({
        where: { id: contractId },
      });
      if (!contract) throw new Error("Hợp đồng không tồn tại");

      const user = await userRepo.findOne({ where: { id: userId } });
      if (!user) throw new Error("Người dùng không tồn tại");

      // Kiểm tra quyền ký
      const link = await recipientRepo.findOne({
        where: { contractId, userId },
      });
      const isRecipient = !!link;
      if (
        user.role !== UserRole.ADMIN &&
        !isRecipient &&
        contract.createdBy?.id !== userId
      ) {
        throw new Error("Bạn không có quyền ký hợp đồng này");
      }

      if (link && link.sign_status === SignStatus.SIGNED) {
        throw new Error("Bạn đã ký hợp đồng này rồi");
      }

      if (!user.privateKeyEncrypted) {
        throw new Error("Không tìm thấy private key");
      }

      //Giải mã private key bằng password user
      let privateKey: string;
      try {
        const [ivBase64, encryptedData] = user.privateKeyEncrypted.split(":");
        const iv = Buffer.from(ivBase64, "base64");
        const encryptionKey = crypto
          .createHash("sha256")
          .update(password)
          .digest();
        const decipher = crypto.createDecipheriv(
          "aes-256-cbc",
          encryptionKey,
          iv
        );
        let decrypted = decipher.update(encryptedData, "base64", "utf8");
        decrypted += decipher.final("utf8");
        privateKey = decrypted;
      } catch (err) {
        throw new Error("Giải mã khóa riêng tư thất bại. Mật khẩu có thể sai.");
      }

      // Tạo chữ ký số (RSA-PSS-SHA256)
      const signer = crypto.createSign("RSA-SHA256");
      signer.update(contract.hash);
      signer.end();

      const signatureBuffer = signer.sign({
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        saltLength: 32,
      });

      const signatureHash = signatureBuffer.toString("base64");

      //Xác minh chữ ký bằng publicKey của user
      let isValid = false;
      try {
        const verifier = crypto.createVerify("RSA-SHA256");
        verifier.update(contract.hash);
        verifier.end();

        isValid = verifier.verify(
          {
            key: user.publicKey,
            padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
            saltLength: 32,
          },
          Buffer.from(signatureHash, "base64")
        );
      } catch {
        isValid = false;
      }

      // Lưu chữ ký vào DB
      const newSignature = signatureRepo.create({
        contract: { id: contractId },
        user: { id: userId },
        signatureAlgo: "RSA-PSS-SHA256",
        signatureHash,
        isValid,
      });
      await signatureRepo.save(newSignature);

      // Cập nhật trạng thái người ký (contract_recipients)
      if (isRecipient) {
        link.sign_status = isValid ? SignStatus.SIGNED : SignStatus.FAILED;
        link.signed_at = new Date();
        await recipientRepo.save(link);
      }

      //Nếu tất cả recipients đã ký hợp lệ → cập nhật contract.status = "signed"
      const pendingCount = await recipientRepo.count({
        where: { contractId, sign_status: SignStatus.PENDING },
      });
      const failedCount = await recipientRepo.count({
        where: { contractId, sign_status: SignStatus.FAILED },
      });

      if (pendingCount === 0 && failedCount === 0) {
        contract.status = ContractStatus.SIGNED;
        contract.updatedAt = new Date();
        await contractRepo.save(contract);

        await this.auditService.createLog(
          userId,
          "CONTRACT_FULLY_SIGNED",
          `Hợp đồng #${contractId} đã được ký đầy đủ bởi tất cả người nhận.`
        );
      }

      // Ghi log hành động ký
      await this.auditService.createLog(
        userId,
        "SIGN_CONTRACT",
        `Người dùng ${user.name} ký hợp đồng ID ${contractId} (${
          isValid ? "Hợp lệ" : "Không hợp lệ"
        })`
      );

      return {
        message: isValid ? "Ký hợp đồng thành công" : "Chữ ký không hợp lệ",
        signatureId: newSignature.id,
        isValid,
      };
    });
  }

  // xác minh chữ ký số
  async verifySignature(signatureId: number) {
    const signature = await this.signatureRepository.findOne({
      where: { id: signatureId },
      relations: ["contract", "user"],
    });
    if (!signature) throw new Error("Không tìm thấy chữ ký");

    const { contract, user } = signature;
    if (!user.publicKey) throw new Error("Người dùng không có public key");

    // Tạo lại hash từ hợp đồng (Hash 2)
    const hash2 = contract.hash;

    // Giải mã và xác minh chữ ký (Hash 1)
    const verifier = crypto.createVerify("RSA-SHA256");
    verifier.update(hash2);
    verifier.end();

    const isValid = verifier.verify(
      {
        key: user.publicKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        saltLength: 32,
      },
      Buffer.from(signature.signatureHash, "base64")
    );

    signature.isValid = isValid;
    await this.signatureRepository.save(signature);

    await this.auditService.createLog(
      user.id,
      "VERIFY_SIGNATURE",
      `Xác minh chữ ký ID ${signature.id} cho hợp đồng ${contract.id} → ${
        isValid ? "Hợp lệ" : "Không hợp lệ"
      }`
    );

    return { isValid };
  }
  async getSignatureById(signatureId: number) {
    return await this.signatureRepository.findOne({
      where: { id: signatureId },
      relations: ["user", "contract"],
    });
  }
  async getSignaturesByContract(contractId: number) {
    return await this.signatureRepository.find({
      where: { contract: { id: contractId } },
      relations: ["user"],
      order: { signedAt: "DESC" },
    });
  }
  async getAllSignatures() {
    return await this.signatureRepository.find({
      relations: ["user", "contract"],
    });
  }
}
