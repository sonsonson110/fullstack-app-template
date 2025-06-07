import { createZodDto } from 'nestjs-zod';
import passwordSchema from 'src/common/schema/password.schema';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  resetToken: z.string().uuid(),
  newPassword: passwordSchema,
});

export class ResetPasswordDto extends createZodDto(resetPasswordSchema) {}
