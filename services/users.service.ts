'use server';

import { db } from '@/db';
import { usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { CreateUserSchema } from '@/@types/user';

export async function getUserByUsername(username: string) {
  try {
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username))
      .get();
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export async function createUser(data: z.infer<typeof CreateUserSchema>) {
  const validatedFields = CreateUserSchema.safeParse(data);

  if (!validatedFields.success) {
    throw new Error('Invalid fields');
  }

  const { username, password } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = await db
      .insert(usersTable)
      .values({
        username,
        password: hashedPassword,
      })
      .returning();
    return newUser[0];
  } catch (error) {
    console.error('Failed to create user:', error);
    throw new Error('Failed to create user.');
  }
}

export async function updatePassword(username: string, newPassword: string) {
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  try {
    await db
      .update(usersTable)
      .set({ password: hashedPassword })
      .where(eq(usersTable.username, username));
  } catch (error) {
    console.error('Failed to update password:', error);
    throw new Error('Failed to update password.');
  }
}
