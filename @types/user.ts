import { z } from 'zod';

export const CreateUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});
