'use server';

import { z } from 'zod';
import { db } from '@/db';
import { teamMembers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createMemberSchema, memberSchema } from '@/@types/members';

export async function listMembers(): Promise<z.infer<typeof memberSchema>[]> {
  const members = await db.select().from(teamMembers);
  return members.map(member => memberSchema.parse(member));
}

export async function getMember(
  id: number
): Promise<z.infer<typeof memberSchema> | null> {
  const member = await db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.id, id));
  if (!member[0]) return null;
  return memberSchema.parse(member[0]);
}

export async function createMember(
  data: z.infer<typeof createMemberSchema>
): Promise<z.infer<typeof memberSchema>> {
  const [result] = await db.insert(teamMembers).values(data).returning();
  return memberSchema.parse(result);
}

export async function updateMember(
  id: number,
  data: Partial<z.infer<typeof memberSchema>>
): Promise<z.infer<typeof memberSchema>> {
  const [result] = await db
    .update(teamMembers)
    .set(data)
    .where(eq(teamMembers.id, id))
    .returning();
  return memberSchema.parse(result);
}

export async function deleteMember(id: number): Promise<void> {
  await db.delete(teamMembers).where(eq(teamMembers.id, id));
}
