import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Contract } from "./Contract";

@Entity({ name: "signatures" })
export class Signature {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Contract, (contract) => contract.signatures, {
    onDelete: "CASCADE",
  })
  contract: Contract;

  @ManyToOne(() => User, (user) => user.signatures, {
    onDelete: "CASCADE",
  })
  user: User;

  @Column({ name: "signature_algo", length: 50, default: "RSA-PSS-SHA256" })
  signatureAlgo: string;

  @Column({ name: "signature_hash", type: "text" })
  signatureHash: string;

  @Column({ name: "is_valid", type: "boolean", default: false })
  isValid: boolean;

  @CreateDateColumn({ name: "signed_at" })
  signedAt: Date;
}
