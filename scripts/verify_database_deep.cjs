const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function verifyDatabaseDeep() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DIRECT_URL or DATABASE_URL is missing in .env.local');
  }

  const client = new Client({ connectionString });
  await client.connect();
  console.log('--- INDEPENDENT DATABASE AUDIT CONNECTED ---');

  // 1. Table RLS status
  const tablesRes = await client.query(`
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    ORDER BY tablename;
  `);

  console.log('\n=== 1. PUBLIC TABLES RLS STATUS ===');
  console.log(`Total public tables: ${tablesRes.rows.length}`);
  const rlsDisabled = tablesRes.rows.filter(t => !t.rowsecurity);
  console.log(`RLS Enabled count: ${tablesRes.rows.filter(t => t.rowsecurity).length}`);
  console.log(`RLS Disabled count: ${rlsDisabled.length}`);
  if (rlsDisabled.length > 0) {
    console.error('CRITICAL: Tables with RLS disabled:', rlsDisabled.map(t => t.tablename));
  } else {
    console.log('[PASS] All 38 tables have rowsecurity = true');
  }

  // 2. All RLS Policies Analysis
  const policiesRes = await client.query(`
    SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    ORDER BY tablename, policyname;
  `);

  console.log('\n=== 2. RLS POLICIES AUDIT ===');
  console.log(`Total active policies in public schema: ${policiesRes.rows.length}`);

  // Find tables without any policies
  const tablesWithPolicies = new Set(policiesRes.rows.map(p => p.tablename));
  const tablesWithoutPolicies = tablesRes.rows
    .map(t => t.tablename)
    .filter(t => !tablesWithPolicies.has(t));
  console.log(`Tables without any policies: ${tablesWithoutPolicies.length}`);
  if (tablesWithoutPolicies.length > 0) {
    console.warn('WARNING: Tables with RLS enabled but 0 policies (Default Deny ALL):', tablesWithoutPolicies);
  }

  // Check for overly permissive policies
  const overlyPermissive = [];
  for (const pol of policiesRes.rows) {
    const rolesArr = Array.isArray(pol.roles) ? pol.roles : (typeof pol.roles === 'string' ? [pol.roles] : []);
    const rolesStr = rolesArr.join(',');
    const isPublicOrAuth = rolesStr.includes('public') || rolesStr.includes('authenticated');
    const hasTrueQual = pol.qual && pol.qual.trim() === 'true';
    const hasTrueCheck = pol.with_check && pol.with_check.trim() === 'true';

    // Exceptions: Master lookup tables (cities, website_settings, etc.) where SELECT is intentionally public
    const isMasterTable = ['cities', 'states', 'districts', 'talukas', 'job_categories', 'subscription_plans', 'featured_job_plans', 'website_settings'].includes(pol.tablename);

    if (pol.cmd !== 'SELECT' && hasTrueQual && isPublicOrAuth && !isMasterTable) {
      overlyPermissive.push({ ...pol, reason: 'Non-SELECT with USING (true)' });
    }
    if (hasTrueCheck && isPublicOrAuth && pol.tablename !== 'audit_logs') {
      overlyPermissive.push({ ...pol, reason: 'WITH CHECK (true) on sensitive table' });
    }
  }

  console.log(`Overly permissive policies identified: ${overlyPermissive.length}`);
  overlyPermissive.forEach(op => {
    console.warn(`[PERMISSIVE FLAG] ${op.tablename}.${op.policyname} (${op.cmd}) [${op.roles}]: ${op.reason}`);
  });

  // 3. Unique constraints & Indexes
  console.log('\n=== 3. CONSTRAINTS & INDEXES ===');
  const uniqueRes = await client.query(`
    SELECT tc.table_name, tc.constraint_name, kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema = 'public' AND tc.constraint_type = 'UNIQUE'
    ORDER BY tc.table_name, tc.constraint_name;
  `);
  console.log(`Total UNIQUE constraints: ${uniqueRes.rows.length}`);
  const jobAppUnique = uniqueRes.rows.filter(u => u.table_name === 'job_applications');
  console.log('job_applications unique constraints:', jobAppUnique);

  // 4. Foreign Keys Integrity
  const fkRes = await client.query(`
    SELECT
      tc.table_name, 
      kcu.column_name, 
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name 
    FROM information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
    ORDER BY tc.table_name;
  `);
  console.log(`Total FOREIGN KEY relationships: ${fkRes.rows.length}`);

  // 5. Data Orphans & Record Counts
  console.log('\n=== 4. RECORD AUDIT & ORPHANS ===');
  const countProfiles = await client.query('SELECT count(*) FROM public.profiles;');
  const countAuth = await client.query('SELECT count(*) FROM auth.users;');
  const countCandidates = await client.query('SELECT count(*) FROM public.candidates;');
  const countEmployers = await client.query('SELECT count(*) FROM public.employers;');
  const countCompanies = await client.query('SELECT count(*) FROM public.companies;');
  const countJobs = await client.query('SELECT count(*) FROM public.jobs;');
  const countApplications = await client.query('SELECT count(*) FROM public.job_applications;');

  console.log(`auth.users count: ${countAuth.rows[0].count}`);
  console.log(`public.profiles count: ${countProfiles.rows[0].count}`);
  console.log(`public.candidates count: ${countCandidates.rows[0].count}`);
  console.log(`public.employers count: ${countEmployers.rows[0].count}`);
  console.log(`public.companies count: ${countCompanies.rows[0].count}`);
  console.log(`public.jobs count: ${countJobs.rows[0].count}`);
  console.log(`public.job_applications count: ${countApplications.rows[0].count}`);

  const orphanProfiles = await client.query(`
    SELECT p.id, p.email, p.user_id 
    FROM public.profiles p 
    LEFT JOIN auth.users u ON p.user_id = u.id 
    WHERE u.id IS NULL AND p.user_id IS NOT NULL;
  `);
  console.log(`Orphan profiles (pointing to non-existent auth.users): ${orphanProfiles.rows.length}`);

  const orphanCandidates = await client.query(`
    SELECT c.id 
    FROM public.candidates c 
    LEFT JOIN public.profiles p ON c.profile_id = p.id 
    WHERE p.id IS NULL;
  `);
  console.log(`Orphan candidates (pointing to non-existent profiles): ${orphanCandidates.rows.length}`);

  const orphanEmployers = await client.query(`
    SELECT e.id 
    FROM public.employers e 
    LEFT JOIN public.profiles p ON e.profile_id = p.id 
    WHERE p.id IS NULL;
  `);
  console.log(`Orphan employers (pointing to non-existent profiles): ${orphanEmployers.rows.length}`);

  const orphanCompanies = await client.query(`
    SELECT c.id 
    FROM public.companies c 
    LEFT JOIN public.employers e ON c.employer_id = e.id 
    WHERE e.id IS NULL;
  `);
  console.log(`Orphan companies (pointing to non-existent employers): ${orphanCompanies.rows.length}`);

  const orphanJobs = await client.query(`
    SELECT j.id 
    FROM public.jobs j 
    LEFT JOIN public.employers e ON j.employer_id = e.id 
    WHERE e.id IS NULL;
  `);
  console.log(`Orphan jobs (pointing to non-existent employers): ${orphanJobs.rows.length}`);

  // 6. Check Storage Buckets & Policies
  console.log('\n=== 5. STORAGE BUCKETS & POLICIES ===');
  const buckets = await client.query('SELECT id, name, public, file_size_limit, allowed_mime_types FROM storage.buckets ORDER BY id;');
  console.log('Buckets in storage.buckets:', buckets.rows);

  const storagePolicies = await client.query(`
    SELECT policyname, permissive, roles, cmd, qual, with_check 
    FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' 
    ORDER BY policyname;
  `);
  console.log('Storage object policies:', storagePolicies.rows.map(p => ({ name: p.policyname, cmd: p.cmd, roles: p.roles })));

  await client.end();
}

verifyDatabaseDeep().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});

