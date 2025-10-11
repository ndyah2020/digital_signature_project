import { AppDataSource } from "../config/data_source";
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = "1h";
export class AuthService {
  private userRepo = AppDataSource.getRepository("User");

  async register(name: string, email: string, password: string) {
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) {
      throw new Error("Email already in use");
    }
    // hash password
    const passwordHash = bcrypt.hashSync(password, 10);

    // Sinh cặp khóa RSA
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });

    // Mã hóa khóa riêng tư bằng mật khẩu của user (hoặc secret nội bộ)
    //    AES-256-CBC để bảo mật private key
    const encryptionKey = crypto.createHash("sha256").update(password).digest(); // key 32 bytes
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", encryptionKey, iv);
    let encrypted = cipher.update(privateKey, "utf8", "base64");
    encrypted += cipher.final("base64");
    const privateKeyEncrypted = iv.toString("base64") + ":" + encrypted;

    const user = this.userRepo.create({
      name,
      email,
      passwordHash,
      public_key: publicKey,
      role: "signer",
      private_key_encrypted: privateKeyEncrypted,
    });
    await this.userRepo.save(user);

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN, algorithm: "HS256" }
    );
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new Error("Sai email hoặc mật khẩu");

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) throw new Error("Sai mật khẩu");

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
        algorithm: "HS256",
      }
    );
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
