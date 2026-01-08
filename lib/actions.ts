'use server';

import { signIn, signOut, auth } from '@/auth';
import { AuthError } from 'next-auth';
import {
  createUser,
  getUserByUsername,
  updatePassword,
} from '@/services/users.service';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export async function register(
  prevState: string | undefined,
  formData: FormData
) {
  const rawFormData = Object.fromEntries(formData.entries());

  try {
    await createUser({
      username: rawFormData.username as string,
      password: rawFormData.password as string,
    });
  } catch {
    return 'Failed to register user. Username might be taken.';
  }

  redirect('/login');
}

export async function logout() {
  await signOut();
}

export async function changePassword(
  prevState: string | undefined,
  formData: FormData
) {
  const session = await auth();
  if (!session?.user?.name) {
    return 'Not authenticated.';
  }

  const rawFormData = Object.fromEntries(formData.entries());
  const oldPassword = rawFormData.oldPassword as string;
  const newPassword = rawFormData.newPassword as string;

  if (!oldPassword || !newPassword) {
    return 'All fields are required.';
  }

  if (newPassword.length < 6) {
    return 'New password must be at least 6 characters.';
  }

  const user = await getUserByUsername(session.user.name);
  if (!user) {
    return 'User not found.';
  }

  const passwordsMatch = await bcrypt.compare(oldPassword, user.password);
  if (!passwordsMatch) {
    return 'Incorrect old password.';
  }

  try {
    await updatePassword(session.user.name, newPassword);
  } catch {
    return 'Failed to update password.';
  }

  redirect('/');
}
