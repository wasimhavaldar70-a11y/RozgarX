const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function testStoragePolicy() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const client = new Client({ connectionString });
  await client.connect();

  try {
    await client.query(`
      INSERT INTO storage.buckets (id, name, public)
      VALUES ('candidate-resumes', 'candidate-resumes', false)
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('Bucket insert succeeded');

    await client.query(`
      DROP POLICY IF EXISTS "candidate_manage_own_resume" ON storage.objects;
      CREATE POLICY "candidate_manage_own_resume" ON storage.objects
        FOR ALL TO authenticated
        USING (bucket_id = 'candidate-resumes');
    `);
    console.log('Policy creation on storage.objects succeeded');

    // Clean up test policy
    await client.query(`DROP POLICY IF EXISTS "candidate_manage_own_resume" ON storage.objects;`);
    console.log('Cleaned up test policy');
  } catch (err) {
    console.error('Storage policy error:', err);
  } finally {
    await client.end();
  }
}

testStoragePolicy();

