import type { Notification, Prisma } from "../generated/prisma/client";
import { prisma } from "../config/database";

/**
 * Data access for in-app notifications.
 */
export class NotificationDao {
  async create(data: Prisma.NotificationUncheckedCreateInput): Promise<Notification> {
    return prisma.notification.create({ data });
  }

  async findById(id: number): Promise<Notification | null> {
    return prisma.notification.findUnique({ where: { id } });
  }

  async listForUser(userId: number, skip: number, take: number) {
    const where = { userId };
    const [items, totalItems] = await prisma.$transaction([
      prisma.notification.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.count({ where }),
    ]);
    return { items, totalItems };
  }

  async countUnread(userId: number): Promise<number> {
    return prisma.notification.count({ where: { userId, isRead: false } });
  }

  async markRead(id: number): Promise<Notification> {
    return prisma.notification.update({ where: { id }, data: { isRead: true } });
  }

  async markAllRead(userId: number): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return result.count;
  }

  async delete(id: number): Promise<Notification> {
    return prisma.notification.delete({ where: { id } });
  }
}
