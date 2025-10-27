const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
import { AppDataSource } from "../config/data_source";
import { User } from "../entities/User";

export class TwoFAService {
  private userRepo = AppDataSource.getRepository(User);
  private otpTempStore = new Map<
    string,
    { codeHash: string; expiresAt: number }
  >();

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
  async sendEmailOtp(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new Error("User không tồn tại");

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hash = crypto.createHash("sha256").update(code).digest("hex");
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 phút

    this.otpTempStore.set(user.email, { codeHash: hash, expiresAt });

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SMTP_HOST,
      port: Number(process.env.EMAIL_SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_SMTP_USER,
        pass: process.env.EMAIL_SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: user.email,
      subject: "Mã OTP xác thực ký hợp đồng",
      text: `Mã OTP của bạn là: ${code}. Mã này hết hạn sau 5 phút.`,
    });

    return { message: "Đã gửi OTP qua email" };
  }

  async verifyEmailOtp(userId: number, code: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new Error("User không tồn tại");

    const entry = this.otpTempStore.get(user.email);
    if (!entry) throw new Error("Chưa yêu cầu OTP");
    if (Date.now() > entry.expiresAt) throw new Error("OTP đã hết hạn");

    const hash = crypto.createHash("sha256").update(code).digest("hex");
    if (hash !== entry.codeHash) throw new Error("Mã OTP sai");

    this.otpTempStore.delete(user.email);
    return { message: "Xác minh OTP thành công" };
  }
}
