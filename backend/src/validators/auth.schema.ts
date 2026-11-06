import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Za-z]/, "Password must contain a letter")
  .regex(/[0-9]/, "Password must contain a number");

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: passwordSchema,
    role: z.enum(["JOB_SEEKER", "EMPLOYER"]),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const resetPasswordSchema = z
  .object({
    body: z.object({
      token: z.string().min(10),
      newPassword: passwordSchema,
      confirmPassword: z.string().min(1),
    }),
  })
  .superRefine((value, ctx) => {
    if (value.body.newPassword !== value.body.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["body", "confirmPassword"],
      });
    }
  });

export const changePasswordSchema = z
  .object({
    body: z.object({
      currentPassword: z.string().min(1),
      newPassword: passwordSchema,
      confirmPassword: z.string().min(1),
    }),
  })
  .superRefine((value, ctx) => {
    if (value.body.newPassword !== value.body.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["body", "confirmPassword"],
      });
    }
  });
