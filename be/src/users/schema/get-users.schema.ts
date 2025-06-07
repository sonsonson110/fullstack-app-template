import { createZodDto } from 'nestjs-zod';
import { userStatusEnum } from 'src/users/schema/common-type';
import z from 'zod';

const sortByEnum = z.enum(['username', 'email', 'createdAt', 'updatedAt']);
const sortOrderEnum = z.enum(['asc', 'desc']);

const getUsersQuerySchema = z
  .object({
    page: z
      .string()
      .optional()
      .transform((val) => {
        if (!val) return 1;
        const parsed = parseInt(val, 10);
        // Return default if NaN, negative, or zero
        return !isNaN(parsed) && parsed > 0 ? parsed : 1;
      }),
    limit: z
      .string()
      .optional()
      .transform((val) => {
        if (!val) return 10;
        const parsed = parseInt(val, 10);
        return !isNaN(parsed) && parsed > 0 ? parsed : 10;
      }),
    search: z
      .string()
      .optional()
      .describe('Search term for filtering users, only by username and email'),
    status: z
      .union([userStatusEnum, z.array(userStatusEnum)])
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        return Array.isArray(val) ? val : [val];
      }),
    sortBy: z
      .union([sortByEnum, z.array(sortByEnum)])
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        return Array.isArray(val) ? val : [val];
      }),
    sortOrder: z
      .union([sortOrderEnum, z.array(sortOrderEnum)])
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        return Array.isArray(val) ? val : [val];
      }),
  })
  .transform((data) => {
    // Post-processing: ensure sortOrder array matches sortBy length, filling with 'asc'
    if (data.sortBy && data.sortOrder) {
      while (data.sortOrder.length < data.sortBy.length) {
        data.sortOrder.push('asc');
      }
      // Trim sortOrder if it's longer than sortBy
      data.sortOrder = data.sortOrder.slice(0, data.sortBy.length);
    }
    return data;
  });

export class GetUsersQueryDto extends createZodDto(getUsersQuerySchema) {}
