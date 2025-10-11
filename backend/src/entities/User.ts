import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Contract } from "./Contract";
import { Signature } from "./Signature";
import { AuditLog } from "./AuditLog";

export enum UserRole {
  ADMIN = "admin",
  SIGNER = "signer",
  VIEWER = "viewer",
}

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 150, unique: true })
  email: string;

  @Column({ name: "password_hash", length: 255 })
  passwordHash: string;

  @Column({ type: "text", nullable: true })
  publicKey: string | null;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.SIGNER,
  })
  role: UserRole;

  @Column({ name: "private_key_encrypted", type: "text", nullable: true })
  privateKeyEncrypted: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Contract, (contract) => contract.createdBy)
  contracts: Contract[];

  @OneToMany(() => Signature, (signature) => signature.user)
  signatures: Signature[];

  @OneToMany(() => AuditLog, (log) => log.user)
  logs: AuditLog[];
}
