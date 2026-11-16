const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function applyPatch4() {
  console.log('================================================================');
  console.log('APPLYING PATCH 4: RESTRICT AUDIT_LOGS INSERTION POLICY IN POSTGRESQL');
  console.log('================================================================\n');

  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('[ERROR] DIRECT_URL or DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to PostgreSQL database on Supabase...');
    await client.connect();
    console.log('[SUCCESS] Connected to Supabase PostgreSQL cluster.');

    const sql = `
      -- 1. Ensure RLS is enabled on public.audit_logs
      ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

      -- 2. Drop existing insert & read policies
      DROP POLICY IF EXISTS audit_logs_insert ON public.audit_logs;
      DROP POLICY IF EXISTS audit_logs_read ON public.audit_logs;

      -- 3. Create hardened insert policy
      CREATE POLICY audit_logs_insert ON public.audit_logs
          FOR INSERT TO authenticated
          WITH CHECK (
              public.is_super_admin() 
              OR (admin_id = auth.uid() AND action = 'USER_SELF_ACTION')
          );

      -- 4. Create super_admin read policy
      CREATE POLICY audit_logs_read ON public.audit_logs
          FOR SELECT TO authenticated
          USING (public.is_super_admin());

      -- 5. Revoke UPDATE and DELETE to guarantee immutable, append-only logs
      REVOKE UPDATE, DELETE ON public.audit_logs FROM public, authenticated, anon;
    `;

    console.log('Executing Patch 4 SQL migration...');
    await client.query(sql);
    console.log('[PASS] Patch 4 SQL executed successfully!');

    // Verification Query: Inspect pg_policies for audit_logs
    const res = await client.query(`
      SELECT policyname, cmd, qual, with_check 
      FROM pg_policies 
      WHERE tablename = 'audit_logs';
    `);

    console.log('\n--- Active Policies on public.audit_logs ---');
    console.table(res.rows);

    await client.end();
    console.log('\n================================================================');
    console.log('PATCH 4 DATABASE REMEDIATION COMPLETED WITH 100% SUCCESS');
    console.log('================================================================');
  } catch (err) {
    console.error('[ERROR] Failed to execute SQL migration:', err.message);
    try { await client.end(); } catch {}
    process.exit(1);
  }
}

applyPatch4();

