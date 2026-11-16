-- ============================================================================
-- MAHAJOBS: MAHARASHTRA JOB PORTAL
-- PostgreSQL Database Migration: 002_seed_data.sql
-- Seed all 36 Maharashtra Districts, Categories, and Subscription Plans
-- ============================================================================

-- Seed State
INSERT INTO states (code, name, is_active)
VALUES ('MH', 'Maharashtra', TRUE)
ON CONFLICT (code) DO NOTHING;

-- Seed 36 Maharashtra Districts
DO $$
DECLARE
    state_uuid UUID;
BEGIN
    SELECT id INTO state_uuid FROM states WHERE code = 'MH' LIMIT 1;

    INSERT INTO districts (state_id, name, marathi_name, division, headquarters) VALUES
    (state_uuid, 'Pune', 'पुणे', 'Pune', 'Pune'),
    (state_uuid, 'Mumbai City', 'मुंबई शहर', 'Konkan', 'Mumbai'),
    (state_uuid, 'Mumbai Suburban', 'मुंबई उपनगर', 'Konkan', 'Bandra'),
    (state_uuid, 'Nagpur', 'नागपूर', 'Nagpur', 'Nagpur'),
    (state_uuid, 'Thane', 'ठाणे', 'Konkan', 'Thane'),
    (state_uuid, 'Nashik', 'नाशिक', 'Nashik', 'Nashik'),
    (state_uuid, 'Kolhapur', 'कोल्हापूर', 'Pune', 'Kolhapur'),
    (state_uuid, 'Chhatrapati Sambhajinagar', 'छत्रपती संभाजीनगर', 'Chhatrapati Sambhajinagar', 'Chhatrapati Sambhajinagar'),
    (state_uuid, 'Solapur', 'सोलापूर', 'Pune', 'Solapur'),
    (state_uuid, 'Satara', 'सातारा', 'Pune', 'Satara'),
    (state_uuid, 'Sangli', 'सांगली', 'Pune', 'Sangli'),
    (state_uuid, 'Amravati', 'अमरावती', 'Amravati', 'Amravati'),
    (state_uuid, 'Ahilyanagar', 'अहिल्यानगर', 'Nashik', 'Ahilyanagar'),
    (state_uuid, 'Akola', 'अकोला', 'Amravati', 'Akola'),
    (state_uuid, 'Beed', 'बीड', 'Chhatrapati Sambhajinagar', 'Beed'),
    (state_uuid, 'Bhandara', 'भंडारा', 'Nagpur', 'Bhandara'),
    (state_uuid, 'Buldhana', 'बुलढाणा', 'Amravati', 'Buldhana'),
    (state_uuid, 'Chandrapur', 'चंद्रपूर', 'Nagpur', 'Chandrapur'),
    (state_uuid, 'Dhule', 'धुळे', 'Nashik', 'Dhule'),
    (state_uuid, 'Gadchiroli', 'गडचिरोली', 'Nagpur', 'Gadchiroli'),
    (state_uuid, 'Gondia', 'गोंदिया', 'Nagpur', 'Gondia'),
    (state_uuid, 'Hingoli', 'हिंगोली', 'Chhatrapati Sambhajinagar', 'Hingoli'),
    (state_uuid, 'Jalgaon', 'जळगाव', 'Nashik', 'Jalgaon'),
    (state_uuid, 'Jalna', 'जालना', 'Chhatrapati Sambhajinagar', 'Jalna'),
    (state_uuid, 'Latur', 'लातूर', 'Chhatrapati Sambhajinagar', 'Latur'),
    (state_uuid, 'Nanded', 'नांदेड', 'Chhatrapati Sambhajinagar', 'Nanded'),
    (state_uuid, 'Nandurbar', 'नंदुरबार', 'Nashik', 'Nandurbar'),
    (state_uuid, 'Dharashiv', 'धाराशिव', 'Chhatrapati Sambhajinagar', 'Dharashiv'),
    (state_uuid, 'Palghar', 'पालघर', 'Konkan', 'Palghar'),
    (state_uuid, 'Parbhani', 'परभणी', 'Chhatrapati Sambhajinagar', 'Parbhani'),
    (state_uuid, 'Raigad', 'रायगड', 'Konkan', 'Alibag'),
    (state_uuid, 'Ratnagiri', 'रत्नागिरी', 'Konkan', 'Ratnagiri'),
    (state_uuid, 'Sindhudurg', 'सिंधुदुर्ग', 'Konkan', 'Oros'),
    (state_uuid, 'Wardha', 'वर्धा', 'Nagpur', 'Wardha'),
    (state_uuid, 'Washim', 'वाशिम', 'Amravati', 'Washim'),
    (state_uuid, 'Yavatmal', 'यवतमाळ', 'Amravati', 'Yavatmal');
END $$;

-- Seed Subscription Plans
INSERT INTO subscription_plans (code, name, price, job_posting_limit, validity_days, description, features, is_popular, is_active, candidate_search_allowed)
VALUES
('FREE', 'Free Starter', 0, 1, 15, 'Single vacancy trial for local MSMEs', '["1 Active Job Vacancy", "15 Days Listing Duration", "Standard Listing Visibility"]'::jsonb, FALSE, TRUE, FALSE),
('BASIC', 'Basic Growth', 499, 3, 30, 'Great for growing local businesses and shops', '["3 Active Job Vacancies", "30 Days Job Validity", "Application Management & Resume Downloads"]'::jsonb, FALSE, TRUE, FALSE),
('STANDARD', 'Standard Business', 999, 10, 30, 'Most popular for mid-sized manufacturers & firms', '["10 Active Job Vacancies", "30 Days Job Validity", "Candidate Database Search", "Priority Job Approval"]'::jsonb, TRUE, TRUE, TRUE),
('PREMIUM', 'Premium Enterprise', 1999, 25, 30, 'Complete recruitment power across Maharashtra', '["25 Active Job Vacancies", "30 Days Job Validity", "Full Candidate Database Access", "1 Free Featured Job"]'::jsonb, FALSE, TRUE, TRUE);

-- Seed Featured Plans
INSERT INTO featured_job_plans (days, price, label, description)
VALUES
(7, 199, '7 Days Highlight', 'Top of category and district search for 1 week'),
(15, 399, '15 Days Booster', 'Homepage featured badge + top search placement'),
(30, 699, '30 Days Spotlight', 'Maximum prominence with featured ribbon across Maharashtra');
