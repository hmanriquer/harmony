'use server';

import { db } from '@/db';
import { appSettings, dailySettings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getSettings() {
  const settings = await db.select().from(appSettings);
  return settings[0]; // Assuming only one row for now
}

export async function updateOneSetting(
  key: keyof typeof appSettings.$inferSelect,
  value: any
) {
  // Check if settings exist, if not create
  const current = await getSettings();
  if (!current) {
    await db.insert(appSettings).values({ [key]: value, includeFriday: false });
  } else {
    await db
      .update(appSettings)
      .set({ [key]: value })
      .where(eq(appSettings.id, current.id));
  }
}

export async function listDailySettings() {
  return await db.select().from(dailySettings);
}

export async function updateDailyOccupancy(
  dayIndex: number,
  percentage: number
) {
  const existing = await db
    .select()
    .from(dailySettings)
    .where(eq(dailySettings.dayIndex, dayIndex));

  if (existing.length === 0) {
    await db
      .insert(dailySettings)
      .values({ dayIndex, occupancyPercentage: percentage });
  } else {
    await db
      .update(dailySettings)
      .set({ occupancyPercentage: percentage })
      .where(eq(dailySettings.dayIndex, dayIndex));
  }
}
