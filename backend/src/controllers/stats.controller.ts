import { UserStats, ContractStats } from "../types/express/dashboard-stats.types";
import { StatsService } from "../services/stats.service";
import { Request, Response } from "express";

export class StatsController {
    private statsService = new StatsService();

    async getDashboardStats(req: Request, res: Response) {
        try {
            const user = req.user;
            if (!user || !user.sub) {
                return res.status(401).json({ message: "Người dùng không được xác thực hoặc thiếu ID (sub)" });
            }
            const userId = user.sub;
            const userRole = user.role;
            const contractsStats: ContractStats = await this.statsService.getContractStats(userId);

            let usersStats: UserStats | null = null;
            if (userRole === "admin") {
                usersStats = await this.statsService.getUserStats();
            }

            return res.status(200).json({
                contractsStats,
                usersStats,
            });
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : "Unknown error occurred";
            return res.status(500).json({ message });
        }
    }

    async getContractStat(req: Request, res: Response) {
        try {
            const user = req.user;
            const stats: ContractStats = await this.statsService.getContractStats(user.sub)
            return res.status(200).json(stats)
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : "Unknown error occurred";
            return res.status(500).json({ message });
        }
    }

    async getUsersStat(req: Request, res: Response): Promise<Response> {
        try {
            const user = req.user;
            if (user.role !== "admin") {
                return res.status(400).json({
                    message: "Bạn không có quyền xem thông tin người dùng",
                    access: false,
                })
            }

            const stats: UserStats = await this.statsService.getUserStats();
            return res.status(200).json(stats);

        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : "Unknown error occurred";
            return res.status(500).json({ message });
        }
    }
}
