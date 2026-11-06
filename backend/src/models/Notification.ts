import type { Notification as PrismaNotification } from "../generated/prisma/client";

export class Notification {
  constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly title: string,
    public readonly message: string,
    public readonly type: string,
    public readonly isRead: boolean,
    public readonly createdAt: Date,
  ) {}

  static fromPrisma(record: PrismaNotification): Notification {
    return new Notification(
      record.id,
      record.userId,
      record.title,
      record.message,
      record.type,
      record.isRead,
      record.createdAt,
    );
  }
}
