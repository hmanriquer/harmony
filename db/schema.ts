import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const usersTable = sqliteTable('users_table', {
  id: int().primaryKey({ autoIncrement: true }),
  username: text().notNull().unique(),
  password: text().notNull(),
});

export const teams = sqliteTable('teams', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  color: text().notNull(),
  capacity: int().notNull().default(0),
});

export const teamMembers = sqliteTable('team_members', {
  id: int().primaryKey({ autoIncrement: true }),
  teamId: int().notNull(),
  name: text().notNull(),
  email: text(),
  chairNumber: int(),
});

export const schedules = sqliteTable('schedules', {
  id: int().primaryKey({ autoIncrement: true }),
  teamId: int().notNull(),
  dayIndex: int().notNull(),
});

export const appSettings = sqliteTable('app_settings', {
  id: int().primaryKey({ autoIncrement: true }),
  includeFriday: int({ mode: 'boolean' }).notNull(),
  total_chairs: int(),
});

export const dailySettings = sqliteTable('daily_settings', {
  id: int().primaryKey({ autoIncrement: true }),
  dayIndex: int().notNull().unique(), // 0=Sunday, 1=Monday, etc.
  occupancyPercentage: int().notNull().default(100),
});

import { relations } from 'drizzle-orm';

export const teamsRelations = relations(teams, ({ many }) => ({
  members: many(teamMembers),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));
