const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkOtpConstraint() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const client = new Client({ connectionString });
  await client.connect();

  const res = await client.query(`
    SELECT pg_get_constraintdef(c.oid) as def
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'otp_challenges' AND c.conname = 'otp_challenges_purpose_check';
  `);
  console.log('otp_challenges_purpose_check definition:', res.rows);

  await client.end();
}

checkOtpConstraint().catch(console.error);

