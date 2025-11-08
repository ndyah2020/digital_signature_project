import { AppDataSource } from "../config/data_source";
import { ContractRecipient } from "../entities/ContractRecipient";
import { SignatureService } from "../services/signature.service";
import { ContractService } from "../services/contract.service";

export class RecipientService {
    private recipientRepo = AppDataSource.getRepository(ContractRecipient);
    private signatureService = new SignatureService();
    private contractService = new ContractService();

    async verifySignWhenGetRecipient(contractId: number) {
        try {
            const contract = await this.contractService.getContractById(contractId);
            if (!contract) throw new Error("Hợp đồng không tồn tại");
            if (!contract.file_url) throw new Error("Không tồn tại file url");
            const contractHashByCloud = await this.contractService.getDocumentAndHash(contract.file_url);

            const signatures = await this.signatureService.getSignaturesByContract(contractId);

            const results = await Promise.all(
                signatures.map(async (signature) => {                 
                    return await this.signatureService.verifySignature(signature, contractHashByCloud);
                })
            );
            return results;

        } catch (error: any) {
            console.error(`[verifySignWhenGetRecipient] Lỗi: ${error.message}`);
            throw error;
        }
    }


    async getRecipientbyContract(contractId: number) {
        this.verifySignWhenGetRecipient(contractId)
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

