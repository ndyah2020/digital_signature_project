import { ContractStats, UserStats } from "../types/express/dashboard-stats.types"
import { Contract, ContractStatus } from "../entities/Contract";
import { User, UserRole } from "../entities/User";
import { AppDataSource } from "../config/data_source";
export class StatsService {
    private contractRepository = AppDataSource.getRepository(Contract)
    private userRepository = AppDataSource.getRepository(User)

    async getContractStats(userId: number): Promise<ContractStats> {
        const results = await this.contractRepository.createQueryBuilder("contract")
            .leftJoin("contract.recipientLinks", "recipient")
            .select("contract.status", "status")
            .addSelect("COUNT(DISTINCT contract.id)", "count")

            .where("contract.createdBy.id = :userId", { userId })
            .orWhere("recipient.userId = :userId", { userId })

            .groupBy("contract.status")
            .getRawMany();

        const stats: ContractStats = {
            total: 0,
            pending: 0,
            signed: 0,
            cancelled: 0,
            draft: 0,
        };

        let totalCount = 0;

        for (const res of results) {
            const status = res.status as ContractStatus;
            const count = parseInt(res.count, 10);

            if (status === ContractStatus.DRAFT) {
                stats.draft = count;
            } else if (status === ContractStatus.PENDING) {
                stats.pending = count;
            } else if (status === ContractStatus.SIGNED) {
                stats.signed = count;
            } else if (status === ContractStatus.CANCELLED) {
                stats.cancelled = count;
            }

            totalCount += count;
        }
        stats.total = totalCount;
        return stats;
    }

    async getUserStats(): Promise<UserStats> {
        const [
            total,
            admin,
            signer,
            viewer,
        ] = await Promise.all([
            this.userRepository.count(),
            this.userRepository.count({ where: { role: UserRole.ADMIN } }),
            this.userRepository.count({ where: { role: UserRole.SIGNER } }),
            this.userRepository.count({ where: { role: UserRole.VIEWER } }),
        ]);

        return { total, admin, signer, viewer };
    }
}
