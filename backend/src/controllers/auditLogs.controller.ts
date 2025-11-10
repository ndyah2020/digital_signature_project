import { AuditLogService } from "../services/auditLog.service";
import { Request, Response } from "express";

export class auditLogController {
    private auditLogService = new AuditLogService()
    async getAll(req: Request, res: Response) {
        try {
            const result = await this.auditLogService.getLogs();
            return res.status(200).json(result);
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : "Unknown error occurred";
            return res.status(500).json({ message });
        }
    }

}
