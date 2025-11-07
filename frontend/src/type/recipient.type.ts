import { UserData } from "./auth";

export interface RecipientType {
    contractId: string,
    userId: number,
    user: UserData,
    sign_status: string,
    signed_at: Date,
    deadline: Date,
    isExpired: boolean
}
