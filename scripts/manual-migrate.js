require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@libsql/client');

console.log('URL:', process.env.TURSO_DATABASE_URL ? 'Found' : 'Missing');
console.log('Token:', process.env.TURSO_AUTH_TOKEN ? 'Found' : 'Missing');

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  try {
    console.log('Adding capacity column to remote DB...');
    await client.execute(
      'ALTER TABLE teams ADD COLUMN capacity INTEGER NOT NULL DEFAULT 0'
    );
    console.log('Success!');
  } catch (error) {
    if (
      error &&
      error.message &&
      error.message.includes('duplicate column name')
    ) {
      console.log('Column already exists.');
    } else {
      console.error('Error:', error);
    }
  }
}

main();
