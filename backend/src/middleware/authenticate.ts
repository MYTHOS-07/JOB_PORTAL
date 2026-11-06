import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { MESSAGES } from "../constants/messages";
import { UserDao } from "../dao/UserDao";
import { TokenService } from "../services/TokenService";
import { ApiError } from "../utils/ApiError";
import { bindActor } from "../utils/requestLog";

/**
 * Reads the JWT from the HttpOnly cookie (or Authorization header),
 * verifies it, checks Redis blacklist and tokenVersion.
 */
export class AuthenticateMiddleware {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userDao: UserDao,
  ) {}

  handle = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = this.readToken(req);
      if (!token) {
        throw ApiError.unauthorized(MESSAGES.AUTH.UNAUTHORIZED);
      }

      const payload = this.tokenService.verifyAccessToken(token);
      const blacklisted = await this.tokenService.isBlacklisted(payload.jti);
      if (blacklisted) {
        throw ApiError.unauthorized(MESSAGES.AUTH.TOKEN_REVOKED);
      }

      const user = await this.userDao.findById(payload.sub);
      if (!user || user.status !== "ACTIVE") {
        throw ApiError.unauthorized(MESSAGES.AUTH.UNAUTHORIZED);
      }

      if (user.tokenVersion !== payload.tokenVersion) {
        throw ApiError.unauthorized(MESSAGES.AUTH.TOKEN_REVOKED);
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        tokenVersion: user.tokenVersion,
        jti: payload.jti,
      };
      bindActor(req);
      next();
    } catch (error) {
      next(error instanceof ApiError ? error : ApiError.unauthorized(MESSAGES.AUTH.UNAUTHORIZED));
    }
  };

  private readToken(req: Request): string | undefined {
    const cookieToken = req.cookies?.[env.JWT_COOKIE_NAME] as string | undefined;
    if (cookieToken) {
      return cookieToken;
    }

    const header = req.headers.authorization;
    if (header?.startsWith("Bearer ")) {
      return header.slice(7);
    }

    return undefined;
  }
}
