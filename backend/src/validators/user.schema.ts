import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    phone: z.string().min(7).max(20).optional(),
    location: z.string().min(2).max(120).optional(),
    bio: z.string().max(1000).optional(),
  }),
});

export const deleteAccountSchema = z.object({
  body: z.object({
    password: z.string().min(1),
  }),
});

export const userIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export const adminUserStatusSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    status: z.enum(["ACTIVE", "SUSPENDED"]),
  }),
});

export const adminUserRoleSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    role: z.enum(["JOB_SEEKER", "EMPLOYER", "ADMIN"]),
  }),
});
