import { AppDataSource } from "../config/data_source";
import { ContractRecipient } from "../entities/ContractRecipient";
import { Signature } from "../entities/Signature";
import { Contract } from "../entities/Contract";

export class RecipientService {
    private recipientRepo = AppDataSource.getRepository(ContractRecipient);
    private signatureRepo = AppDataSource.getRepository(Signature)
    private contractsRepo = AppDataSource.getRepository(Contract)
    
    // async verifySignOfRecipient(contractId: number) {
    //     const contract = await this.contractsRepo
    // }

    async getRecipientbyContract(contractId: number) {
        const recipient = await this.recipientRepo.find({
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
        return recipient;
    }
}

