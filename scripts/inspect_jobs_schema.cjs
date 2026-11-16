const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function inspectSchema() {
  const client = new Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
  await client.connect();

  const cols = await client.query(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'jobs'
    ORDER BY ordinal_position;
  `);
  console.log('Jobs columns:');
  cols.rows.forEach(c => console.log(`  ${c.column_name}: ${c.data_type} (nullable: ${c.is_nullable})`));

  const fks = await client.query(`
    SELECT
      tc.constraint_name, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name 
    FROM 
      information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
    WHERE tc.table_name = 'jobs' AND tc.constraint_type = 'FOREIGN KEY';
  `);
  console.log('\nJobs Foreign keys:');
  fks.rows.forEach(f => console.log(`  ${f.column_name} -> ${f.foreign_table_name}.${f.foreign_column_name}`));

  await client.end();
}

inspectSchema().catch(console.error);

