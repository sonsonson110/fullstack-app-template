import passwordSchema from "@/schemas/shared/password.schema";
import { z } from "zod";

export const resetPasswordSchema = z.object({
  resetToken: z.string().uuid(),
  newPassword: passwordSchema,
});

export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
