import { z } from "zod";

export const applySchema = z.object({
  body: z.object({
    jobId: z.coerce.number().int().positive(),
    coverLetter: z.string().max(4000).optional(),
  }),
});

export const applicationIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export const applicationStatusSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    status: z.enum(["PENDING", "REVIEWING", "SHORTLISTED", "INTERVIEW", "REJECTED", "ACCEPTED"]),
  }),
});

export const jobApplicantsParamSchema = z.object({
  params: z.object({
    jobId: z.coerce.number().int().positive(),
  }),
});
