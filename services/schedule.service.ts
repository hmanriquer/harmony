'use server';

import { z } from 'zod';
import { db } from '@/db';
import { schedules } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { scheduleSchema, createScheduleSchema } from '@/@types/schedule';

export async function createSchedule(
  schedule: z.infer<typeof createScheduleSchema>
) {
  const result = await db.insert(schedules).values(schedule).returning();
  return scheduleSchema.parse(result[0]);
}

export async function createSchedules(
  schedulesData: z.infer<typeof createScheduleSchema>[]
) {
  const result = await db.insert(schedules).values(schedulesData).returning();
  return scheduleSchema.array().parse(result);
}

export async function listSchedules() {
  const result = await db.select().from(schedules);
  return scheduleSchema.array().parse(result);
}

export async function getTeamSchedules(teamId: number) {
  const result = await db
    .select()
    .from(schedules)
    .where(eq(schedules.teamId, teamId));
  return scheduleSchema.array().parse(result);
}

export async function updateSchedule(schedule: z.infer<typeof scheduleSchema>) {
  const result = await db
    .update(schedules)
    .set(schedule)
    .where(eq(schedules.id, schedule.id))
    .returning();
  return scheduleSchema.parse(result[0]);
}

export async function deleteSchedule(id: number) {
  await db.delete(schedules).where(eq(schedules.id, id));
}

export async function deleteSchedulesByTeam(teamId: number) {
  await db.delete(schedules).where(eq(schedules.teamId, teamId));
}

export async function clearAllSchedules() {
  await db.delete(schedules);
}
