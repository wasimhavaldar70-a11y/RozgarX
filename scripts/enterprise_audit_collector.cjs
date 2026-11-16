const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function collectAuditData() {
  const client = new Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
  await client.connect();

  console.log('--- ENTERPRISE AUDIT DATA COLLECTION (READ ONLY) ---');
  await client.query('BEGIN READ ONLY;');

  // 1. Table Counts & RLS
  const tables = await client.query(`
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    ORDER BY tablename;
  `);

  // 2. Active Policies
  const policies = await client.query(`
    SELECT tablename, policyname, permissive, roles, cmd, qual, with_check 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    ORDER BY tablename, policyname;
  `);

  // 3. Functions & Security Definer checks
  const functions = await client.query(`
    SELECT 
      p.proname,
      p.prosecdef,
      p.proconfig,
      pg_get_function_identity_arguments(p.oid) as args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef = true
    ORDER BY p.proname;
  `);

  // 4. Triggers
  const triggers = await client.query(`
    SELECT event_object_table, trigger_name, action_timing, event_manipulation, action_statement
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
    ORDER BY event_object_table, trigger_name;
  `);

  // 5. Indexes
  const indexes = await client.query(`
    SELECT tablename, indexname, indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
    ORDER BY tablename, indexname;
  `);

  // 6. Foreign Keys & Cascades
  const foreignKeys = await client.query(`
    SELECT
      tc.table_name, 
      kcu.column_name, 
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name,
      rc.delete_rule
    FROM information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
    JOIN information_schema.referential_constraints AS rc
      ON rc.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
    ORDER BY tc.table_name;
  `);

  // 7. Storage Buckets
  const buckets = await client.query(`
    SELECT id, name, public, file_size_limit, allowed_mime_types 
    FROM storage.buckets 
    ORDER BY id;
  `);

  // 8. Storage Policies
  const storagePolicies = await client.query(`
    SELECT policyname, permissive, roles, cmd, qual, with_check 
    FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' 
    ORDER BY policyname;
  `);

  // 9. Live Record Counts
  const recordCounts = {};
  for (const t of ['profiles', 'candidates', 'employers', 'companies', 'jobs', 'job_applications', 'saved_jobs', 'employer_documents', 'candidate_resumes', 'otp_challenges', 'otp_rate_limits', 'registration_approvals', 'payments', 'notifications', 'audit_logs']) {
    try {
      const res = await client.query(`SELECT count(*) FROM public.${t};`);
      recordCounts[t] = parseInt(res.rows[0].count);
    } catch (e) {
      recordCounts[t] = `Error: ${e.message}`;
    }
  }

  await client.query('COMMIT;');
  await client.end();

  console.log(JSON.stringify({
    tablesCount: tables.rows.length,
    rlsEnabledCount: tables.rows.filter(t => t.rowsecurity).length,
    rlsDisabled: tables.rows.filter(t => !t.rowsecurity).map(t => t.tablename),
    totalPolicies: policies.rows.length,
    secDefFunctions: functions.rows,
    triggers: triggers.rows,
    indexesCount: indexes.rows.length,
    foreignKeysCount: foreignKeys.rows.length,
    cascadeRules: foreignKeys.rows.map(fk => ({ table: fk.table_name, ref: fk.foreign_table_name, rule: fk.delete_rule })),
    storageBuckets: buckets.rows,
    storagePolicies: storagePolicies.rows,
    liveRecordCounts: recordCounts
  }, null, 2));
}

collectAuditData().catch(console.error);

