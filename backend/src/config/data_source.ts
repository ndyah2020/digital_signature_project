import "reflect-metadata";
import { DataSource } from "typeorm";
const dotenv = require("dotenv");
dotenv.config();

// Import các entity
import { User } from "../entities/User";
import { Contract } from "../entities/Contract";
import { Signature } from "../entities/Signature";
import { AuditLog } from "../entities/AuditLog";

// Khởi tạo DataSource cho PostgreSQL
export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "db",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "postgres",
  database: process.env.DB_NAME || "signature_db",
  synchronize: true,
  logging: false,
  entities: [User, Contract, Signature, AuditLog],
});
