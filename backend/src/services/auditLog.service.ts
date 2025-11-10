import { AppDataSource } from "../config/data_source";
import { AuditLog } from "../entities/AuditLog";

export class AuditLogService {
  private auditRepository = AppDataSource.getRepository(AuditLog);

  /**
   *
   * @param userId ID người dùng thực hiện hành động
   * @param action Hành động (vd: CREATE_CONTRACT, SIGN_CONTRACT, VERIFY_SIGNATURE)
   * @param details Mô tả chi tiết hành động
   */
  async createLog(userId: number, action: string, details?: string) {
    const log = this.auditRepository.create({
      user: { id: userId },
      action,
      details: details || null,
    });
    await this.auditRepository.save(log);
    return log;
  }

  async getLogs(filter?: { userId?: number; action?: string; limit?: number }) {
    const where: any = {};
    if (filter?.userId) where.user = { id: filter.userId };
    if (filter?.action) where.action = filter.action;

    const take = filter?.limit;

    return await this.auditRepository.find({
      where,
      relations: ["user"],
      select: {
        id: true,
        user: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
        action: true,
        details: true,
        createdAt: true,
      },
      order: { createdAt: "DESC" },
      take, 
    });
  }

  async getLogById(id: number) {
    return await this.auditRepository.findOne({
      where: { id },
      relations: ["user"],
    });
  }
}
