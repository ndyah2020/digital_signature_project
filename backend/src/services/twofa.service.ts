const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
import { PendingSign } from "../entities/PendingSign";
import { AppDataSource } from "../config/data_source";
import { User } from "../entities/User";

export class TwoFAService {
  private userRepo = AppDataSource.getRepository(User);
  private pendingRepo = AppDataSource.getRepository(PendingSign);

  // Mã hoá secret bằng pepper
  private encryptWithPepper(plaintext: string): string {
    const key = crypto
      .createHash("sha256")
      .update(process.env.SERVER_PEPPER || "")
      .digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let enc = cipher.update(plaintext, "utf8", "base64");
    enc += cipher.final("base64");
    return iv.toString("base64") + ":" + enc;
  }

  private decryptWithPepper(blob: string): string {
    const [ivB64, enc] = blob.split(":");
    const iv = Buffer.from(ivB64, "base64");
    const key = crypto
      .createHash("sha256")
      .update(process.env.SERVER_PEPPER || "")
      .digest();
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let dec = decipher.update(enc, "base64", "utf8");
    dec += decipher.final("utf8");
    return dec;
  }
  public verifyTOTP(user: any, token: string): boolean {
    if (!user.totpSecret) return false;

    const secret = this.decryptWithPepper(user.totpSecret);

    return speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
      window: 1, // chấp nhận lệch 30s
    });
  }
  async generateTotpSecret(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    const secret = speakeasy.generateSecret({
      name: `SignatureApp (${user.email})`,
      length: 20,
    });

    // Lưu secret (mã hoá)
    const encryptedSecret = this.encryptWithPepper(secret.base32);
    user.totpSecret = encryptedSecret;
    user.isTotpEnabled = false;
    await this.userRepo.save(user);

    // Trả về QR code URL
    const qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url);

    return {
      message: "Tạo secret thành công, quét QR để thêm vào Authenticator.",
      qrCodeDataURL,
    };
  }

  async enableTotp(userId: number, token: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || !user.totpSecret) throw new Error("User chưa setup TOTP");

    const secret = this.decryptWithPepper(user.totpSecret);
    const verified = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
      window: 1,
    });

    if (!verified) throw new Error("Mã TOTP không hợp lệ");

    user.isTotpEnabled = true;
    await this.userRepo.save(user);

    return { message: "Kích hoạt 2FA thành công" };
  }

  // Gửi email OTP
  async sendEmailOtp(userId: number, contractId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new Error("User không tồn tại");

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hash = crypto.createHash("sha256").update(code).digest("hex");
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); 

    // Xóa bản ghi cũ nếu có
    await this.pendingRepo.delete({
      user: { id: userId },
      contract: { id: contractId },
    });

    // Lưu vào bảng pending_signs
    const pending = this.pendingRepo.create({
      user: { id: userId },
      contract: { id: contractId },
      otpHash: hash,
      otpExpiresAt: expiresAt,
    });
    await this.pendingRepo.save(pending);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_SMTP_USER,
        pass: process.env.EMAIL_SMTP_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: user.email,
      subject: "Mã OTP xác thực ký hợp đồng",
      text: `Mã OTP của bạn là: ${code}. Mã này sẽ hết hạn sau 5 phút.`,
    });

    return { access: true, message: "Đã gửi OTP qua email" };
  }

  async verifyEmailOtp(userId: number, contractId: number, code: string) {
    const pending = await this.pendingRepo.findOne({
      where: { user: { id: userId }, contract: { id: contractId } },
      relations: ["user", "contract"],
    });

    if (!pending) throw new Error("Không tìm thấy yêu cầu ký đang chờ");
    if (pending.isVerified) throw new Error("OTP đã được xác minh trước đó");
    if (new Date() > pending.otpExpiresAt) throw new Error("OTP đã hết hạn");

    const hash = crypto.createHash("sha256").update(code).digest("hex");
    if (hash !== pending.otpHash) throw new Error("Mã OTP không hợp lệ");

    pending.isVerified = true;
    pending.verifiedAt = new Date();
    await this.pendingRepo.save(pending);

    return { success: true, message: "Xác minh OTP thành công" };
  }
}
