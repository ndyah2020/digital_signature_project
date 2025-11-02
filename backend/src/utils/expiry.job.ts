const cron = require("node-cron");
import { AppDataSource } from "../config/data_source";
import {
  ContractRecipient,
  SignStatus,
  OnExpireAction,
} from "../entities/ContractRecipient";
import { Contract, ContractStatus } from "../entities/Contract";
import { mailService } from "../services/mail.service";
import { AuditLogService } from "../services/auditLog.service";

const audit = new AuditLogService();

export function startExpiryJob() {
  // Chạy 2 lần/ngày: 8h sáng & 8h tối
  cron.schedule("0 8,20 * * *", async () => {
    try {
      const now = new Date();
      const recipientRepo = AppDataSource.getRepository(ContractRecipient);
      const contractRepo = AppDataSource.getRepository(Contract);

      // Lấy tất cả người ký đang pending mà chưa expired
      const recipients = await recipientRepo.find({
        where: { sign_status: SignStatus.PENDING, isExpired: false },
        relations: ["user", "contract", "contract.createdBy"],
      });

      for (const r of recipients) {
        if (r.deadline && new Date(r.deadline) < now) {
          switch (r.onExpireAction) {
            case OnExpireAction.CANCEL:
              r.sign_status = SignStatus.EXPIRED;
              r.isExpired = true;
              await recipientRepo.save(r);

              // Hủy toàn bộ hợp đồng
              r.contract.status = ContractStatus.CANCELLED;
              await contractRepo.save(r.contract);

              await mailService.sendMail({
                to: r.contract.createdBy.email,
                subject: `[Hệ thống] Hợp đồng "${r.contract.title}" đã bị hủy`,
                text: `Người ký ${r.user.email} đã hết hạn ký, hợp đồng "${r.contract.title}" bị hủy.`,
              });

              await audit.createLog(
                r.user.id,
                "RECIPIENT_EXPIRED_CANCELLED",
                `Người ký ${r.user.email} hết hạn và hợp đồng #${r.contract.id} bị hủy`
              );
              break;

            case OnExpireAction.REMOVE:
              r.sign_status = SignStatus.REMOVED;
              r.isExpired = true;
              await recipientRepo.save(r);

              await mailService.sendMail({
                to: r.user.email,
                subject: `[Hệ thống] Bạn đã bị loại khỏi hợp đồng "${r.contract.title}"`,
                text: `Bạn không ký đúng hạn nên đã bị loại khỏi hợp đồng "${r.contract.title}".`,
              });

              await audit.createLog(
                r.user.id,
                "RECIPIENT_REMOVED",
                `Loại bỏ người ký ${r.user.email} khỏi hợp đồng #${r.contract.id}`
              );
              break;

            case OnExpireAction.EXTEND:
              const newDeadline = new Date();
              newDeadline.setDate(newDeadline.getDate() + 3); // gia hạn thêm 3 ngày
              r.deadline = newDeadline;
              await recipientRepo.save(r);

              await mailService.sendMail({
                to: r.user.email,
                subject: `[Hệ thống] Hạn ký hợp đồng "${r.contract.title}" đã được gia hạn`,
                text: `Bạn được gia hạn thêm 3 ngày để ký hợp đồng "${r.contract.title}".`,
              });

              await audit.createLog(
                r.user.id,
                "RECIPIENT_EXTENDED",
                `Gia hạn thêm 3 ngày cho người ký ${r.user.email} trong hợp đồng #${r.contract.id}`
              );
              break;
          }
        }
      }

      // Kiểm tra hợp đồng có tất cả người ký đều expired/removed thì hủy
      const contracts = await contractRepo.find({
        relations: ["recipientLinks", "createdBy"],
      });

      for (const contract of contracts) {
        const allDone = contract.recipientLinks.every((r) =>
          [SignStatus.EXPIRED, SignStatus.REMOVED, SignStatus.SIGNED].includes(
            r.sign_status
          )
        );

        const allExpired = contract.recipientLinks.every((r) =>
          [SignStatus.EXPIRED, SignStatus.REMOVED].includes(r.sign_status)
        );

        if (allExpired && contract.status !== ContractStatus.CANCELLED) {
          contract.status = ContractStatus.CANCELLED;
          await contractRepo.save(contract);

          if (contract.createdBy?.email) {
            await mailService.sendMail({
              to: contract.createdBy.email,
              subject: `[Hệ thống] Hợp đồng "${contract.title}" đã bị hủy`,
              text: `Tất cả người ký đã hết hạn hoặc bị loại, hợp đồng "${contract.title}" đã bị hủy.`,
            });
          }

          await audit.createLog(
            contract.createdBy?.id || 0,
            "CONTRACT_CANCELLED_EXPIRED",
            `Hợp đồng #${contract.id} bị hủy vì tất cả người ký hết hạn`
          );
        }
      }

      console.log("✅ Cron xử lý hết hạn hoàn tất");
    } catch (err) {
      console.error("❌ Expiry job error:", err);
    }
  });
}
