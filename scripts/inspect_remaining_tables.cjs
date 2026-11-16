const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function inspect() {
  const client = new Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
  await client.connect();

  const tables = ['support_tickets', 'reports', 'application_status_history', 'featured_jobs', 'recruitment_requests', 'user_roles'];
  for (const t of tables) {
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = '${t}' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    console.log(`\nTable: ${t}`);
    console.log(res.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
  }

  await client.end();
}

inspect().catch(console.error);

