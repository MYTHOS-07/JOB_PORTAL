import { z } from "zod";

const blankToUndefined = (value: unknown) =>
  value === "" || value === undefined || value === null ? undefined : value;

const optionalPositiveInt = z.preprocess(
  blankToUndefined,
  z.coerce.number().int().positive().optional(),
);

const optionalNumber = z.preprocess(blankToUndefined, z.coerce.number().optional());

export const paginationSchema = z.object({
  query: z.object({
    page: z.preprocess(blankToUndefined, z.coerce.number().int().positive().default(1)),
    limit: z.preprocess(blankToUndefined, z.coerce.number().int().positive().max(100).default(10)),
    search: z.string().optional(),
    location: z.string().optional(),
    category: z.string().optional(),
    categoryId: optionalPositiveInt,
    employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "REMOTE"]).optional(),
    experienceLevel: z.enum(["ENTRY_LEVEL", "MID_LEVEL", "SENIOR", "LEAD"]).optional(),
    salaryMin: optionalNumber,
    salaryMax: optionalNumber,
    sortBy: z.enum(["createdAt", "title", "salaryMin"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    status: z.string().optional(),
    industry: z.string().optional(),
    role: z.enum(["JOB_SEEKER", "EMPLOYER", "ADMIN"]).optional(),
    jobId: optionalPositiveInt,
  }),
});

export const categoryBodySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
  }),
});

export const categoryIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export const notificationIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});
