import { z } from 'zod';

export const createMemberSchema = z.object({
  teamId: z.number(),
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  email: z.string().email('Invalid email address').optional().nullable(),
  chairNumber: z.number().optional().nullable(),
});

export const memberSchema = z.object({
  id: z.number(),
  teamId: z.number(),
  name: z.string(),
  email: z.string().optional().nullable(),
  chairNumber: z.number().optional().nullable(),
});

export type Member = z.infer<typeof memberSchema>;

export const updateMemberSchema = z
  .object({
    id: z.number(),
    teamId: z.number(),
    name: z.string(),
    email: z.string().optional().nullable(),
  })
  .partial();
