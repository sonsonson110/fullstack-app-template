import z from 'zod';

export default z
  .string()
  .min(3, { message: 'Username must be at least 3 characters long' })
  .max(30, { message: 'Username must not exceed 30 characters' })
  .regex(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  });
