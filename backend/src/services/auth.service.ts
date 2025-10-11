import { AppDataSource } from "../config/data_source";
const bcrypt = require("bcrypt");
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
    const passwordHash = bcrypt.hashSync(password, 10);
    const user = this.userRepo.create({
      name,
      email,
      passwordHash,
      role: "signer",
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

    const match = bcrypt.compare(password, user.passwordHash);
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
