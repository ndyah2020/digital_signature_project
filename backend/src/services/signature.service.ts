import { AppDataSource } from "../config/data_source";
import { Contract } from "../entities/Contract";
import { Signature } from "../entities/Signature";
import { User } from "../entities/User";
import { AuditLogService } from "../services/auditLog.service";
const crypto = require("crypto");
export class SignatureService {
  private signatureRepository = AppDataSource.getRepository(Signature);
  private userRepository = AppDataSource.getRepository(User);
  private contractRepository = AppDataSource.getRepository(Contract);
  private auditService = new AuditLogService();
  // ký hợp đồng
  async signContract(contractId: number, userId: number, password: string) {
    const contract = await this.contractRepository.findOne({
      where: { id: contractId },
    });
    if (!contract) throw new Error("Hợp đồng không tồn tại");
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error("Người dùng không tồn tại");

    if (!user.privateKeyEncrypted)
      throw new Error("Không tìm thấy private key");

    // Giải mã khóa riêng tư
    const [ivBase64, encryptedData] = user.privateKeyEncrypted.split(":");
    const iv = Buffer.from(ivBase64, "base64");
    const encryptionKey = crypto.createHash("sha256").update(password).digest();
    const decipher = crypto.createDecipheriv("aes-256-cbc", encryptionKey, iv);
    let decrypted = decipher.update(encryptedData, "base64", "utf8");
    decrypted += decipher.final("utf8");
    const privateKey = decrypted;

    // Tạo chữ ký số (RSA-PSS-SHA256)
    const signer = crypto.createSign("RSA-SHA256");
    signer.update(contract.hash);
    signer.end();
    const signature = signer.sign({
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: 32,
    });
    const signatureHash = signature.toString("base64");

    // lưu vào DB

    const newSignature = this.signatureRepository.create({
      contract: { id: contractId },
      user: { id: userId },
      signatureAlgo: "RSA-PSS-SHA256",
      signatureHash: signatureHash,
      isValid: false, // xác minh sau
    });
    await this.signatureRepository.save(newSignature);

    // ghi log
    await this.auditService.createLog(
      user.id,
      "SIGN_CONTRACT",
      `Người dùng ${user.name} ký hợp đồng ID ${contract.id}`
    );
    return newSignature;
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
