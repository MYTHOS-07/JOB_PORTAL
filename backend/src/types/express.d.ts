import type { Role, UserStatus } from "../generated/prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: Role;
        status: UserStatus;
        tokenVersion: number;
        jti: string;
      };
    }
  }
}

export {};
