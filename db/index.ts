import 'dotenv/config';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

import * as schema from './schema';

config({ path: '.env.local' });

const url = process.env.TURSO_DATABASE_URL;

if (!url) {
  throw new Error('TURSO_DATABASE_URL is not defined in .env.local');
}

const client = createClient({
  url,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
