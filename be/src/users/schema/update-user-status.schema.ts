import { createZodDto } from 'nestjs-zod';
import { userStatusEnum } from 'src/users/schema/common-type';
import z from 'zod';

const updateUserStatusBodySchema = z.object({
  status: userStatusEnum,
});
export class UpdateUserStatusBodyDto extends createZodDto(
  updateUserStatusBodySchema,
) {}
