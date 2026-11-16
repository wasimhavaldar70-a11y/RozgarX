-- ============================================================================
-- MAHAJOBS: MAHARASHTRA JOB PORTAL
-- PostgreSQL Database Migration: 003_sms_otp_registration.sql
-- Production-Ready SMS OTP Registration Verification via MSG91
-- ============================================================================

-- 1. Ensure phone_verified column and indexes exist on profiles, and contact fields on companies
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;

-- Ensure normalized phone unique index on profiles
CREATE UNIQUE INDEX IF NOT EXISTS uq_profiles_mobile 
ON profiles (mobile);

-- Ensure companies table supports contact_email and contact_phone used by registration
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20);

-- 2. OTP CHALLENGES TABLE
-- Stores metadata for OTP challenges sent via MSG91.
-- NEVER stores the actual OTP value in plaintext or hash.
CREATE TABLE IF NOT EXISTS otp_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) NOT NULL,
    request_id VARCHAR(100),
    purpose VARCHAR(50) NOT NULL CHECK (purpose IN ('candidate_registration', 'employer_registration')),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'expired', 'failed', 'cancelled')),
    send_attempts INTEGER DEFAULT 1,
    verify_attempts INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    verified_at TIMESTAMPTZ,
    ip_hash VARCHAR(64)
);

CREATE INDEX IF NOT EXISTS idx_otp_challenges_phone ON otp_challenges(phone);
CREATE INDEX IF NOT EXISTS idx_otp_challenges_status ON otp_challenges(status);
CREATE INDEX IF NOT EXISTS idx_otp_challenges_expires ON otp_challenges(expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_challenges_created ON otp_challenges(created_at DESC);

-- 3. REGISTRATION APPROVALS TABLE
-- Short-lived, one-time cryptographically secure approval tokens generated only after MSG91 verifies OTP.
-- Stores only the SHA-256 hash of the approval token, never the raw token.
CREATE TABLE IF NOT EXISTS registration_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('candidate', 'employer')),
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    consumed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reg_approvals_token_hash ON registration_approvals(token_hash);
CREATE INDEX IF NOT EXISTS idx_reg_approvals_phone ON registration_approvals(phone);
CREATE INDEX IF NOT EXISTS idx_reg_approvals_expires ON registration_approvals(expires_at);

-- 4. OTP RATE LIMITS TABLE
-- Atomic database-backed rate limiting for phone numbers and IPs.
CREATE TABLE IF NOT EXISTS otp_rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identifier VARCHAR(100) NOT NULL, -- normalized phone or ip_hash
    action VARCHAR(50) NOT NULL,      -- 'send_otp', 'verify_otp'
    attempt_count INTEGER DEFAULT 1,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    last_attempt_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_identifier_action UNIQUE (identifier, action)
);

CREATE INDEX IF NOT EXISTS idx_otp_rate_limits_id ON otp_rate_limits(identifier, action);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Security: Zero public access to OTP challenges or approval tokens.
-- Only the backend service-role inside Edge Functions can read/write them.
-- ============================================================================

ALTER TABLE otp_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_rate_limits ENABLE ROW LEVEL SECURITY;

-- Deny all public access to otp_challenges
DROP POLICY IF EXISTS no_public_access_otp_challenges ON otp_challenges;
CREATE POLICY no_public_access_otp_challenges ON otp_challenges
    FOR ALL TO PUBLIC USING (false);

-- Deny all public access to registration_approvals
DROP POLICY IF EXISTS no_public_access_registration_approvals ON registration_approvals;
CREATE POLICY no_public_access_registration_approvals ON registration_approvals
    FOR ALL TO PUBLIC USING (false);

-- Deny all public access to otp_rate_limits
DROP POLICY IF EXISTS no_public_access_otp_rate_limits ON otp_rate_limits;
CREATE POLICY no_public_access_otp_rate_limits ON otp_rate_limits
    FOR ALL TO PUBLIC USING (false);

-- Profiles Security: Enable RLS and protect phone_verified & role from self-elevation
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_read_own_profile ON profiles;
CREATE POLICY users_read_own_profile ON profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id OR auth.uid() = user_id);

DROP POLICY IF EXISTS users_cannot_elevate_phone_verification ON profiles;
CREATE POLICY users_cannot_elevate_phone_verification ON profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id OR auth.uid() = user_id)
    WITH CHECK (
        (auth.uid() = id OR auth.uid() = user_id) AND 
        phone_verified = (SELECT phone_verified FROM profiles WHERE id = auth.uid() OR user_id = auth.uid() LIMIT 1) AND
        role = (SELECT role FROM profiles WHERE id = auth.uid() OR user_id = auth.uid() LIMIT 1)
    );

-- Candidates Security: Candidates can read and update their own profile
DROP POLICY IF EXISTS candidates_read_own_profile ON candidates;
CREATE POLICY candidates_read_own_profile ON candidates
    FOR SELECT TO authenticated
    USING (profile_id = auth.uid());

DROP POLICY IF EXISTS candidates_update_own_profile ON candidates;
CREATE POLICY candidates_update_own_profile ON candidates
    FOR UPDATE TO authenticated
    USING (profile_id = auth.uid())
    WITH CHECK (profile_id = auth.uid());

-- Employers & Companies Security: Employers manage own company info; cannot self-approve verification_status
DROP POLICY IF EXISTS employers_read_own_record ON employers;
CREATE POLICY employers_read_own_record ON employers
    FOR SELECT TO authenticated
    USING (profile_id = auth.uid());

DROP POLICY IF EXISTS employers_update_own_record ON employers;
CREATE POLICY employers_update_own_record ON employers
    FOR UPDATE TO authenticated
    USING (profile_id = auth.uid())
    WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS public_view_companies ON companies;
CREATE POLICY public_view_companies ON companies
    FOR SELECT USING (
        verification_status = 'Verified'
        OR EXISTS (
            SELECT 1 FROM employers e WHERE e.id = companies.employer_id AND e.profile_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS employers_update_own_company ON companies;
CREATE POLICY employers_update_own_company ON companies
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM employers e WHERE e.id = companies.employer_id AND e.profile_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM employers e WHERE e.id = companies.employer_id AND e.profile_id = auth.uid()
        )
        AND verification_status = (SELECT c.verification_status FROM companies c WHERE c.id = companies.id)
    );

-- ============================================================================
-- DATABASE PROCEDURES & ATOMIC FUNCTIONS
-- ============================================================================

-- Function 1: Check if phone number is already registered across profiles or companies
CREATE OR REPLACE FUNCTION check_phone_registered(p_phone VARCHAR)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles WHERE mobile = p_phone
        UNION
        SELECT 1 FROM candidates WHERE mobile = p_phone
        UNION
        SELECT 1 FROM employers WHERE mobile = p_phone
    );
END;
$$;

-- Function 2: Atomic Rate Limiting check & increment
CREATE OR REPLACE FUNCTION check_and_increment_rate_limit(
    p_identifier VARCHAR,
    p_action VARCHAR,
    p_max_attempts INT,
    p_window_seconds INT
)
RETURNS TABLE (allowed BOOLEAN, retry_after_seconds INT, current_count INT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_record RECORD;
    v_now TIMESTAMPTZ := NOW();
    v_elapsed_seconds INT;
BEGIN
    SELECT * INTO v_record
    FROM otp_rate_limits
    WHERE identifier = p_identifier AND action = p_action
    FOR UPDATE;

    IF NOT FOUND THEN
        INSERT INTO otp_rate_limits (identifier, action, attempt_count, window_start, last_attempt_at)
        VALUES (p_identifier, p_action, 1, v_now, v_now);
        RETURN QUERY SELECT true, 0, 1;
        RETURN;
    END IF;

    v_elapsed_seconds := EXTRACT(EPOCH FROM (v_now - v_record.window_start))::INT;

    IF v_elapsed_seconds > p_window_seconds THEN
        -- Window expired, reset counter
        UPDATE otp_rate_limits
        SET attempt_count = 1,
            window_start = v_now,
            last_attempt_at = v_now
        WHERE id = v_record.id;
        RETURN QUERY SELECT true, 0, 1;
        RETURN;
    END IF;

    IF v_record.attempt_count >= p_max_attempts THEN
        -- Limit exceeded
        RETURN QUERY SELECT false, (p_window_seconds - v_elapsed_seconds), v_record.attempt_count;
        RETURN;
    END IF;

    -- Increment counter
    UPDATE otp_rate_limits
    SET attempt_count = v_record.attempt_count + 1,
        last_attempt_at = v_now
    WHERE id = v_record.id;

    RETURN QUERY SELECT true, 0, (v_record.attempt_count + 1);
END;
$$;

-- Function 3: Create OTP Challenge record
CREATE OR REPLACE FUNCTION record_otp_challenge(
    p_phone VARCHAR,
    p_purpose VARCHAR,
    p_request_id VARCHAR,
    p_ip_hash VARCHAR,
    p_expiry_minutes INT DEFAULT 5
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_challenge_id UUID;
BEGIN
    -- Cancel any prior pending challenge for this phone and purpose
    UPDATE otp_challenges
    SET status = 'cancelled'
    WHERE phone = p_phone AND purpose = p_purpose AND status = 'pending';

    INSERT INTO otp_challenges (
        phone,
        purpose,
        request_id,
        ip_hash,
        status,
        expires_at
    )
    VALUES (
        p_phone,
        p_purpose,
        p_request_id,
        p_ip_hash,
        'pending',
        NOW() + (p_expiry_minutes || ' minutes')::INTERVAL
    )
    RETURNING id INTO v_challenge_id;

    RETURN v_challenge_id;
END;
$$;

-- Function 4: Verify Challenge & Create Registration Approval Token Hash
CREATE OR REPLACE FUNCTION verify_challenge_and_approve(
    p_challenge_id UUID,
    p_phone VARCHAR,
    p_role VARCHAR,
    p_token_hash VARCHAR,
    p_approval_minutes INT DEFAULT 10
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_challenge RECORD;
BEGIN
    SELECT * INTO v_challenge
    FROM otp_challenges
    WHERE id = p_challenge_id AND phone = p_phone
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    IF v_challenge.status != 'pending' THEN
        RETURN FALSE;
    END IF;

    IF NOW() > v_challenge.expires_at THEN
        UPDATE otp_challenges SET status = 'expired' WHERE id = p_challenge_id;
        RETURN FALSE;
    END IF;

    -- Mark challenge as verified
    UPDATE otp_challenges
    SET status = 'verified',
        verified_at = NOW()
    WHERE id = p_challenge_id;

    -- Create one-time registration approval
    INSERT INTO registration_approvals (
        phone,
        role,
        token_hash,
        expires_at
    )
    VALUES (
        p_phone,
        p_role,
        p_token_hash,
        NOW() + (p_approval_minutes || ' minutes')::INTERVAL
    );

    RETURN TRUE;
END;
$$;

-- Function 5: Atomically Consume Registration Approval Token
CREATE OR REPLACE FUNCTION consume_registration_approval(
    p_token_hash VARCHAR,
    p_phone VARCHAR,
    p_role VARCHAR
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_approval RECORD;
BEGIN
    SELECT * INTO v_approval
    FROM registration_approvals
    WHERE token_hash = p_token_hash AND phone = p_phone AND role = p_role
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    IF v_approval.consumed_at IS NOT NULL THEN
        -- Token already used
        RETURN FALSE;
    END IF;

    IF NOW() > v_approval.expires_at THEN
        -- Token expired
        RETURN FALSE;
    END IF;

    -- Atomically consume the token
    UPDATE registration_approvals
    SET consumed_at = NOW()
    WHERE id = v_approval.id;

    RETURN TRUE;
END;
$$;

-- Function 6: Periodic cleanup of expired challenges & approvals
CREATE OR REPLACE FUNCTION cleanup_expired_otp_records()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE otp_challenges
    SET status = 'expired'
    WHERE status = 'pending' AND expires_at < NOW();

    DELETE FROM registration_approvals
    WHERE expires_at < NOW() - INTERVAL '1 day';

    DELETE FROM otp_challenges
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$;

-- ============================================================================
-- RPC ACCESS HARDENING: Only service_role (Edge Functions) can execute OTP RPCs
-- ============================================================================
REVOKE ALL ON FUNCTION check_phone_registered(VARCHAR) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION check_phone_registered(VARCHAR) TO service_role;

REVOKE ALL ON FUNCTION check_and_increment_rate_limit(VARCHAR, VARCHAR, INT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION check_and_increment_rate_limit(VARCHAR, VARCHAR, INT, INT) TO service_role;

REVOKE ALL ON FUNCTION record_otp_challenge(VARCHAR, VARCHAR, VARCHAR, VARCHAR, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION record_otp_challenge(VARCHAR, VARCHAR, VARCHAR, VARCHAR, INT) TO service_role;

REVOKE ALL ON FUNCTION verify_challenge_and_approve(UUID, VARCHAR, VARCHAR, VARCHAR, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION verify_challenge_and_approve(UUID, VARCHAR, VARCHAR, VARCHAR, INT) TO service_role;

REVOKE ALL ON FUNCTION consume_registration_approval(VARCHAR, VARCHAR, VARCHAR) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION consume_registration_approval(VARCHAR, VARCHAR, VARCHAR) TO service_role;

REVOKE ALL ON FUNCTION cleanup_expired_otp_records() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_otp_records() TO service_role;
