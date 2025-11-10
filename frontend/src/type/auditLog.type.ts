import { UserData } from "./auth.type";

export interface AuditLogType {
    id: number,
    action: string,
    details: string,
    user: UserData,
    createdAt: Date,
}