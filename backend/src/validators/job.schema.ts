import { z } from "zod";

export const createJobSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(150),
    description: z.string().min(10),
    location: z.string().min(2).max(120),
    employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "REMOTE"]),
    categoryId: z.coerce.number().int().positive(),
    experienceLevel: z.enum(["ENTRY_LEVEL", "MID_LEVEL", "SENIOR", "LEAD"]).optional(),
    salaryMin: z.coerce.number().nonnegative().optional(),
    salaryMax: z.coerce.number().nonnegative().optional(),
    applicationDeadline: z.string().datetime().optional(),
    status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  }),
});

export const updateJobSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    title: z.string().min(3).max(150).optional(),
    description: z.string().min(10).optional(),
    location: z.string().min(2).max(120).optional(),
    employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "REMOTE"]).optional(),
    categoryId: z.coerce.number().int().positive().optional(),
    experienceLevel: z.enum(["ENTRY_LEVEL", "MID_LEVEL", "SENIOR", "LEAD"]).optional(),
    salaryMin: z.coerce.number().nonnegative().optional(),
    salaryMax: z.coerce.number().nonnegative().optional(),
    applicationDeadline: z.string().datetime().optional(),
  }),
});

export const jobIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export const jobStatusSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    status: z.enum(["DRAFT", "PUBLISHED", "CLOSED", "ARCHIVED"]),
  }),
});
