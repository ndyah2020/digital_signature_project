import { UserData } from "./auth";

export interface AssignerType {
    sign_status: string,
    signed_at: Date,
    user: UserData,
}
