import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export class ForgotPasswordDto extends createZodDto(forgotPasswordSchema) {}
