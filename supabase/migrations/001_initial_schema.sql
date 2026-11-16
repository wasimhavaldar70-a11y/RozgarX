-- ============================================================================
-- MAHAJOBS: MAHARASHTRA JOB PORTAL
-- PostgreSQL Database Migration: 001_initial_schema.sql
-- Production schema with 35 tables, constraints, indexes, triggers, and RLS.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'employer', 'candidate')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER ROLES
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    granted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. STATES
CREATE TABLE IF NOT EXISTS states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DISTRICTS (36 Maharashtra districts)
CREATE TABLE IF NOT EXISTS districts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    state_id UUID REFERENCES states(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    marathi_name VARCHAR(100),
    division VARCHAR(100) NOT NULL,
    headquarters VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TALUKAS
CREATE TABLE IF NOT EXISTS talukas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CITIES
CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
    taluka_id UUID REFERENCES talukas(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    pincode VARCHAR(10),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CANDIDATES
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    dob DATE,
    gender VARCHAR(20),
    address TEXT,
    district VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    pincode VARCHAR(10),
    is_discoverable BOOLEAN DEFAULT TRUE,
    is_suspended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CANDIDATE EDUCATION
CREATE TABLE IF NOT EXISTS candidate_education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    highest_qualification VARCHAR(100) NOT NULL,
    degree_name VARCHAR(150),
    institute VARCHAR(255),
    passing_year VARCHAR(10),
    percentage_cgpa VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CANDIDATE EXPERIENCE
CREATE TABLE IF NOT EXISTS candidate_experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    is_fresher BOOLEAN DEFAULT TRUE,
    current_company VARCHAR(255),
    designation VARCHAR(150),
    total_experience_years NUMERIC(4, 1) DEFAULT 0,
    current_salary NUMERIC(12, 2),
    expected_salary NUMERIC(12, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. CANDIDATE SKILLS
CREATE TABLE IF NOT EXISTS candidate_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. CANDIDATE RESUMES
CREATE TABLE IF NOT EXISTS candidate_resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size_bytes BIGINT,
    summary TEXT,
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. EMPLOYERS
CREATE TABLE IF NOT EXISTS employers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    contact_person VARCHAR(255) NOT NULL,
    business_email VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. COMPANIES
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    tagline VARCHAR(255),
    about TEXT,
    industry VARCHAR(100) NOT NULL,
    company_type VARCHAR(100) NOT NULL,
    company_size VARCHAR(50),
    district VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    address TEXT,
    pincode VARCHAR(10),
    website TEXT,
    logo_url TEXT,
    verification_status VARCHAR(50) DEFAULT 'Pending' CHECK (verification_status IN ('Pending', 'Verified', 'Rejected', 'Suspended')),
    verification_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. EMPLOYER DOCUMENTS
CREATE TABLE IF NOT EXISTS employer_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    document_url TEXT NOT NULL,
    verification_status VARCHAR(50) DEFAULT 'Pending',
    verified_by UUID,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. JOB CATEGORIES
CREATE TABLE IF NOT EXISTS job_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    marathi_name VARCHAR(100),
    description TEXT,
    icon_name VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. JOBS
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    responsibilities JSONB DEFAULT '[]'::jsonb,
    required_skills JSONB DEFAULT '[]'::jsonb,
    education_requirement VARCHAR(255),
    experience_min_years INT DEFAULT 0,
    experience_max_years INT DEFAULT 0,
    salary_min NUMERIC(12, 2) NOT NULL,
    salary_max NUMERIC(12, 2) NOT NULL,
    salary_type VARCHAR(50) DEFAULT 'Per Month',
    vacancies INT DEFAULT 1,
    job_type VARCHAR(50) NOT NULL,
    work_mode VARCHAR(50) NOT NULL,
    district VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    address TEXT,
    application_deadline DATE,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paused', 'closed', 'expired')),
    rejection_reason TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    featured_until TIMESTAMPTZ,
    view_count INT DEFAULT 0,
    application_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. JOB APPLICATIONS
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    resume_url TEXT,
    cover_message TEXT,
    status VARCHAR(50) DEFAULT 'Applied' CHECK (status IN ('Applied', 'Viewed', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected', 'Withdrawn')),
    interview_date DATE,
    interview_time VARCHAR(50),
    interview_location TEXT,
    internal_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (job_id, candidate_id)
);

-- 18. APPLICATION STATUS HISTORY
CREATE TABLE IF NOT EXISTS application_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES job_applications(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    changed_by UUID,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. SAVED JOBS
CREATE TABLE IF NOT EXISTS saved_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (candidate_id, job_id)
);

-- 20. JOB ALERTS
CREATE TABLE IF NOT EXISTS job_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    keyword VARCHAR(255),
    district VARCHAR(100),
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. SUBSCRIPTION PLANS
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    job_posting_limit INT NOT NULL,
    validity_days INT NOT NULL,
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    candidate_search_allowed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. EMPLOYER SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS employer_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans(id),
    total_credits INT NOT NULL,
    used_credits INT DEFAULT 0,
    remaining_credits INT NOT NULL,
    start_date TIMESTAMPTZ DEFAULT NOW(),
    expiry_date TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. JOB CREDITS
CREATE TABLE IF NOT EXISTS job_credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
    available_credits INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. CREDIT TRANSACTIONS
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    credits_delta INT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 25. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans(id),
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    order_id VARCHAR(100) UNIQUE NOT NULL,
    payment_id VARCHAR(100) UNIQUE,
    signature TEXT,
    status VARCHAR(50) DEFAULT 'Created' CHECK (status IN ('Created', 'Pending', 'Successful', 'Failed', 'Refunded')),
    payment_method VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 26. PAYMENT WEBHOOK EVENTS
CREATE TABLE IF NOT EXISTS payment_webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id VARCHAR(150) UNIQUE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 27. FEATURED JOB PLANS
CREATE TABLE IF NOT EXISTS featured_job_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    days INT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    label VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- 28. FEATURED JOBS
CREATE TABLE IF NOT EXISTS featured_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ NOT NULL,
    amount_paid NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 29. ADVERTISEMENTS
CREATE TABLE IF NOT EXISTS advertisements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    banner_url TEXT NOT NULL,
    target_url TEXT NOT NULL,
    placement VARCHAR(50) DEFAULT 'job_listing',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    clicks INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 30. RECRUITMENT REQUESTS
CREATE TABLE IF NOT EXISTS recruitment_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    job_role VARCHAR(255) NOT NULL,
    required_employees INT NOT NULL,
    location VARCHAR(255) NOT NULL,
    required_skills JSONB DEFAULT '[]'::jsonb,
    budget VARCHAR(100),
    additional_details TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 31. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    role VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 32. SUPPORT TICKETS
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 33. REPORTS
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID,
    target_type VARCHAR(50) NOT NULL,
    target_id UUID NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 34. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID,
    admin_name VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(100) NOT NULL,
    target_id VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 35. WEBSITE SETTINGS
CREATE TABLE IF NOT EXISTS website_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_name VARCHAR(150) NOT NULL DEFAULT 'MahaJobs',
    logo_text VARCHAR(150) NOT NULL DEFAULT 'MahaJobs',
    tagline TEXT DEFAULT 'Connecting Maharashtra with Quality Employment',
    contact_email VARCHAR(255) DEFAULT 'support@mahajobs.gov.in',
    contact_phone VARCHAR(50) DEFAULT '+91 22 2202 5555',
    default_currency VARCHAR(20) DEFAULT 'INR (₹)',
    default_language VARCHAR(10) DEFAULT 'en',
    maintenance_mode BOOLEAN DEFAULT FALSE,
    job_posting_expiry_days INT DEFAULT 30,
    allowed_free_posts_per_employer INT DEFAULT 1,
    razorpay_test_mode BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_jobs_district ON jobs(district);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_is_featured ON jobs(is_featured);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON job_applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_companies_district ON companies(district);
CREATE INDEX IF NOT EXISTS idx_companies_verification ON companies(verification_status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Public can view approved active jobs
CREATE POLICY public_can_view_approved_jobs ON jobs
    FOR SELECT USING (status = 'approved');

-- Employers can manage their own jobs
CREATE POLICY employers_manage_own_jobs ON jobs
    FOR ALL USING (auth.uid() = employer_id);

-- Candidates can view and submit their own applications
CREATE POLICY candidates_view_own_applications ON job_applications
    FOR SELECT USING (auth.uid() = candidate_id);

-- Candidates can create applications
CREATE POLICY candidates_insert_application ON job_applications
    FOR INSERT WITH CHECK (auth.uid() = candidate_id);

-- Employers can view applications for their posted jobs
CREATE POLICY employers_view_received_applications ON job_applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM jobs WHERE jobs.id = job_applications.job_id AND jobs.employer_id = auth.uid()
        )
    );
