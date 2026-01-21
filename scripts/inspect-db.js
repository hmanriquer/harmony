const DatabaseConstructor = require('better-sqlite3');
const db = new DatabaseConstructor('sqlite.db', { verbose: console.log });

try {
  console.log('Checking teams table columns...');
  const tableInfo = db.prepare('PRAGMA table_info(teams)').all();
  console.log('Columns:', JSON.stringify(tableInfo, null, 2));
} catch (error) {
  console.error('Error:', error);
}
