import type { Request, Response } from "express";
import { MESSAGES } from "../constants/messages";
import { NotificationService } from "../services/NotificationService";
import { ApiResponse } from "../utils/ApiResponse";

export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const result = await this.notificationService.list(
      req.user!.id,
      Number(req.query.page ?? 1),
      Number(req.query.limit ?? 10),
    );
    ApiResponse.paged(res, result.items, result.pagination);
  };

  unreadCount = async (req: Request, res: Response): Promise<void> => {
    const count = await this.notificationService.unreadCount(req.user!.id);
    ApiResponse.success(res, { unreadCount: count });
  };

  markRead = async (req: Request, res: Response): Promise<void> => {
    const notification = await this.notificationService.markRead(
      req.user!.id,
      Number(req.params.id),
    );
    ApiResponse.success(res, notification, MESSAGES.NOTIFICATION.MARKED_READ);
  };

  markAllRead = async (req: Request, res: Response): Promise<void> => {
    const updated = await this.notificationService.markAllRead(req.user!.id);
    ApiResponse.success(res, { updated }, MESSAGES.NOTIFICATION.ALL_READ);
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    await this.notificationService.delete(req.user!.id, Number(req.params.id));
    ApiResponse.success(res, null, MESSAGES.NOTIFICATION.DELETED);
  };
}
