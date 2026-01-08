import { z } from 'zod';

export const scheduleSchema = z.object({
  id: z.number().positive(),
  teamId: z.number().positive(),
  dayIndex: z.number().min(0).max(4),
});

export const createScheduleSchema = scheduleSchema.omit({ id: true });

export type Schedule = z.infer<typeof scheduleSchema>;
