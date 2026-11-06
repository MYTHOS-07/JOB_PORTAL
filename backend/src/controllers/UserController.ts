import type { Request, Response } from "express";
import { MESSAGES } from "../constants/messages";
import { storageService } from "../services/StorageService";
import { UserService } from "../services/UserService";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * GET /api/users/me
   */
  getMe = async (req: Request, res: Response): Promise<void> => {
    const user = await this.userService.getMe(req.user!.id);
    ApiResponse.success(res, user);
  };

  /**
   * PATCH /api/users/me
   */
  updateMe = async (req: Request, res: Response): Promise<void> => {
    const user = await this.userService.updateMe(req.user!.id, req.body);
    ApiResponse.success(res, user, MESSAGES.USER.UPDATED);
  };

  /**
   * DELETE /api/users/me
   */
  deleteMe = async (req: Request, res: Response): Promise<void> => {
    await this.userService.deleteMe(req.user!.id, req.body.password);
    ApiResponse.success(res, null, MESSAGES.USER.DELETED);
  };

  /**
   * GET /api/users/:id
   */
  getById = async (req: Request, res: Response): Promise<void> => {
    const user = await this.userService.getPublicUser(Number(req.params.id));
    ApiResponse.success(res, user);
  };

  /**
   * PATCH /api/users/me/avatar
   */
  updateAvatar = async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      throw ApiError.badRequest("An image file is required.");
    }
    const avatarUrl = await storageService.saveImage(req.file, "avatars");
    const user = await this.userService.updateAvatar(req.user!.id, avatarUrl);
    ApiResponse.success(res, user, MESSAGES.USER.AVATAR_UPDATED);
  };

  /**
   * PATCH /api/users/me/resume
   */
  updateResume = async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      throw ApiError.badRequest("A PDF resume is required.");
    }
    const resumeUrl = `/uploads/resumes/${req.file.filename}`;
    const user = await this.userService.updateResume(req.user!.id, resumeUrl);
    ApiResponse.success(res, user, MESSAGES.USER.RESUME_UPDATED);
  };
}
