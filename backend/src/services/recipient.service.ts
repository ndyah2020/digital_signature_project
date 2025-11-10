import { AppDataSource } from "../config/data_source";
import { ContractRecipient } from "../entities/ContractRecipient";


export class RecipientService {
    private recipientRepo = AppDataSource.getRepository(ContractRecipient);
    async getRecipientbyContract(contractId: number) {
        const recipients = await this.recipientRepo.find({
            where: {
                contractId: contractId,
            },
            relations: ["user"],
            select: {
                contractId: true,
                userId: true,
                sign_status: true,
                signed_at: true,
                deadline: true,
                isExpired: true,
                user: {
                    id: true,
                    name: true,
                    email: true,
                }
            }
        });
        return recipients;
    }
}

