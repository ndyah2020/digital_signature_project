import { AppDataSource } from "../config/data_source";
import { Contract, ContractStatus } from "../entities/Contract";
import { Signature } from "../entities/Signature";
import { User, UserRole } from "../entities/User";
import { AuditLogService } from "../services/auditLog.service";
import { ContractService } from "../services/contract.service";
import { ContractRecipient, SignStatus } from "../entities/ContractRecipient";
import { PendingSign } from "../entities/PendingSign";

const crypto = require("crypto");
export class SignatureService {
  private signatureRepository = AppDataSource.getRepository(Signature);
  private recipientRepository = AppDataSource.getRepository(ContractRecipient);
  private auditService = new AuditLogService();
  private contractService = new ContractService();
  // ký hợp đồng
  async signContract(contractId: number, userId: number, password: string) {
    return await AppDataSource.manager.transaction(async (tx) => {
      const contractRepo = tx.getRepository(Contract);
      const recipientRepo = tx.getRepository(ContractRecipient);
      const signatureRepo = tx.getRepository(Signature);
      const userRepo = tx.getRepository(User);
      const pendingSignRepo = tx.getRepository(PendingSign);

      const contract = await tx.getRepository(Contract).findOne({
        where: { id: contractId },
        relations: ["signatures", "signatures.user"],
        cache: false, // ← BẮT BUỘC
      });
      if (!contract) throw new Error("Hợp đồng không tồn tại");

      const user = await userRepo.findOne({ where: { id: userId } });
      if (!user) throw new Error("Người dùng không tồn tại");

      const pendingSign = await pendingSignRepo.findOne({
        where: {
          user: { id: userId },
          contract: { id: contractId },
          isVerified: true,
        },
      });

      if (!pendingSign?.isVerified) {
        throw new Error(
          "Xác thực ký không hợp lệ. Bạn cần xác thực OTP qua email trước."
        );
      }

      // Kiểm tra quyền recipient
      const link = await recipientRepo.findOne({
        where: { contractId, userId },
      });
      const isRecipient = !!link;
      if (
        user.role !== UserRole.ADMIN &&
        !isRecipient &&
        user.role !== UserRole.SIGNER
      ) {
        throw new Error("Bạn không có quyền ký hợp đồng này");
      }
      // Nếu đã ký rồi
      if (link && link.sign_status === SignStatus.SIGNED)
        throw new Error("Bạn đã ký rồi");
      // Nếu đã expired
      if (link && link.isExpired) {
        throw new Error("Thời hạn ký hợp đồng đã hết");
      }
      // Nếu có deadline và đã quá hạn
      if (link && link.deadline && new Date() > new Date(link.deadline)) {
        link.isExpired = true;
        await recipientRepo.save(link);
        throw new Error("Hạn ký hợp đồng đã vượt quá");
      }
      if (!user.privateKeyEncrypted)
        throw new Error("Không tìm thấy private key");

      //  xác minh tất cả chữ ký hiện có để đảm bảo file/hash không bị thay đổi ---
      const masterHash = contract.hash;
      if (!contract.file_url) throw new Error("Hợp đồng gốc không tồn tại");

      const cloudHash = await this.contractService.getDocumentAndHash(
        contract.file_url
      );
      if (masterHash !== cloudHash) {
        throw new Error(
          "Phát hiện file hợp đồng trên cloud đã bị thay đổi... hoăc lỗi lấy dữ liệu"
        );
      }

      if (!masterHash)
        throw new Error("Hợp đồng chưa có giá trị hash để xác minh");
      // Nếu có chữ ký trước đó, cần verify từng chữ ký đó với publicKey của người ký tương ứng
      if (contract.signatures && contract.signatures.length > 0) {
        for (const existingSig of contract.signatures) {
          // existingSig.user có thể là undefined nếu relation không đầy đủ — bảo đảm có relation khi query
          if (!existingSig.user || !existingSig.user.publicKey) {
            throw new Error(
              `Không thể xác minh chữ ký (thiếu publicKey cho signature id=${existingSig.id})`
            );
          }

          try {
            const verifier = crypto.createVerify("RSA-SHA256");
            verifier.update(masterHash);
            verifier.end();
            const ok = verifier.verify(
              {
                key: existingSig.user.publicKey,
                padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
                saltLength: 32,
              },
              Buffer.from(existingSig.signatureHash, "base64")
            );
            if (!ok) {
              throw new Error(
                `Phát hiện chữ ký không hợp lệ từ ${existingSig.user.email}. Hủy thao tác ký để bảo toàn an toàn.`
              );
            }
          } catch (err: any) {
            // Bất kỳ lỗi verify nào cũng dừng quy trình ký để tránh gắn thêm chữ ký vào hợp đồng bị thay đổi
            throw new Error(
              `Xác minh chữ ký hiện có thất bại: ${err.message || err}`
            );
          }
        }
      }

      //  Giải mã private key bằng password + pepper
      const pepper = process.env.SERVER_PEPPER || "";
      const encryptionKey = crypto
        .createHash("sha256")
        .update(password + pepper)
        .digest();

      // Giải mã private key
      let privateKey: string;
      try {
        const [ivBase64, encryptedData] = user.privateKeyEncrypted.split(":");
        const iv = Buffer.from(ivBase64, "base64");
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

      // Ký hash hợp đồng bằng privateKey (RSA-PSS-SHA256)
      const signer = crypto.createSign("RSA-SHA256");
      signer.update(contract.hash);
      signer.end();
      const signatureBuffer = signer.sign({
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        saltLength: 32,
      });
      const signatureHash = signatureBuffer.toString("base64");

      // Xóa private key khỏi bộ nhớ an toàn
      try {
        const tmp = Buffer.from(privateKey, "utf8");
        tmp.fill(0);
      } catch (e) {
        // ignore
      }

      // Immediately wipe privateKey variable
      privateKey = "";

      // Verify with publicKey as additional check
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
      if (!isValid) {
        throw new Error(
          "Xác thực chữ ký sau khi ký thất bại. Chữ ký không hợp lệ. Mọi thao tác đã được hủy bỏ."
        );
      }

      // Save signature & update recipient as before
      const newSignature = signatureRepo.create({
        contract: { id: contractId } as Contract,
        user: user,
        signatureAlgo: "RSA-PSS-SHA256",
        signatureHash,
        isValid,
      });
      await signatureRepo.save(newSignature);

      // Nếu là recipient, cập nhật sign_status và signed_at
      if (isRecipient) {
        link.sign_status = isValid ? SignStatus.SIGNED : SignStatus.FAILED;
        link.signed_at = new Date();
        await recipientRepo.save(link);
      }

      // Cập nhật trạng thái hợp đồng: nếu không còn pending và không có failed -> signed
      const pendingCount = await recipientRepo.count({
        where: { contractId, sign_status: SignStatus.PENDING },
      });
      const failedCount = await recipientRepo.count({
        where: { contractId, sign_status: SignStatus.FAILED },
      });

      if (pendingCount === 0 && failedCount === 0) {
        // Không đụng vào entity contract → không gây detach ;An toàn với race condition
        await contractRepo.update(contractId, {
          status: ContractStatus.SIGNED,
          updatedAt: new Date(),
        });
        await this.auditService.createLog(
          userId,
          "CONTRACT_FULLY_SIGNED",
          `Hợp đồng #${contractId} đã được ký đầy đủ.`
        );
      }

      // xóa bảng ghi xác thực otp sau khi ký thành công
      await pendingSignRepo.delete(pendingSign.id);

      await this.auditService.createLog(
        userId,
        "SIGN_CONTRACT",
        `Người dùng ${user.name} ký hợp đồng ID ${contractId} (${isValid ? "Hợp lệ" : "Không hợp lệ"
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
  private async verifySignature(signature: Signature, documentHashFromCloud: string) {
    if (!signature) throw new Error("Không tìm thấy chữ ký");
    const verifier = crypto.createVerify("RSA-SHA256");
    verifier.update(documentHashFromCloud);
    verifier.end();
    const isValid = verifier.verify(
      {
        key: signature.user.publicKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        saltLength: 32,
      },
      Buffer.from(signature.signatureHash, "base64")
    );

    signature.isValid = isValid;
    await this.signatureRepository.save(signature);

    await this.auditService.createLog(
      signature.user.id,
      "VERIFY_SIGNATURE",
      `Xác minh chữ ký ID ${signature.id} của ${signature.user.name} → ${isValid ? "Hợp lệ" : "Không hợp lệ hoặc file hợp đồng đã bị thay đổi"
      }`
    );
    return isValid;
  }

  async verifySignatures(signatures: Signature[], url_contract: string) {
    let couldHash: string;
    try {
      couldHash = await this.contractService.getDocumentAndHash(url_contract);
      if (!couldHash) {
        throw new Error("Không lấy được hash file gốc");
      }
    } catch (error: any) {
      console.error("Lỗi xác thực hash, tiến hành vô hiệu hóa chữ ký:", error.message);
      if (signatures.length > 0) {
        signatures.forEach(sig => sig.isValid = false);
        await this.signatureRepository.save(signatures);
        console.log(`Đã cập nhật isValid = false cho ${signatures.length} chữ ký.`);
      }
      throw new Error("Không thể lấy được file trên cloud");
    }

    if (signatures.length <= 0) {
      throw new Error("Chưa có người ký để xác thực");
    }

    const verificationPromises = signatures.map(signature => {
      return this.verifySignature(signature, couldHash);
    });

    const results = await Promise.all(verificationPromises);
    return results.every(isValid => isValid === true);
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
      relations: ["user", "contract"],
      select: {
        id: true,
        contract: {
          id: true,
          file_url: true,
        },
        user: {
          id: true,
          name: true,
          email: true,
          publicKey: true,
        },
        signatureHash: true,
        isValid: true,
      },
      order: { signedAt: "DESC" },
    });
  }

  async getAllSignatures() {
    return await this.signatureRepository.find({
      relations: ["user", "contract"],
    });
  }

  async checkSigner(userId: number, contractId: number) {
    const recipient = await this.recipientRepository.findOne({
      where: {
        contractId,
        userId,
      },
    });
    if (!recipient) {
      throw new Error(`Bạn không có quyền truy cập hợp đồng này`);
    }

    if (recipient?.sign_status === SignStatus.SIGNED) {
      throw new Error("Bạn đã ký hợp đồng này")
    }

    if (recipient) return true;
  }
}
