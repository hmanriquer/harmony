import { z } from 'zod';
import { memberSchema } from './members';

export const teamSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(255),
  color: z.string().min(1).max(255),
  members: z.array(memberSchema),
});

export type Team = z.infer<typeof teamSchema>;

export const createTeamSchema = teamSchema.omit({ id: true });
