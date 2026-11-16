import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Client } = pg;

const connectionString = process.env.DIRECT_URL || "postgresql://postgres.njqdkmxkuqzhcwgrdupn:Mahajobs@7058@aws-1-ap-south-1.pooler.supabase.com:5432/postgres";

async function runMigrations() {
  console.log('Connecting to PostgreSQL database...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL successfully!');

    const files = [
      'supabase/migrations/001_initial_schema.sql',
      'supabase/migrations/002_seed_data.sql',
      'supabase/migrations/003_sms_otp_registration.sql'
    ];

    for (const file of files) {
      console.log(`\nExecuting migration: ${file}...`);
      const sql = fs.readFileSync(file, 'utf-8');
      await client.query(sql);
      console.log(`✓ Completed ${file}`);
    }

    console.log('\nAll migrations applied successfully!');
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();

