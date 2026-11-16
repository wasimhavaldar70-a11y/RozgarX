const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function applyMigration005() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const client = new Client({ connectionString });
  console.log('Connecting to Supabase PostgreSQL...');
  await client.connect();

  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '005_complete_remaining_policies.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log(`Executing migration 005 (${sql.length} bytes)...`);
  try {
    await client.query('BEGIN;');
    await client.query(sql);
    await client.query('COMMIT;');
    console.log('Migration 005 applied successfully with COMMIT!');
  } catch (err) {
    await client.query('ROLLBACK;');
    console.error('Migration 005 failed:', err);
    throw err;
  } finally {
    await client.end();
  }
}

applyMigration005().catch(e => {
  console.error('Fatal error:', e.message);
  process.exit(1);
});

