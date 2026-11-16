-- ============================================================================
-- PATCH 4: RESTRICT AUDIT_LOGS INSERTION POLICY & ENFORCE IMMUTABILITY
-- Prevents arbitrary audit log forgery by candidates and employers.
-- Restricts insertion to super_admin or verified self-actions.
-- ============================================================================

-- 1. Ensure RLS is enabled on public.audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing permissive policies
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

