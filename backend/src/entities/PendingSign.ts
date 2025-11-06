import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./User";
import { Contract } from "./Contract";

@Entity({ name: "pending_signs" })
export class PendingSign {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.pendingSigns, {
    onDelete: "CASCADE",
  })
  user: User;

  @ManyToOne(() => Contract, (contract) => contract.pendingSigns, {
    onDelete: "CASCADE",
  })
  contract: Contract;

  @Column({ name: "otp_hash", type: "text" })
  otpHash: string;

  @Column({ name: "otp_expires_at", type: "timestamp" })
  otpExpiresAt: Date;

  @Column({ name: "is_verified", type: "boolean", default: false })
  isVerified: boolean;

  @Column({ name: "verified_at", type: "timestamp", nullable: true })
  verifiedAt: Date | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
