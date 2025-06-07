import { UserStatus } from '@prisma/client';
import z from 'zod';

export const userStatusEnum = z.enum([
  UserStatus.ACTIVE,
  UserStatus.INACTIVE,
  UserStatus.BANNED,
]);
