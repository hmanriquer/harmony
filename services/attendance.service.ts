'use server';

import { db } from '@/db';
import { appSettings } from '@/db/schema';

export async function toggleFriday(includeFriday: boolean) {
  await db.update(appSettings).set({ includeFriday });
}

export async function listSettings() {
  const result = await db.select().from(appSettings);
  return result;
}
