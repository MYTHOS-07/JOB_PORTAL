import { z } from "zod";

export const createCompanySchema = z.object({
  body: z.object({
    companyName: z.string().min(2).max(150),
    description: z.string().max(2000).optional(),
    industry: z.string().max(100).optional(),
    website: z.string().url().optional(),
    location: z.string().max(120).optional(),
    phone: z.string().max(20).optional(),
  }),
});

export const updateCompanySchema = z.object({
  body: z.object({
    companyName: z.string().min(2).max(150).optional(),
    description: z.string().max(2000).optional(),
    industry: z.string().max(100).optional(),
    website: z.string().url().optional(),
    location: z.string().max(120).optional(),
    phone: z.string().max(20).optional(),
  }),
});

export const companyIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export const adminCompanyStatusSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    status: z.enum(["PENDING", "APPROVED", "SUSPENDED"]),
  }),
});
