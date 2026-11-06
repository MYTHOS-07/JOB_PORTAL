import { NotificationDao } from "../dao/NotificationDao";
import { LOG_MARK } from "../constants/log-marks";
import { MESSAGES } from "../constants/messages";
import { logInfo } from "../utils/requestLog";
import { ApiError } from "../utils/ApiError";
import { buildPaginationMeta, getPagination } from "../utils/pagination";

/**
 * Creates and reads in-app notifications.
 */
export class NotificationService {
  constructor(private readonly notificationDao: NotificationDao) {}

  /**
   * Stores a notification for a user.
   */
  async notify(userId: number, title: string, message: string, type: string) {
    const created = await this.notificationDao.create({ userId, title, message, type });
    logInfo(
      {
        mark: LOG_MARK.NOTIFY_CREATE,
        targetUserId: userId,
        module: "notifications",
        notificationType: type,
      },
      title,
    );
    return created;
  }

  async list(userId: number, page: number, limit: number) {
    const { skip, take } = getPagination(page, limit);
    const { items, totalItems } = await this.notificationDao.listForUser(userId, skip, take);
    return {
      items,
      pagination: buildPaginationMeta(page, limit, totalItems),
    };
  }

  async unreadCount(userId: number): Promise<number> {
    return this.notificationDao.countUnread(userId);
  }

  async markRead(userId: number, notificationId: number) {
    const notification = await this.notificationDao.findById(notificationId);
    if (!notification || notification.userId !== userId) {
      throw ApiError.notFound(MESSAGES.NOTIFICATION.NOT_FOUND);
    }
    return this.notificationDao.markRead(notificationId);
  }

  async markAllRead(userId: number): Promise<number> {
    return this.notificationDao.markAllRead(userId);
  }

  async delete(userId: number, notificationId: number) {
    const notification = await this.notificationDao.findById(notificationId);
    if (!notification || notification.userId !== userId) {
      throw ApiError.notFound(MESSAGES.NOTIFICATION.NOT_FOUND);
    }
    return this.notificationDao.delete(notificationId);
  }
}
