import { UserData } from "./auth.type";

export interface AssignerType {
    sign_status: string,
    signed_at: Date,
    user: UserData,
}

export interface RecipientItem {
  userId: number;
  deadlineDays?: number;
  onExpireAction?: "cancel" | "remove" | "extend";
}

export interface AssignPartyVariables {
  contractId: number;
  senderId: number;
  recipientItems: RecipientItem[];
}

export interface RecipientUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface RecipientLink {
  user: RecipientUser;
  sign_status: string;
  signed_at: string | null;
  deadline: string | null;
  isExpired: boolean;
}

export interface ContractSummary {
  id: number;
  title: string;
  createdBy: { id: number; email: string };
  recipientLinks: RecipientLink[];
}
