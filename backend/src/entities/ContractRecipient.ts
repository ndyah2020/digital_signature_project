import { Entity, Column, ManyToOne, PrimaryColumn, JoinColumn } from "typeorm";
import { Contract } from "./Contract";
import { User } from "./User";

export enum SignStatus {
  PENDING = "pending",
  SIGNED = "signed",
  FAILED = "failed",
  EXPIRED = "expired",
  REMOVED = "removed",
}
export enum OnExpireAction {
  CANCEL = "cancel", // hủy hợp đồng
  REMOVE = "remove", // loại bỏ người đó khỏi danh sách ký
  EXTEND = "extend", // tự động gia hạn
}
@Entity({ name: "contract_recipients" })
export class ContractRecipient {
  @PrimaryColumn({ name: "contract_id" })
  contractId: number;

  @PrimaryColumn({ name: "user_id" })
  userId: number;

  @ManyToOne(() => Contract, (contract) => contract.recipientLinks, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "contract_id" })
  contract: Contract;

  @ManyToOne(() => User, (user) => user.recipientLinks, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({
    type: "enum",
    enum: SignStatus,
    default: SignStatus.PENDING,
  })
  sign_status: SignStatus;

  @Column({ type: "timestamp", nullable: true })
  signed_at: Date | null;

  @Column({ type: "timestamp", nullable: true })
  deadline: Date | null; // hạn ký cho từng người

  @Column({ type: "boolean", default: false })
  isExpired: boolean;

  @Column({
    type: "enum",
    enum: OnExpireAction,
    default: OnExpireAction.REMOVE,
  })
  onExpireAction: OnExpireAction;
}
