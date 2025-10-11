import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { User } from "./User";

@Entity({ name: "audit_logs" })
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.logs, { onDelete: "SET NULL" })
  user: User;

  @Column({ length: 100 })
  action: string;

  @Column({ type: "text", nullable: true })
  details: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
