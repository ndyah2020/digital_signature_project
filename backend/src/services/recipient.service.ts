import { AppDataSource } from "../config/data_source";
import { ContractRecipient } from "../entities/ContractRecipient";
import { SignatureService } from "../services/signature.service";
import { ContractService } from "../services/contract.service";

export class RecipientService {
    private recipientRepo = AppDataSource.getRepository(ContractRecipient);
    private signatureService = new SignatureService();
    private contractService = new ContractService();
    
    async verifySignOfRecipient(contractId: number, contractHashByCould: string) {
        const contract = await this.contractService.getContractById(contractId);
        if(!contract) throw new Error("Hợp đồng không tồn tại");

        if(!contract.file_url) throw new Error("Không tồn tại file url");

        // const contractHashByCould = await this.contractService.getDocumentAndHash(contract.file_url);
        const result = this.signatureService.verifySignature(contractId, contractHashByCould);

        return result
    }
    // phần verify chưa hoàn thành

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

