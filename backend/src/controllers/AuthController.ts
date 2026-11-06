import type { Request, Response } from "express";
import { env } from "../config/env";
import { HTTP_STATUS } from "../constants/http-status";
import { MESSAGES } from "../constants/messages";
import { AuthService } from "../services/AuthService";
import { ApiResponse } from "../utils/ApiResponse";

/**
 * HTTP adapters for authentication endpoints.
 */
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/auth/register
   */
  register = async (req: Request, res: Response): Promise<void> => {
    const user = await this.authService.register(req.body);
    ApiResponse.success(res, user, MESSAGES.AUTH.REGISTER_SUCCESS, HTTP_STATUS.CREATED);
  };

  /**
   * POST /api/auth/login
   */
  login = async (req: Request, res: Response): Promise<void> => {
    const user = await this.authService.login(req.body.email, req.body.password, res);
    ApiResponse.success(res, user, MESSAGES.AUTH.LOGIN_SUCCESS);
  };

  /**
   * POST /api/auth/logout
   */
  logout = async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies?.[env.JWT_COOKIE_NAME] as string | undefined;
    await this.authService.logout(token, res);
    ApiResponse.success(res, null, MESSAGES.AUTH.LOGOUT_SUCCESS);
  };

  /**
   * POST /api/auth/logout-all
   */
  logoutAll = async (req: Request, res: Response): Promise<void> => {
    await this.authService.logoutAll(req.user!.id, res);
    ApiResponse.success(res, null, MESSAGES.AUTH.LOGOUT_ALL_SUCCESS);
  };

  /**
   * GET /api/auth/me
   */
  me = async (req: Request, res: Response): Promise<void> => {
    const user = await this.authService.getCurrentUser(req.user!.id);
    ApiResponse.success(res, user);
  };

  /**
   * POST /api/auth/forgot-password
   */
  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    const data = await this.authService.forgotPassword(req.body.email);
    ApiResponse.success(res, data, MESSAGES.AUTH.FORGOT_PASSWORD);
  };

  /**
   * POST /api/auth/reset-password
   */
  resetPassword = async (req: Request, res: Response): Promise<void> => {
    await this.authService.resetPassword(req.body.token, req.body.newPassword);
    ApiResponse.success(res, null, MESSAGES.AUTH.RESET_SUCCESS);
  };

  /**
   * PATCH /api/auth/change-password
   */
  changePassword = async (req: Request, res: Response): Promise<void> => {
    await this.authService.changePassword(
      req.user!.id,
      req.body.currentPassword,
      req.body.newPassword,
      res,
    );
    ApiResponse.success(res, null, MESSAGES.AUTH.PASSWORD_CHANGED);
  };

  /**
   * GET /api/auth/csrf
   */
  csrf = async (_req: Request, res: Response): Promise<void> => {
    const token = this.authService.issueCsrfCookie(res);
    ApiResponse.success(res, { csrfToken: token });
  };
}
