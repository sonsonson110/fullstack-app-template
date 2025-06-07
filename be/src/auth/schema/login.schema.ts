import { createZodDto } from 'nestjs-zod';
import passwordSchema from 'src/common/schema/password.schema';
import { z } from 'zod';

const loginSchema = z.object({
  emailOrUsername: z
    .string()
    .min(1, { message: 'Email or username is required' })
    .refine(
      (value) => {
        // Check if it's a valid email or a valid username
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const usernameRegex = /^[a-zA-Z0-9_-]{3,50}$/;

        return emailRegex.test(value) || usernameRegex.test(value);
      },
      {
        message: 'Must be a valid email address or username',
      },
    ),
  password: passwordSchema,
  responseType: z.enum(['json', 'cookie']).optional().default('cookie'),
});

export class LoginDto extends createZodDto(loginSchema) {}
