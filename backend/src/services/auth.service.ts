import { signToken } from "../utils/jwt";
import { AppDataSource } from "../config/data_source";
import { User, UserRole } from "../entities/User";
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const speakeasy = require("speakeasy");
export class AuthService {
  private userRepo = AppDataSource.getRepository(User);

  async register(name: string, email: string, password: string) {
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) throw new Error("Email already in use");

    const passwordHash = bcrypt.hashSync(password, 10);

    // Sinh cặp khóa RSA
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });

    // Derive encryption key từ password + pepper
    const pepper = process.env.SERVER_PEPPER || "";
    const encryptionKey = crypto
      .createHash("sha256")
      .update(password + pepper)
      .digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", encryptionKey, iv);
    let encrypted = cipher.update(privateKey, "utf8", "base64");
    encrypted += cipher.final("base64");
    const privateKeyEncrypted = iv.toString("base64") + ":" + encrypted;

    // Tạo TOTP secret (chỉ tạo, chưa enable)
    const totpSecret = speakeasy.generateSecret({ length: 20 });
    // totpSecret.base32 chứa secret cho app Authenticator
    // Bạn có thể mã hoá totpSecret.base32 trước khi lưu (recommended)
    const totpSecretToStore = totpSecret.base32; // => consider encrypt before saving

    const user = await this.userRepo.create({
      name,
      email,
      passwordHash,
      publicKey,
      role: UserRole.SIGNER,
      privateKeyEncrypted,
      totpSecret: totpSecretToStore,
      isTotpEnabled: false,
    });

    await this.userRepo.save(user);

    // ...existing code...

    // trả về otpauth_url để client hiển thị QR code (nếu muốn user enable 2FA)
    return {
      token: signToken({ sub: user.id, email: user.email,  name: user.name, role: user.role }),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      totp: {
        // dùng totp.otpauth_url để client render QR code nếu muốn enable 2FA
        otpauth_url: totpSecret.otpauth_url,
        base32: totpSecret.base32, // KHÔNG bắt buộc gửi, cẩn thận (chỉ dùng khi cần)
      },
    };
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new Error("Sai email hoặc mật khẩu");

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) throw new Error("Sai mật khẩu");

    const token = signToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    return {
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
