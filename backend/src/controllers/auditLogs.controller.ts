import { AuditLogService } from "../services/auditLog.service";
import { Request, Response } from "express";

export class auditLogController {
    private auditLogService = new AuditLogService()
    async getAll(req: Request, res: Response) {
        try {
            //  /?userId=1&limit=10
            const { userId, action, limit } = req.query;
            const filter: {
                userId?: number;
                action?: string;
                limit?: number;
            } = {};

            if (userId) {
                const parsedUserId = parseInt(userId as string, 10);
                if (!isNaN(parsedUserId)) {
                    filter.userId = parsedUserId;
                } else {
                    return res.status(400).json({ message: "userId phải là một con số" });
                }
            }
            if (action) {
                filter.action = action as string;
            }
            if (limit) {
                const parsedLimit = parseInt(limit as string, 10);
                if (!isNaN(parsedLimit)) {
                    filter.limit = parsedLimit;
                } else {
                    return res.status(400).json({ message: "limit phải là một con số" });
                }
            }
            const result = await this.auditLogService.getLogs(filter);
            return res.status(200).json(result);

        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : "Unknown error occurred";
            return res.status(500).json({ message });
        }
    }

}
