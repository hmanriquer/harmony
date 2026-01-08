'use server';

import { z } from 'zod';
import { db } from '@/db';
import { teams } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createTeamSchema, teamSchema } from '@/@types/teams';

export async function listTeams(): Promise<z.infer<typeof teamSchema>[]> {
  return db.query.teams.findMany({
    with: {
      members: true,
    },
  });
}

export async function getTeam(id: number): Promise<z.infer<typeof teamSchema>> {
  const team = await db.query.teams.findFirst({
    where: eq(teams.id, id),
    with: {
      members: true,
    },
  });

  if (!team) throw new Error('Team not found');

  return team;
}

export async function createTeam(
  data: z.infer<typeof createTeamSchema>
): Promise<Omit<z.infer<typeof teamSchema>, 'members'>> {
  const { members, ...teamData } = data;
  const [createdTeam] = await db.insert(teams).values(teamData).returning();
  return createdTeam;
}

export async function updateTeam(
  data: Partial<z.infer<typeof teamSchema>>,
  id: number
): Promise<z.infer<typeof teamSchema>> {
  if (!id) throw new Error('Team ID is required');

  const { members, ...teamData } = data;

  await db.update(teams).set(teamData).where(eq(teams.id, id));

  return getTeam(id);
}

export async function deleteTeam(id: number): Promise<void> {
  if (!id) throw new Error('Team ID is required');
  await db.delete(teams).where(eq(teams.id, id));
}
