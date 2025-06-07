import { createZodDto } from 'nestjs-zod';
import passwordSchema from 'src/common/schema/password.schema';
import usernameSchema from 'src/common/schema/username.schema';
import { z } from 'zod';

const createUserSchema = z.object({
  username: usernameSchema,
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
});

export class CreateUserDto extends createZodDto(createUserSchema) {}
