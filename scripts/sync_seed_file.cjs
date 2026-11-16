const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function syncSeedFile() {
  const client = new Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
  await client.connect();

  const companiesRes = await client.query("SELECT * FROM companies ORDER BY name;");
  const jobsRes = await client.query("SELECT j.*, c.name as company_name, c.logo_url as company_logo FROM jobs j JOIN companies c ON c.id = j.company_id WHERE j.status = 'approved' ORDER BY j.title;");
  const candRes = await client.query("SELECT * FROM candidates WHERE is_discoverable = true ORDER BY full_name;");
  const candSkillsRes = await client.query("SELECT * FROM candidate_skills;");

  const skillsByCand = new Map();
  for (const s of candSkillsRes.rows) {
    if (!skillsByCand.has(s.candidate_id)) {
      skillsByCand.set(s.candidate_id, []);
    }
    skillsByCand.get(s.candidate_id).push(s.skill_name);
  }

  const companies = companiesRes.rows.map(c => ({
    id: c.id,
    employerId: c.employer_id,
    name: c.name,
    tagline: c.tagline || '',
    logoUrl: c.logo_url || 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=200&q=80',
    about: c.about || '',
    industry: c.industry,
    companyType: c.company_type || 'Private Limited',
    companySize: c.company_size || '51-200',
    district: c.district,
    city: c.city || c.district,
    address: c.address || '',
    pincode: c.pincode || '411001',
    website: c.website || '',
    contactEmail: c.contact_email || 'contact@example.com',
    contactPhone: c.contact_phone || '+91 20 2202 0000',
    verificationStatus: c.verification_status,
    createdAt: c.created_at,
    updatedAt: c.updated_at
  }));

  const jobs = jobsRes.rows.map(j => ({
    id: j.id,
    employerId: j.employer_id,
    companyId: j.company_id,
    companyName: j.company_name,
    companyLogo: j.company_logo,
    companyVerified: true,
    title: j.title,
    category: j.category,
    description: j.description,
    responsibilities: j.responsibilities || [
      'Execute core operational duties aligned with industry standards',
      'Collaborate across cross-functional regional teams in Maharashtra',
      'Ensure prompt adherence to safety, quality, and statutory compliance'
    ],
    requiredSkills: Array.isArray(j.required_skills) ? j.required_skills : (typeof j.required_skills === 'string' ? JSON.parse(j.required_skills) : ['Technical Aptitude']),
    educationRequirement: j.education_requirement,
    experienceMinYears: j.experience_min_years,
    experienceMaxYears: j.experience_max_years,
    salaryMin: Number(j.salary_min),
    salaryMax: Number(j.salary_max),
    salaryType: j.salary_type || 'Per Annum',
    vacancies: j.vacancies || 2,
    jobType: j.job_type,
    workMode: j.work_mode === 'On-site' ? 'Office' : (j.work_mode || 'Office'),
    district: j.district,
    city: j.city,
    address: j.address,
    applicationDeadline: j.application_deadline ? new Date(j.application_deadline).toISOString().split('T')[0] : '2026-12-31',
    contactEmail: j.contact_email || 'careers@mahajobs.gov.in',
    contactPhone: j.contact_phone || '+91 22 2202 5555',
    status: j.status,
    isFeatured: j.is_featured || false,
    viewCount: j.view_count || 120,
    applicationCount: j.application_count || 0,
    createdAt: j.created_at,
    updatedAt: j.updated_at
  }));

  const candidates = candRes.rows.map(c => ({
    id: c.id,
    userId: c.profile_id || c.id,
    fullName: c.full_name,
    email: c.email,
    mobile: c.mobile,
    profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    dateOfBirth: c.dob ? new Date(c.dob).toISOString().split('T')[0] : '2000-01-01',
    gender: (c.gender === 'Female' ? 'Female' : (c.gender === 'Other' ? 'Other' : 'Male')),
    address: c.address,
    district: c.district,
    city: c.city || c.district,
    pincode: c.pincode || '411001',
    education: {
      id: `edu_${c.id}`,
      highestQualification: 'Graduate',
      degreeName: 'Bachelor Degree',
      institute: 'Maharashtra State University',
      passingYear: '2023',
      percentageOrCgpa: '8.2 CGPA'
    },
    experience: {
      id: `exp_${c.id}`,
      isFresher: false,
      totalExperienceYears: 2,
      expectedSalary: 450000
    },
    skills: skillsByCand.get(c.id) || ['Communication', 'Computer Literacy', 'Maharashtra Talent'],
    languagesKnown: ['Marathi', 'Hindi', 'English'],
    preferredJobRoles: ['Executive', 'Engineer', 'Specialist'],
    preferredDistricts: [c.district, 'Pune', 'Mumbai City'],
    isDiscoverable: c.is_discoverable,
    createdAt: c.created_at,
    updatedAt: c.updated_at
  }));

  const seedFileContent = `import {
  SubscriptionPlan,
  FeaturedJobPlan,
  Company,
  Job,
  CandidateProfile,
  Advertisement,
  WebsiteSettings
} from '../types';

export const INITIAL_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan_free',
    code: 'FREE',
    name: 'Free Starter',
    price: 0,
    jobPostingLimit: 1,
    validityDays: 15,
    description: 'Perfect for small shops or single vacancies in Maharashtra.',
    features: [
      '1 Active Job Vacancy',
      '15 Days Listing Duration',
      'Basic Candidate Application Management',
      'Email Notifications for Applications',
      'Standard Listing Visibility'
    ],
    isActive: true,
    candidateSearchAllowed: false
  },
  {
    id: 'plan_basic',
    code: 'BASIC',
    name: 'Basic Growth',
    price: 499,
    jobPostingLimit: 3,
    validityDays: 30,
    description: 'Great for growing local businesses and small manufacturers.',
    features: [
      '3 Active Job Vacancies',
      '30 Days Job Validity',
      'Application Management & Resume Downloads',
      'Direct WhatsApp & Email Alerts',
      'Company Profile Badge'
    ],
    isActive: true,
    candidateSearchAllowed: false
  },
  {
    id: 'plan_standard',
    code: 'STANDARD',
    name: 'Standard Business',
    price: 999,
    jobPostingLimit: 10,
    validityDays: 30,
    description: 'Ideal for established mid-sized enterprises hiring frequently.',
    features: [
      '10 Active Job Vacancies',
      '30 Days Job Validity',
      'Candidate Database Search (Maharashtra Pool)',
      'Interview Scheduling & Candidate Tracking',
      'Priority Job Approval in 2 Hours',
      'Verified Employer Badge'
    ],
    isPopular: true,
    isActive: true,
    candidateSearchAllowed: true
  },
  {
    id: 'plan_premium',
    code: 'PREMIUM',
    name: 'Premium Enterprise',
    price: 1999,
    jobPostingLimit: 25,
    validityDays: 30,
    description: 'Complete recruitment power with top visibility across 36 districts.',
    features: [
      '25 Active Job Vacancies',
      '30 Days Job Validity',
      'Full Candidate Database Access',
      '1 Free Featured Job Placement (7 Days)',
      'Dedicated Account Manager Support',
      'Custom Screening Questions',
      'Top Employer Showcase on Homepage'
    ],
    isActive: true,
    candidateSearchAllowed: true
  }
];

export const INITIAL_FEATURED_PLANS: FeaturedJobPlan[] = [
  {
    id: 'feat_7',
    days: 7,
    price: 199,
    label: '7 Days Highlight',
    description: 'Top of category and district search for 1 week.'
  },
  {
    id: 'feat_15',
    days: 15,
    price: 399,
    label: '15 Days Booster',
    description: 'Homepage featured badge + top search placement for 2 weeks.'
  },
  {
    id: 'feat_30',
    days: 30,
    price: 699,
    label: '30 Days Spotlight',
    description: 'Maximum prominence, featured ribbon, highlighted card across Maharashtra.'
  }
];

export const INITIAL_COMPANIES: Company[] = ${JSON.stringify(companies, null, 2)};

export const INITIAL_JOBS: Job[] = ${JSON.stringify(jobs, null, 2)};

export const INITIAL_CANDIDATE: CandidateProfile | null = ${JSON.stringify(candidates[0] || null, null, 2)};

export const INITIAL_CANDIDATES: CandidateProfile[] = ${JSON.stringify(candidates, null, 2)};

export const INITIAL_ADVERTISEMENTS: Advertisement[] = [
  {
    id: 'ad_1',
    title: 'Maharashtra Industrial Skill Development Initiative',
    bannerUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
    targetUrl: 'https://mahajobs.gov.in',
    placement: 'header',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    isActive: true,
    clicks: 320,
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_WEBSITE_SETTINGS: WebsiteSettings = {
  siteName: 'MahaJobs',
  logoText: 'MahaJobs',
  tagline: 'Connecting Maharashtra with Quality Employment Opportunities',
  contactEmail: 'support@mahajobs.gov.in',
  contactPhone: '+91 22 2202 5555',
  defaultCurrency: 'INR (₹)',
  defaultLanguage: 'en',
  maintenanceMode: false,
  jobPostingExpiryDays: 30,
  allowedFreePostsPerEmployer: 1,
  razorpayTestMode: true,
  updatedAt: new Date().toISOString()
};
`;

  fs.writeFileSync(path.join(__dirname, '../src/data/seed.ts'), seedFileContent, 'utf8');
  console.log(`Successfully synced src/data/seed.ts with ${companies.length} companies, ${jobs.length} jobs, and ${candidates.length} candidates!`);

  await client.end();
}

syncSeedFile().catch(err => {
  console.error(err);
  process.exit(1);
});
