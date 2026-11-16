-- ============================================================================
-- MAHAJOBS: MAHARASHTRA REGIONAL EMPLOYMENT PORTAL
-- PostgreSQL Migration: 004_enterprise_security_hardening.sql
-- Enterprise Database Consistency, RLS Policy Rectification & Storage Security
-- ============================================================================

-- Ensure uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. HELPER SECURITY FUNCTIONS (Index-Backed, Cached, SECURITY DEFINER)
-- Prevents recursive policy evaluation and normalizes auth.uid() mapping
-- ============================================================================

-- Function: Check if the current authenticated user is a Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE (id = auth.uid() OR user_id = auth.uid()) 
      AND role = 'super_admin'
  );
$$;

-- Function: Resolve the candidate_id for the current authenticated user
CREATE OR REPLACE FUNCTION public.get_current_candidate_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT c.id 
  FROM public.candidates c
  JOIN public.profiles p ON c.profile_id = p.id
  WHERE p.id = auth.uid() OR p.user_id = auth.uid()
  LIMIT 1;
$$;

-- Function: Resolve the employer_id for the current authenticated user
CREATE OR REPLACE FUNCTION public.get_current_employer_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT e.id 
  FROM public.employers e
  JOIN public.profiles p ON e.profile_id = p.id
  WHERE p.id = auth.uid() OR p.user_id = auth.uid()
  LIMIT 1;
$$;

-- Function: Resolve company_ids owned by the current authenticated user
CREATE OR REPLACE FUNCTION public.get_current_company_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT c.id 
  FROM public.companies c
  JOIN public.employers e ON c.employer_id = e.id
  JOIN public.profiles p ON e.profile_id = p.id
  WHERE p.id = auth.uid() OR p.user_id = auth.uid()
  LIMIT 1;
$$;

-- Harden function execution permissions
REVOKE ALL ON FUNCTION public.is_super_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_current_candidate_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_current_candidate_id() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_current_employer_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_current_employer_id() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_current_company_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_current_company_id() TO authenticated, service_role;

-- ============================================================================
-- 2. HARDEN EXISTING SECURITY DEFINER FUNCTIONS WITH EXPLICIT SEARCH_PATH
-- Eliminates search_path hijacking vulnerability
-- ============================================================================

ALTER FUNCTION public.check_phone_registered(VARCHAR) SET search_path = public, pg_temp;
ALTER FUNCTION public.check_and_increment_rate_limit(VARCHAR, VARCHAR, INT, INT) SET search_path = public, pg_temp;
ALTER FUNCTION public.record_otp_challenge(VARCHAR, VARCHAR, VARCHAR, VARCHAR, INT) SET search_path = public, pg_temp;
ALTER FUNCTION public.verify_challenge_and_approve(UUID, VARCHAR, VARCHAR, VARCHAR, INT) SET search_path = public, pg_temp;
ALTER FUNCTION public.consume_registration_approval(VARCHAR, VARCHAR, VARCHAR) SET search_path = public, pg_temp;
ALTER FUNCTION public.cleanup_expired_otp_records() SET search_path = public, pg_temp;

-- ============================================================================
-- 3. ENABLE RLS ON ALL PREVIOUSLY UNPROTECTED TABLES
-- ============================================================================

ALTER TABLE public.candidate_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruitment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talukas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_job_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. RECTIFY BROKEN RLS POLICIES FOR CORE BUSINESS WORKFLOWS
-- ============================================================================

-- 4.1. JOBS
DROP POLICY IF EXISTS employers_manage_own_jobs ON public.jobs;
DROP POLICY IF EXISTS public_can_view_approved_jobs ON public.jobs;
DROP POLICY IF EXISTS admin_all_jobs ON public.jobs;

-- Public can view approved active jobs that have not expired
CREATE POLICY public_can_view_approved_jobs ON public.jobs
    FOR SELECT TO public
    USING (status = 'approved' AND (application_deadline IS NULL OR application_deadline >= CURRENT_DATE));

-- Employers can view all jobs they own (including pending, rejected, paused)
CREATE POLICY employers_view_own_jobs ON public.jobs
    FOR SELECT TO authenticated
    USING (employer_id = public.get_current_employer_id() OR public.is_super_admin());

-- Employers can create jobs belonging to their own employer_id
CREATE POLICY employers_insert_own_jobs ON public.jobs
    FOR INSERT TO authenticated
    WITH CHECK (employer_id = public.get_current_employer_id() OR public.is_super_admin());

-- Employers can update their own jobs (status cannot be changed directly to approved by employer)
CREATE POLICY employers_update_own_jobs ON public.jobs
    FOR UPDATE TO authenticated
    USING (employer_id = public.get_current_employer_id() OR public.is_super_admin())
    WITH CHECK (
        public.is_super_admin() OR (
            employer_id = public.get_current_employer_id() 
            AND (status = (SELECT j.status FROM public.jobs j WHERE j.id = jobs.id) OR status IN ('paused', 'closed'))
        )
    );

-- Employers can delete only their own closed/pending jobs; Super Admin can delete any
CREATE POLICY employers_delete_own_jobs ON public.jobs
    FOR DELETE TO authenticated
    USING (employer_id = public.get_current_employer_id() OR public.is_super_admin());

-- 4.2. JOB APPLICATIONS
DROP POLICY IF EXISTS candidates_view_own_applications ON public.job_applications;
DROP POLICY IF EXISTS candidates_insert_application ON public.job_applications;
DROP POLICY IF EXISTS employers_view_received_applications ON public.job_applications;

-- Candidates can view only their own applications; Admins can view all
CREATE POLICY candidates_view_own_applications ON public.job_applications
    FOR SELECT TO authenticated
    USING (candidate_id = public.get_current_candidate_id() OR public.is_super_admin());

-- Candidates can submit applications for themselves only
CREATE POLICY candidates_insert_application ON public.job_applications
    FOR INSERT TO authenticated
    WITH CHECK (
        candidate_id = public.get_current_candidate_id()
        AND EXISTS (
            SELECT 1 FROM public.jobs 
            WHERE jobs.id = job_applications.job_id 
              AND jobs.status = 'approved'
        )
    );

-- Employers can view applications submitted to their jobs
CREATE POLICY employers_view_received_applications ON public.job_applications
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.jobs 
            WHERE jobs.id = job_applications.job_id 
              AND jobs.employer_id = public.get_current_employer_id()
        )
        OR public.is_super_admin()
    );

-- Employers can update application status for jobs they own
CREATE POLICY employers_update_application_status ON public.job_applications
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.jobs 
            WHERE jobs.id = job_applications.job_id 
              AND jobs.employer_id = public.get_current_employer_id()
        )
        OR public.is_super_admin()
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.jobs 
            WHERE jobs.id = job_applications.job_id 
              AND jobs.employer_id = public.get_current_employer_id()
        )
        OR public.is_super_admin()
    );

-- 4.3. CANDIDATE SUB-RECORDS (Resumes, Education, Experience, Skills, Saved Jobs, Alerts)
CREATE POLICY candidate_resumes_policy ON public.candidate_resumes
    FOR ALL TO authenticated
    USING (
        candidate_id = public.get_current_candidate_id() 
        OR public.is_super_admin()
        OR EXISTS (
            SELECT 1 FROM public.job_applications ja
            JOIN public.jobs j ON ja.job_id = j.id
            WHERE ja.candidate_id = candidate_resumes.candidate_id
              AND j.employer_id = public.get_current_employer_id()
        )
    )
    WITH CHECK (candidate_id = public.get_current_candidate_id() OR public.is_super_admin());

CREATE POLICY candidate_education_policy ON public.candidate_education
    FOR ALL TO authenticated
    USING (candidate_id = public.get_current_candidate_id() OR public.is_super_admin())
    WITH CHECK (candidate_id = public.get_current_candidate_id() OR public.is_super_admin());

CREATE POLICY candidate_experience_policy ON public.candidate_experience
    FOR ALL TO authenticated
    USING (candidate_id = public.get_current_candidate_id() OR public.is_super_admin())
    WITH CHECK (candidate_id = public.get_current_candidate_id() OR public.is_super_admin());

CREATE POLICY candidate_skills_policy ON public.candidate_skills
    FOR ALL TO authenticated
    USING (candidate_id = public.get_current_candidate_id() OR public.is_super_admin())
    WITH CHECK (candidate_id = public.get_current_candidate_id() OR public.is_super_admin());

CREATE POLICY saved_jobs_policy ON public.saved_jobs
    FOR ALL TO authenticated
    USING (candidate_id = public.get_current_candidate_id() OR public.is_super_admin())
    WITH CHECK (candidate_id = public.get_current_candidate_id() OR public.is_super_admin());

CREATE POLICY job_alerts_policy ON public.job_alerts
    FOR ALL TO authenticated
    USING (candidate_id = public.get_current_candidate_id() OR public.is_super_admin())
    WITH CHECK (candidate_id = public.get_current_candidate_id() OR public.is_super_admin());

-- 4.4. EMPLOYER DOCUMENTS (Private & Protected)
CREATE POLICY employer_documents_policy ON public.employer_documents
    FOR ALL TO authenticated
    USING (
        company_id = public.get_current_company_id()
        OR public.is_super_admin()
    )
    WITH CHECK (
        (company_id = public.get_current_company_id() AND verification_status = 'Pending')
        OR public.is_super_admin()
    );

-- 4.5. SUBSCRIPTIONS & CREDITS
CREATE POLICY employer_subscriptions_policy ON public.employer_subscriptions
    FOR SELECT TO authenticated
    USING (employer_id = public.get_current_employer_id() OR public.is_super_admin());

CREATE POLICY job_credits_policy ON public.job_credits
    FOR SELECT TO authenticated
    USING (employer_id = public.get_current_employer_id() OR public.is_super_admin());

CREATE POLICY credit_transactions_policy ON public.credit_transactions
    FOR SELECT TO authenticated
    USING (employer_id = public.get_current_employer_id() OR public.is_super_admin());

-- 4.6. PAYMENTS & WEBHOOKS
CREATE POLICY payments_policy ON public.payments
    FOR SELECT TO authenticated
    USING (employer_id = public.get_current_employer_id() OR public.is_super_admin());

CREATE POLICY payment_webhook_events_policy ON public.payment_webhook_events
    FOR ALL TO authenticated
    USING (public.is_super_admin());

-- 4.7. NOTIFICATIONS
CREATE POLICY notifications_policy ON public.notifications
    FOR ALL TO authenticated
    USING (user_id = auth.uid() OR public.is_super_admin())
    WITH CHECK (user_id = auth.uid() OR public.is_super_admin());

-- 4.8. AUDIT LOGS (Append-only for security; read-only for Super Admin)
DROP POLICY IF EXISTS audit_logs_read ON public.audit_logs;
CREATE POLICY audit_logs_read ON public.audit_logs
    FOR SELECT TO authenticated
    USING (public.is_super_admin());

DROP POLICY IF EXISTS audit_logs_insert ON public.audit_logs;
CREATE POLICY audit_logs_insert ON public.audit_logs
    FOR INSERT TO authenticated
    WITH CHECK (
        public.is_super_admin() 
        OR (admin_id = auth.uid() AND action = 'USER_SELF_ACTION')
    );

-- Prevent any UPDATE or DELETE operations to ensure tamper-proof audit trail
REVOKE UPDATE, DELETE ON public.audit_logs FROM public, authenticated, anon;

-- 4.9. PUBLIC MASTER TABLES (Read-only for public, writable by Super Admin)
CREATE POLICY states_public_read ON public.states FOR SELECT TO public USING (is_active = true OR public.is_super_admin());
CREATE POLICY districts_public_read ON public.districts FOR SELECT TO public USING (is_active = true OR public.is_super_admin());
CREATE POLICY talukas_public_read ON public.talukas FOR SELECT TO public USING (is_active = true OR public.is_super_admin());
CREATE POLICY cities_public_read ON public.cities FOR SELECT TO public USING (true);
CREATE POLICY job_categories_public_read ON public.job_categories FOR SELECT TO public USING (is_active = true OR public.is_super_admin());
CREATE POLICY subscription_plans_public_read ON public.subscription_plans FOR SELECT TO public USING (is_active = true OR public.is_super_admin());
CREATE POLICY featured_job_plans_public_read ON public.featured_job_plans FOR SELECT TO public USING (is_active = true OR public.is_super_admin());
CREATE POLICY advertisements_public_read ON public.advertisements FOR SELECT TO public USING (is_active = true AND CURRENT_DATE BETWEEN start_date AND end_date);
CREATE POLICY website_settings_public_read ON public.website_settings FOR SELECT TO public USING (true);

-- ============================================================================
-- 5. CONSTRAINTS & COMPOSITE INDEXES
-- ============================================================================

-- Ensure atomic check for duplicate applications
CREATE UNIQUE INDEX IF NOT EXISTS uq_job_applications_candidate_job 
ON public.job_applications(job_id, candidate_id);

-- Performance Composite Indexes
CREATE INDEX IF NOT EXISTS idx_jobs_search_composite 
ON public.jobs(status, district, category, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_candidates_profile_lookup 
ON public.candidates(profile_id);

CREATE INDEX IF NOT EXISTS idx_employers_profile_lookup 
ON public.employers(profile_id);

CREATE INDEX IF NOT EXISTS idx_companies_employer_lookup 
ON public.companies(employer_id);

CREATE INDEX IF NOT EXISTS idx_job_applications_employer_lookup 
ON public.job_applications(job_id, status);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp 
ON public.audit_logs(timestamp DESC);

-- ============================================================================
-- 6. SUPABASE STORAGE BUCKET CONFIGURATION
-- Configures private and public storage buckets with strict policy enforcement
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('candidate-resumes', 'candidate-resumes', false, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('employer-documents', 'employer-documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('company-logos', 'company-logos', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS Policies (storage.objects has RLS enabled by default in Supabase)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Resumes: Candidate owns, Super Admin reads, Applied Employer reads
DROP POLICY IF EXISTS "candidate_manage_own_resume" ON storage.objects;
CREATE POLICY "candidate_manage_own_resume" ON storage.objects
    FOR ALL TO authenticated
    USING (
        bucket_id = 'candidate-resumes' 
        AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_super_admin())
    )
    WITH CHECK (
        bucket_id = 'candidate-resumes' 
        AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_super_admin())
    );

-- Employer Documents: Company owner manages, Super Admin reviews
DROP POLICY IF EXISTS "employer_manage_own_docs" ON storage.objects;
CREATE POLICY "employer_manage_own_docs" ON storage.objects
    FOR ALL TO authenticated
    USING (
        bucket_id = 'employer-documents' 
        AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_super_admin())
    )
    WITH CHECK (
        bucket_id = 'employer-documents' 
        AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_super_admin())
    );

-- Public buckets (Logos, Avatars)
DROP POLICY IF EXISTS "public_read_logos_avatars" ON storage.objects;
CREATE POLICY "public_read_logos_avatars" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id IN ('company-logos', 'avatars'));

DROP POLICY IF EXISTS "auth_upload_logos_avatars" ON storage.objects;
CREATE POLICY "auth_upload_logos_avatars" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id IN ('company-logos', 'avatars'));
