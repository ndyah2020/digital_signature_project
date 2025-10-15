import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { User } from "./User";
import { Signature } from "./Signature";

export enum ContractStatus {
  DRAFT = "draft",
  PENDING = "pending",
  SIGNED = "signed",
  CANCELLED = "cancelled",
}

@Entity({ name: "contracts" })
export class Contract {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({
    name: "file_url",
    type: "text",
    nullable: true,
  })
  file_url: string | null;

  @Column({ name: "file_type", type: "varchar", length: 50, nullable: true })
  fileType: string | null;

  @Column({ name: "file_size", type: "bigint", nullable: true })
  fileSize: number | null;

  @Column({ type: "text", nullable: true })
  hash: string | null;

  @Column({
    type: "enum",
    enum: ContractStatus,
    default: ContractStatus.DRAFT,
  })
  status: ContractStatus;

  @ManyToOne(() => User, (user) => user.contracts, { onDelete: "SET NULL" })
  createdBy: User;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Signature, (signature) => signature.contract)
  signatures: Signature[];
}
