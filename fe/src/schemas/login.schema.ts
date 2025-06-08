import passwordSchema from "@/schemas/shared/password.schema";
import { z } from "zod";

export const loginSchema = z.object({
  emailOrUsername: z
    .string()
    .min(1, { message: "Email or username is required" })
    .refine(
      (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const usernameRegex = /^[a-zA-Z0-9_-]{3,50}$/;

        return emailRegex.test(value) || usernameRegex.test(value);
      },
      {
        message: "Must be a valid email address or username",
      }
    ),
  password: passwordSchema,
});

export type LoginDto = z.infer<typeof loginSchema>;
