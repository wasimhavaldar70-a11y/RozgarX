-- ============================================================================
-- MAHAJOBS: Migration 005_complete_remaining_policies.sql
-- Comprehensive RLS Policies for the remaining 6 tables:
-- support_tickets, reports, application_status_history, featured_jobs,
-- recruitment_requests, and user_roles
-- ============================================================================

-- 1. SUPPORT TICKETS
DROP POLICY IF EXISTS support_tickets_select ON public.support_tickets;
DROP POLICY IF EXISTS support_tickets_insert ON public.support_tickets;

CREATE POLICY support_tickets_select ON public.support_tickets
    FOR SELECT TO authenticated
    USING (user_id = auth.uid() OR public.is_super_admin());

CREATE POLICY support_tickets_insert ON public.support_tickets
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid() OR public.is_super_admin());

-- 2. ABUSE & CONTENT REPORTS
DROP POLICY IF EXISTS reports_insert ON public.reports;
DROP POLICY IF EXISTS reports_admin_manage ON public.reports;

CREATE POLICY reports_insert ON public.reports
    FOR INSERT TO authenticated
    WITH CHECK (reporter_id = auth.uid() OR public.is_super_admin());

CREATE POLICY reports_admin_manage ON public.reports
    FOR ALL TO authenticated
    USING (public.is_super_admin());

-- 3. APPLICATION STATUS HISTORY
DROP POLICY IF EXISTS app_status_history_select ON public.application_status_history;
DROP POLICY IF EXISTS app_status_history_insert ON public.application_status_history;

CREATE POLICY app_status_history_select ON public.application_status_history
    FOR SELECT TO authenticated
    USING (
        public.is_super_admin()
        OR EXISTS (
            SELECT 1 FROM public.job_applications ja
            WHERE ja.id = application_status_history.application_id
              AND (
                  ja.candidate_id = public.get_current_candidate_id()
                  OR EXISTS (
                      SELECT 1 FROM public.jobs j
                      WHERE j.id = ja.job_id
                        AND j.employer_id = public.get_current_employer_id()
                  )
              )
        )
    );

CREATE POLICY app_status_history_insert ON public.application_status_history
    FOR INSERT TO authenticated
    WITH CHECK (
        public.is_super_admin()
        OR EXISTS (
            SELECT 1 FROM public.job_applications ja
            JOIN public.jobs j ON j.id = ja.job_id
            WHERE ja.id = application_status_history.application_id
              AND j.employer_id = public.get_current_employer_id()
        )
    );

-- 4. FEATURED JOBS
DROP POLICY IF EXISTS featured_jobs_public_select ON public.featured_jobs;
DROP POLICY IF EXISTS featured_jobs_employer_select ON public.featured_jobs;
DROP POLICY IF EXISTS featured_jobs_admin_all ON public.featured_jobs;

CREATE POLICY featured_jobs_public_select ON public.featured_jobs
    FOR SELECT TO public
    USING (CURRENT_TIMESTAMP BETWEEN start_date AND end_date);

CREATE POLICY featured_jobs_employer_select ON public.featured_jobs
    FOR SELECT TO authenticated
    USING (employer_id = public.get_current_employer_id() OR public.is_super_admin());

CREATE POLICY featured_jobs_admin_all ON public.featured_jobs
    FOR ALL TO authenticated
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- 5. RECRUITMENT REQUESTS (Talent matchmaking form)
DROP POLICY IF EXISTS recruitment_requests_insert ON public.recruitment_requests;
DROP POLICY IF EXISTS recruitment_requests_admin_all ON public.recruitment_requests;

CREATE POLICY recruitment_requests_insert ON public.recruitment_requests
    FOR INSERT TO public
    WITH CHECK (true);

CREATE POLICY recruitment_requests_admin_all ON public.recruitment_requests
    FOR ALL TO authenticated
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- 6. USER ROLES (Restricted strictly to Super Admin)
DROP POLICY IF EXISTS user_roles_super_admin_only ON public.user_roles;

CREATE POLICY user_roles_super_admin_only ON public.user_roles
    FOR ALL TO authenticated
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

