/**
 * Password validation lives in auth.schema.ts so register, reset
 * and change-password share the same rules.
 */
export { resetPasswordSchema, changePasswordSchema, forgotPasswordSchema } from "./auth.schema";
