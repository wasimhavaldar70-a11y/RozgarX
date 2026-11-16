const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function applyMigration() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DIRECT_URL or DATABASE_URL is not defined in .env.local');
  }

  const client = new Client({ connectionString });
  console.log('Connecting to Supabase PostgreSQL database...');
  await client.connect();
  console.log('Connected successfully.');

  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '004_enterprise_security_hardening.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log(`Executing migration: 004_enterprise_security_hardening.sql (${sql.length} bytes)...`);
  
  try {
    await client.query('BEGIN;');
    await client.query(sql);
    await client.query('COMMIT;');
    console.log('Migration 004 applied successfully with COMMIT!');
  } catch (err) {
    console.error('Migration failed, rolling back:', err);
    await client.query('ROLLBACK;');
    throw err;
  } finally {
    await client.end();
  }
}

applyMigration().catch(err => {
  console.error('Fatal error applying migration:', err.message);
  process.exit(1);
});

