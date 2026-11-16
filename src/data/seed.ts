import {
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

export const INITIAL_COMPANIES: Company[] = [
  {
    id: 'comp_nakshatra_motors',
    employerId: 'emp_nakshatra',
    name: 'Nakshatra Motors',
    tagline: 'Leading Automobile Dealership & Service Network in Western Maharashtra',
    logoUrl: '/assets/jobs/nakshatra_logo.png',
    about: 'Nakshatra Motors is a premier automotive sales, servicing, and technical engineering center in Kolhapur, Maharashtra, delivering precision automotive care and authorized service excellence.',
    industry: 'Automotive',
    companyType: 'Private Limited',
    companySize: '51-200 Employees',
    district: 'Kolhapur',
    city: 'Kolhapur',
    address: 'Kolhapur, Maharashtra',
    pincode: '416001',
    website: 'https://nakshatramotors.com',
    contactEmail: 'careers@nakshatramotors.com',
    contactPhone: '+91 98220 54321',
    verificationStatus: 'Verified',
    createdAt: '2026-11-01T00:00:00.000Z',
    updatedAt: '2026-11-16T00:00:00.000Z'
  }
];

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job_nakshatra_senior_mechanical',
    employerId: 'emp_nakshatra',
    companyId: 'comp_nakshatra_motors',
    companyName: 'Nakshatra Motors',
    companyLogo: '/assets/jobs/nakshatra_logo.png',
    companyVerified: true,
    title: 'Senior Mechanical',
    category: 'Automotive',
    description: 'Senior Mechanical Engineer / Master Automotive Technician responsible for multi-point vehicle diagnostics, engine repairs, precision component alignment, and leading junior service technicians.',
    responsibilities: [
      'Perform detailed mechanical diagnostics using state-of-the-art diagnostic OBD equipment',
      'Overhaul engines, transmissions, braking systems, and electronic vehicle components',
      'Oversee vehicle service workflows and perform pre-delivery quality checks',
      'Consult with vehicle owners regarding technical estimates, service requirements, and maintenance schedules'
    ],
    requiredSkills: ['Problem Solving', 'Communication', 'Customer Handling'],
    educationRequirement: 'B.E. / B.Tech (Engineering)',
    experienceMinYears: 1,
    experienceMaxYears: 5,
    salaryMin: 25000,
    salaryMax: 45000,
    salaryType: 'Per Month',
    jobType: 'Full Time',
    workMode: 'Office',
    district: 'Kolhapur',
    city: 'Kolhapur',
    address: 'Kolhapur, Maharashtra',
    vacancies: 2,
    contactEmail: 'careers@nakshatramotors.com',
    contactPhone: '+91 98220 54321',
    status: 'approved',
    isFeatured: true,
    isUrgent: true,
    viewCount: 48,
    applicationCount: 12,
    applicationDeadline: '2026-11-30',
    createdAt: '2026-11-14T09:00:00.000Z',
    updatedAt: '2026-11-16T08:00:00.000Z'
  }
];

export const INITIAL_CANDIDATES: CandidateProfile[] = [
  {
    "id": "af04df57-3171-449d-9922-99797e75ef5c",
    "userId": "9c6cb603-e768-414a-92c4-1cc405c2f72c",
    "fullName": "Amit Deshmukh",
    "email": "amit.deshmukh@gmail.com",
    "mobile": "+91 98221 11201",
    "profilePhoto": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    "dateOfBirth": "2000-01-01",
    "gender": "Male",
    "address": "Kolhapur, Kolhapur, Maharashtra",
    "district": "Kolhapur",
    "city": "Kolhapur",
    "pincode": "411001",
    "education": {
      "id": "edu_af04df57-3171-449d-9922-99797e75ef5c",
      "highestQualification": "Graduate",
      "degreeName": "Bachelor Degree",
      "institute": "Maharashtra State University",
      "passingYear": "2023",
      "percentageOrCgpa": "8.2 CGPA"
    },
    "experience": {
      "id": "exp_af04df57-3171-449d-9922-99797e75ef5c",
      "isFresher": false,
      "totalExperienceYears": 2,
      "expectedSalary": 450000
    },
    "skills": [
      "Communication",
      "Computer Literacy",
      "Maharashtra Talent"
    ],
    "languagesKnown": [
      "Marathi",
      "Hindi",
      "English"
    ],
    "preferredJobRoles": [
      "Executive",
      "Engineer",
      "Specialist"
    ],
    "preferredDistricts": [
      "Kolhapur",
      "Pune",
      "Mumbai City"
    ],
    "isDiscoverable": true,
    "createdAt": "2026-11-14T14:17:34.639Z",
    "updatedAt": "2026-11-14T14:17:34.639Z"
  },
  {
    "id": "9f7fc180-764e-437b-a024-96bdcfa38cdd",
    "userId": "9c6cb603-e768-414a-92c4-1cc405c2f72c",
    "fullName": "Aniket More",
    "email": "aniket.more@gmail.com",
    "mobile": "+91 98226 66706",
    "profilePhoto": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    "dateOfBirth": "2000-01-01",
    "gender": "Male",
    "address": "Solapur, Solapur, Maharashtra",
    "district": "Solapur",
    "city": "Solapur",
    "pincode": "411001",
    "education": {
      "id": "edu_9f7fc180-764e-437b-a024-96bdcfa38cdd",
      "highestQualification": "Graduate",
      "degreeName": "Bachelor Degree",
      "institute": "Maharashtra State University",
      "passingYear": "2023",
      "percentageOrCgpa": "8.2 CGPA"
    },
    "experience": {
      "id": "exp_9f7fc180-764e-437b-a024-96bdcfa38cdd",
      "isFresher": false,
      "totalExperienceYears": 2,
      "expectedSalary": 450000
    },
    "skills": [
      "Textile Production",
      "Loom Operations",
      "Machine Maintenance",
      "Yarn Testing"
    ],
    "languagesKnown": [
      "Marathi",
      "Hindi",
      "English"
    ],
    "preferredJobRoles": [
      "Executive",
      "Engineer",
      "Specialist"
    ],
    "preferredDistricts": [
      "Solapur",
      "Pune",
      "Mumbai City"
    ],
    "isDiscoverable": true,
    "createdAt": "2026-11-14T14:20:08.443Z",
    "updatedAt": "2026-11-14T14:20:08.443Z"
  },
  {
    "id": "150b9943-1e61-4bf6-b006-6acdf7b017de",
    "userId": "9c6cb603-e768-414a-92c4-1cc405c2f72c",
    "fullName": "Deepika Waghmare",
    "email": "deepika.waghmare@gmail.com",
    "mobile": "+91 98229 99009",
    "profilePhoto": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    "dateOfBirth": "2000-01-01",
    "gender": "Male",
    "address": "Amravati, Amravati, Maharashtra",
    "district": "Amravati",
    "city": "Amravati",
    "pincode": "411001",
    "education": {
      "id": "edu_150b9943-1e61-4bf6-b006-6acdf7b017de",
      "highestQualification": "Graduate",
      "degreeName": "Bachelor Degree",
      "institute": "Maharashtra State University",
      "passingYear": "2023",
      "percentageOrCgpa": "8.2 CGPA"
    },
    "experience": {
      "id": "exp_150b9943-1e61-4bf6-b006-6acdf7b017de",
      "isFresher": false,
      "totalExperienceYears": 2,
      "expectedSalary": 450000
    },
    "skills": [
      "Agri-Finance",
      "Field Operations",
      "Farmer Relationship",
      "Documentation",
      "Credit Appraisal"
    ],
    "languagesKnown": [
      "Marathi",
      "Hindi",
      "English"
    ],
    "preferredJobRoles": [
      "Executive",
      "Engineer",
      "Specialist"
    ],
    "preferredDistricts": [
      "Amravati",
      "Pune",
      "Mumbai City"
    ],
    "isDiscoverable": true,
    "createdAt": "2026-11-14T14:20:10.048Z",
    "updatedAt": "2026-11-14T14:20:10.048Z"
  },
  {
    "id": "0dd3822d-3140-400f-8803-73ab61971ab0",
    "userId": "9c6cb603-e768-414a-92c4-1cc405c2f72c",
    "fullName": "Girish Kadam",
    "email": "girish.kadam@gmail.com",
    "mobile": "+91 98231 11211",
    "profilePhoto": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    "dateOfBirth": "2000-01-01",
    "gender": "Male",
    "address": "Satara, Satara, Maharashtra",
    "district": "Satara",
    "city": "Satara",
    "pincode": "411001",
    "education": {
      "id": "edu_0dd3822d-3140-400f-8803-73ab61971ab0",
      "highestQualification": "Graduate",
      "degreeName": "Bachelor Degree",
      "institute": "Maharashtra State University",
      "passingYear": "2023",
      "percentageOrCgpa": "8.2 CGPA"
    },
    "experience": {
      "id": "exp_0dd3822d-3140-400f-8803-73ab61971ab0",
      "isFresher": false,
      "totalExperienceYears": 2,
      "expectedSalary": 450000
    },
    "skills": [
      "CNC Milling",
      "VMC",
      "G-Code Programming",
      "Micrometer"
    ],
    "languagesKnown": [
      "Marathi",
      "Hindi",
      "English"
    ],
    "preferredJobRoles": [
      "Executive",
      "Engineer",
      "Specialist"
    ],
    "preferredDistricts": [
      "Satara",
      "Pune",
      "Mumbai City"
    ],
    "isDiscoverable": true,
    "createdAt": "2026-11-14T14:20:10.853Z",
    "updatedAt": "2026-11-14T14:20:10.853Z"
  },
  {
    "id": "2688ba43-1f7b-4a77-a30e-e4fc2070843f",
    "userId": "9c6cb603-e768-414a-92c4-1cc405c2f72c",
    "fullName": "Manish Rathi",
    "email": "manish.rathi@gmail.com",
    "mobile": "+91 98232 22312",
    "profilePhoto": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    "dateOfBirth": "2000-01-01",
    "gender": "Male",
    "address": "Akola, Akola, Maharashtra",
    "district": "Akola",
    "city": "Akola",
    "pincode": "411001",
    "education": {
      "id": "edu_2688ba43-1f7b-4a77-a30e-e4fc2070843f",
      "highestQualification": "Graduate",
      "degreeName": "Bachelor Degree",
      "institute": "Maharashtra State University",
      "passingYear": "2023",
      "percentageOrCgpa": "8.2 CGPA"
    },
    "experience": {
      "id": "exp_2688ba43-1f7b-4a77-a30e-e4fc2070843f",
      "isFresher": false,
      "totalExperienceYears": 2,
      "expectedSalary": 450000
    },
    "skills": [
      "Field Sales",
      "Dealer Network",
      "B2B Sales",
      "Agronomy"
    ],
    "languagesKnown": [
      "Marathi",
      "Hindi",
      "English"
    ],
    "preferredJobRoles": [
      "Executive",
      "Engineer",
      "Specialist"
    ],
    "preferredDistricts": [
      "Akola",
      "Pune",
      "Mumbai City"
    ],
    "isDiscoverable": true,
    "createdAt": "2026-11-14T14:20:11.243Z",
    "updatedAt": "2026-11-14T14:20:11.243Z"
  },
  {
    "id": "70e50265-c259-47e0-976d-8f7670b48e6b",
    "userId": "9c6cb603-e768-414a-92c4-1cc405c2f72c",
    "fullName": "Neha Sawant",
    "email": "neha.sawant@gmail.com",
    "mobile": "+91 98227 77807",
    "profilePhoto": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    "dateOfBirth": "2000-01-01",
    "gender": "Male",
    "address": "Ratnagiri, Ratnagiri, Maharashtra",
    "district": "Ratnagiri",
    "city": "Ratnagiri",
    "pincode": "411001",
    "education": {
      "id": "edu_70e50265-c259-47e0-976d-8f7670b48e6b",
      "highestQualification": "Graduate",
      "degreeName": "Bachelor Degree",
      "institute": "Maharashtra State University",
      "passingYear": "2023",
      "percentageOrCgpa": "8.2 CGPA"
    },
    "experience": {
      "id": "exp_70e50265-c259-47e0-976d-8f7670b48e6b",
      "isFresher": false,
      "totalExperienceYears": 2,
      "expectedSalary": 450000
    },
    "skills": [
      "Food Safety",
      "HACCP",
      "Cold Chain Logistics",
      "Quality Control",
      "ISO 22000"
    ],
    "languagesKnown": [
      "Marathi",
      "Hindi",
      "English"
    ],
    "preferredJobRoles": [
      "Executive",
      "Engineer",
      "Specialist"
    ],
    "preferredDistricts": [
      "Ratnagiri",
      "Pune",
      "Mumbai City"
    ],
    "isDiscoverable": true,
    "createdAt": "2026-11-14T14:20:08.834Z",
    "updatedAt": "2026-11-14T14:20:08.834Z"
  },
  {
    "id": "ba4ffa8b-e962-45d2-88d1-10c47305ea8f",
    "userId": "9c6cb603-e768-414a-92c4-1cc405c2f72c",
    "fullName": "Pooja Kulkarni",
    "email": "pooja.kulkarni@gmail.com",
    "mobile": "+91 98222 22302",
    "profilePhoto": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    "dateOfBirth": "2000-01-01",
    "gender": "Male",
    "address": "Nashik, Nashik, Maharashtra",
    "district": "Nashik",
    "city": "Nashik",
    "pincode": "411001",
    "education": {
      "id": "edu_ba4ffa8b-e962-45d2-88d1-10c47305ea8f",
      "highestQualification": "Graduate",
      "degreeName": "Bachelor Degree",
      "institute": "Maharashtra State University",
      "passingYear": "2023",
      "percentageOrCgpa": "8.2 CGPA"
    },
    "experience": {
      "id": "exp_ba4ffa8b-e962-45d2-88d1-10c47305ea8f",
      "isFresher": false,
      "totalExperienceYears": 2,
      "expectedSalary": 450000
    },
    "skills": [
      "Communication",
      "Computer Literacy",
      "Maharashtra Talent"
    ],
    "languagesKnown": [
      "Marathi",
      "Hindi",
      "English"
    ],
    "preferredJobRoles": [
      "Executive",
      "Engineer",
      "Specialist"
    ],
    "preferredDistricts": [
      "Nashik",
      "Pune",
      "Mumbai City"
    ],
    "isDiscoverable": true,
    "createdAt": "2026-11-14T14:18:26.208Z",
    "updatedAt": "2026-11-14T14:18:26.208Z"
  },
  {
    "id": "80e1f317-3f8f-42f0-9963-247dc41f5ae0",
    "userId": "9c6cb603-e768-414a-92c4-1cc405c2f72c",
    "fullName": "Prasad Chougule",
    "email": "prasad.chougule@gmail.com",
    "mobile": "+91 98230 00110",
    "profilePhoto": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    "dateOfBirth": "2000-01-01",
    "gender": "Male",
    "address": "Sangli, Sangli, Maharashtra",
    "district": "Sangli",
    "city": "Sangli",
    "pincode": "411001",
    "education": {
      "id": "edu_80e1f317-3f8f-42f0-9963-247dc41f5ae0",
      "highestQualification": "Graduate",
      "degreeName": "Bachelor Degree",
      "institute": "Maharashtra State University",
      "passingYear": "2023",
      "percentageOrCgpa": "8.2 CGPA"
    },
    "experience": {
      "id": "exp_80e1f317-3f8f-42f0-9963-247dc41f5ae0",
      "isFresher": false,
      "totalExperienceYears": 2,
      "expectedSalary": 450000
    },
    "skills": [
      "Chemical Analysis",
      "Moisture Testing",
      "Cold Storage QC",
      "HACCP"
    ],
    "languagesKnown": [
      "Marathi",
      "Hindi",
      "English"
    ],
    "preferredJobRoles": [
      "Executive",
      "Engineer",
      "Specialist"
    ],
    "preferredDistricts": [
      "Sangli",
      "Pune",
      "Mumbai City"
    ],
    "isDiscoverable": true,
    "createdAt": "2026-11-14T14:20:10.464Z",
    "updatedAt": "2026-11-14T14:20:10.464Z"
  },
  {
    "id": "fc0485c4-592a-41bd-8779-2af83e11648a",
    "userId": "9c6cb603-e768-414a-92c4-1cc405c2f72c",
    "fullName": "Rahul Jadhav",
    "email": "rahul.jadhav@gmail.com",
    "mobile": "+91 98223 33403",
    "profilePhoto": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    "dateOfBirth": "2000-01-01",
    "gender": "Male",
    "address": "Chhatrapati Sambhajinagar, Chhatrapati Sambhajinagar, Maharashtra",
    "district": "Chhatrapati Sambhajinagar",
    "city": "Chhatrapati Sambhajinagar",
    "pincode": "411001",
    "education": {
      "id": "edu_fc0485c4-592a-41bd-8779-2af83e11648a",
      "highestQualification": "Graduate",
      "degreeName": "Bachelor Degree",
      "institute": "Maharashtra State University",
      "passingYear": "2023",
      "percentageOrCgpa": "8.2 CGPA"
    },
    "experience": {
      "id": "exp_fc0485c4-592a-41bd-8779-2af83e11648a",
      "isFresher": false,
      "totalExperienceYears": 2,
      "expectedSalary": 450000
    },
    "skills": [
      "PLC Programming",
      "SCADA",
      "Instrumentation",
      "Calibration",
      "Electronics"
    ],
    "languagesKnown": [
      "Marathi",
      "Hindi",
      "English"
    ],
    "preferredJobRoles": [
      "Executive",
      "Engineer",
      "Specialist"
    ],
    "preferredDistricts": [
      "Chhatrapati Sambhajinagar",
      "Pune",
      "Mumbai City"
    ],
    "isDiscoverable": true,
    "createdAt": "2026-11-14T14:20:07.008Z",
    "updatedAt": "2026-11-14T14:20:07.008Z"
  },
  {
    "id": "b8ef5e73-3c8e-41ed-a252-41b55d9e1cb2",
    "userId": "9c6cb603-e768-414a-92c4-1cc405c2f72c",
    "fullName": "Siddheshwar Joshi",
    "email": "siddheshwar.joshi@gmail.com",
    "mobile": "+91 98228 88908",
    "profilePhoto": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    "dateOfBirth": "2000-01-01",
    "gender": "Male",
    "address": "Nanded, Nanded, Maharashtra",
    "district": "Nanded",
    "city": "Nanded",
    "pincode": "411001",
    "education": {
      "id": "edu_b8ef5e73-3c8e-41ed-a252-41b55d9e1cb2",
      "highestQualification": "Graduate",
      "degreeName": "Bachelor Degree",
      "institute": "Maharashtra State University",
      "passingYear": "2023",
      "percentageOrCgpa": "8.2 CGPA"
    },
    "experience": {
      "id": "exp_b8ef5e73-3c8e-41ed-a252-41b55d9e1cb2",
      "isFresher": false,
      "totalExperienceYears": 2,
      "expectedSalary": 450000
    },
    "skills": [
      "Substation Maintenance",
      "HT/LT Lines",
      "Transformers",
      "Switchgear",
      "Electrical Safety"
    ],
    "languagesKnown": [
      "Marathi",
      "Hindi",
      "English"
    ],
    "preferredJobRoles": [
      "Executive",
      "Engineer",
      "Specialist"
    ],
    "preferredDistricts": [
      "Nanded",
      "Pune",
      "Mumbai City"
    ],
    "isDiscoverable": true,
    "createdAt": "2026-11-14T14:20:09.479Z",
    "updatedAt": "2026-11-14T14:20:09.479Z"
  },
  {
    "id": "fda48853-e641-4818-9e04-78510dafc4d2",
    "userId": "9c6cb603-e768-414a-92c4-1cc405c2f72c",
    "fullName": "Sneha Shinde",
    "email": "sneha.shinde@gmail.com",
    "mobile": "+91 98224 44504",
    "profilePhoto": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    "dateOfBirth": "2000-01-01",
    "gender": "Male",
    "address": "Nagpur, Nagpur, Maharashtra",
    "district": "Nagpur",
    "city": "Nagpur",
    "pincode": "411001",
    "education": {
      "id": "edu_fda48853-e641-4818-9e04-78510dafc4d2",
      "highestQualification": "Graduate",
      "degreeName": "Bachelor Degree",
      "institute": "Maharashtra State University",
      "passingYear": "2023",
      "percentageOrCgpa": "8.2 CGPA"
    },
    "experience": {
      "id": "exp_fda48853-e641-4818-9e04-78510dafc4d2",
      "isFresher": false,
      "totalExperienceYears": 2,
      "expectedSalary": 450000
    },
    "skills": [
      "AWS",
      "Kubernetes",
      "Docker",
      "Terraform",
      "Linux",
      "Python",
      "CI/CD"
    ],
    "languagesKnown": [
      "Marathi",
      "Hindi",
      "English"
    ],
    "preferredJobRoles": [
      "Executive",
      "Engineer",
      "Specialist"
    ],
    "preferredDistricts": [
      "Nagpur",
      "Pune",
      "Mumbai City"
    ],
    "isDiscoverable": true,
    "createdAt": "2026-11-14T14:20:07.438Z",
    "updatedAt": "2026-11-14T14:20:07.438Z"
  },
  {
    "id": "2c465aed-6dd5-426a-9f5a-6ff3cede5ed3",
    "userId": "9c6cb603-e768-414a-92c4-1cc405c2f72c",
    "fullName": "Suhani Patil",
    "email": "suhani06@gmail.com",
    "mobile": "+919822000006",
    "profilePhoto": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    "dateOfBirth": "2000-01-01",
    "gender": "Male",
    "address": "Kothrud, Pune, Maharashtra 411038",
    "district": "Pune",
    "city": "Pune",
    "pincode": "411001",
    "education": {
      "id": "edu_2c465aed-6dd5-426a-9f5a-6ff3cede5ed3",
      "highestQualification": "Graduate",
      "degreeName": "Bachelor Degree",
      "institute": "Maharashtra State University",
      "passingYear": "2023",
      "percentageOrCgpa": "8.2 CGPA"
    },
    "experience": {
      "id": "exp_2c465aed-6dd5-426a-9f5a-6ff3cede5ed3",
      "isFresher": false,
      "totalExperienceYears": 2,
      "expectedSalary": 450000
    },
    "skills": [
      "Communication",
      "Computer Literacy",
      "Maharashtra Talent"
    ],
    "languagesKnown": [
      "Marathi",
      "Hindi",
      "English"
    ],
    "preferredJobRoles": [
      "Executive",
      "Engineer",
      "Specialist"
    ],
    "preferredDistricts": [
      "Pune",
      "Pune",
      "Mumbai City"
    ],
    "isDiscoverable": true,
    "createdAt": "2026-11-14T04:44:07.293Z",
    "updatedAt": "2026-11-14T04:44:07.293Z"
  },
  {
    "id": "005c5104-b04c-4fdd-8784-cdf3e89bdb66",
    "userId": "9c6cb603-e768-414a-92c4-1cc405c2f72c",
    "fullName": "Suhani Patil",
    "email": "suhani06@gmail.com",
    "mobile": "+919822000006",
    "profilePhoto": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    "dateOfBirth": "2000-01-01",
    "gender": "Male",
    "address": "Kothrud, Pune, Maharashtra 411038",
    "district": "Pune",
    "city": "Pune",
    "pincode": "411001",
    "education": {
      "id": "edu_005c5104-b04c-4fdd-8784-cdf3e89bdb66",
      "highestQualification": "Graduate",
      "degreeName": "Bachelor Degree",
      "institute": "Maharashtra State University",
      "passingYear": "2023",
      "percentageOrCgpa": "8.2 CGPA"
    },
    "experience": {
      "id": "exp_005c5104-b04c-4fdd-8784-cdf3e89bdb66",
      "isFresher": false,
      "totalExperienceYears": 2,
      "expectedSalary": 450000
    },
    "skills": [
      "React",
      "TypeScript",
      "Node.js",
      "PostgreSQL",
      "Tailwind CSS",
      "Next.js"
    ],
    "languagesKnown": [
      "Marathi",
      "Hindi",
      "English"
    ],
    "preferredJobRoles": [
      "Executive",
      "Engineer",
      "Specialist"
    ],
    "preferredDistricts": [
      "Pune",
      "Pune",
      "Mumbai City"
    ],
    "isDiscoverable": true,
    "createdAt": "2026-11-14T04:46:18.644Z",
    "updatedAt": "2026-11-14T04:46:18.644Z"
  },
  {
    "id": "d50d4179-fccc-48b8-8e4c-5a4d0e507491",
    "userId": "9c6cb603-e768-414a-92c4-1cc405c2f72c",
    "fullName": "Suhani Patil",
    "email": "suhani06@gmail.com",
    "mobile": "+919822000006",
    "profilePhoto": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    "dateOfBirth": "2000-01-01",
    "gender": "Male",
    "address": "Kothrud, Pune, Maharashtra 411038",
    "district": "Pune",
    "city": "Pune",
    "pincode": "411001",
    "education": {
      "id": "edu_d50d4179-fccc-48b8-8e4c-5a4d0e507491",
      "highestQualification": "Graduate",
      "degreeName": "Bachelor Degree",
      "institute": "Maharashtra State University",
      "passingYear": "2023",
      "percentageOrCgpa": "8.2 CGPA"
    },
    "experience": {
      "id": "exp_d50d4179-fccc-48b8-8e4c-5a4d0e507491",
      "isFresher": false,
      "totalExperienceYears": 2,
      "expectedSalary": 450000
    },
    "skills": [
      "React",
      "TypeScript",
      "Node.js",
      "PostgreSQL",
      "Tailwind CSS",
      "Next.js"
    ],
    "languagesKnown": [
      "Marathi",
      "Hindi",
      "English"
    ],
    "preferredJobRoles": [
      "Executive",
      "Engineer",
      "Specialist"
    ],
    "preferredDistricts": [
      "Pune",
      "Pune",
      "Mumbai City"
    ],
    "isDiscoverable": true,
    "createdAt": "2026-11-14T04:53:18.478Z",
    "updatedAt": "2026-11-14T04:53:18.478Z"
  },
  {
    "id": "1ee28ad5-8c27-4bef-bd59-45042eb5b368",
    "userId": "9c6cb603-e768-414a-92c4-1cc405c2f72c",
    "fullName": "Sunil Sonawane",
    "email": "sunil.sonawane@gmail.com",
    "mobile": "+91 98234 44514",
    "profilePhoto": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    "dateOfBirth": "2000-01-01",
    "gender": "Male",
    "address": "Dhule, Dhule, Maharashtra",
    "district": "Dhule",
    "city": "Dhule",
    "pincode": "411001",
    "education": {
      "id": "edu_1ee28ad5-8c27-4bef-bd59-45042eb5b368",
      "highestQualification": "Graduate",
      "degreeName": "Bachelor Degree",
      "institute": "Maharashtra State University",
      "passingYear": "2023",
      "percentageOrCgpa": "8.2 CGPA"
    },
    "experience": {
      "id": "exp_1ee28ad5-8c27-4bef-bd59-45042eb5b368",
      "isFresher": false,
      "totalExperienceYears": 2,
      "expectedSalary": 450000
    },
    "skills": [
      "Diesel Mechanics",
      "Wheel Alignment",
      "Suspension Repair",
      "Auto Maintenance"
    ],
    "languagesKnown": [
      "Marathi",
      "Hindi",
      "English"
    ],
    "preferredJobRoles": [
      "Executive",
      "Engineer",
      "Specialist"
    ],
    "preferredDistricts": [
      "Dhule",
      "Pune",
      "Mumbai City"
    ],
    "isDiscoverable": true,
    "createdAt": "2026-11-14T14:20:11.959Z",
    "updatedAt": "2026-11-14T14:20:11.959Z"
  },
  {
    "id": "a7f6ab0c-593d-4d04-9fc9-8b3c65f99da2",
    "userId": "9c6cb603-e768-414a-92c4-1cc405c2f72c",
    "fullName": "Tanvi Bhosale",
    "email": "tanvi.bhosale@gmail.com",
    "mobile": "+91 98233 33413",
    "profilePhoto": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    "dateOfBirth": "2000-01-01",
    "gender": "Male",
    "address": "Mumbai, Mumbai City, Maharashtra",
    "district": "Mumbai City",
    "city": "Mumbai",
    "pincode": "411001",
    "education": {
      "id": "edu_a7f6ab0c-593d-4d04-9fc9-8b3c65f99da2",
      "highestQualification": "Graduate",
      "degreeName": "Bachelor Degree",
      "institute": "Maharashtra State University",
      "passingYear": "2023",
      "percentageOrCgpa": "8.2 CGPA"
    },
    "experience": {
      "id": "exp_a7f6ab0c-593d-4d04-9fc9-8b3c65f99da2",
      "isFresher": false,
      "totalExperienceYears": 2,
      "expectedSalary": 450000
    },
    "skills": [
      "Financial Modeling",
      "Excel",
      "Corporate Finance",
      "Valuation",
      "Tally"
    ],
    "languagesKnown": [
      "Marathi",
      "Hindi",
      "English"
    ],
    "preferredJobRoles": [
      "Executive",
      "Engineer",
      "Specialist"
    ],
    "preferredDistricts": [
      "Mumbai City",
      "Pune",
      "Mumbai City"
    ],
    "isDiscoverable": true,
    "createdAt": "2026-11-14T14:20:11.533Z",
    "updatedAt": "2026-11-14T14:20:11.533Z"
  },
  {
    "id": "98c90a4a-4364-4bf9-b9ba-8b87430371d8",
    "userId": "9c6cb603-e768-414a-92c4-1cc405c2f72c",
    "fullName": "Vikram Gaikwad",
    "email": "vikram.gaikwad@gmail.com",
    "mobile": "+91 98225 55605",
    "profilePhoto": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    "dateOfBirth": "2000-01-01",
    "gender": "Male",
    "address": "Bhiwandi, Thane, Maharashtra",
    "district": "Thane",
    "city": "Bhiwandi",
    "pincode": "411001",
    "education": {
      "id": "edu_98c90a4a-4364-4bf9-b9ba-8b87430371d8",
      "highestQualification": "Graduate",
      "degreeName": "Bachelor Degree",
      "institute": "Maharashtra State University",
      "passingYear": "2023",
      "percentageOrCgpa": "8.2 CGPA"
    },
    "experience": {
      "id": "exp_98c90a4a-4364-4bf9-b9ba-8b87430371d8",
      "isFresher": false,
      "totalExperienceYears": 2,
      "expectedSalary": 450000
    },
    "skills": [
      "Warehouse Management",
      "Supply Chain",
      "Inventory Control",
      "SAP MM",
      "ERP"
    ],
    "languagesKnown": [
      "Marathi",
      "Hindi",
      "English"
    ],
    "preferredJobRoles": [
      "Executive",
      "Engineer",
      "Specialist"
    ],
    "preferredDistricts": [
      "Thane",
      "Pune",
      "Mumbai City"
    ],
    "isDiscoverable": true,
    "createdAt": "2026-11-14T14:20:08.103Z",
    "updatedAt": "2026-11-14T14:20:08.103Z"
  }
];

export const INITIAL_ADVERTISEMENTS: Advertisement[] = [
  {
    id: 'ad_1',
    title: 'Maharashtra Industrial Skill Development Initiative',
    bannerUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
    targetUrl: 'https://rozgarx.com',
    placement: 'header',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    isActive: true,
    clicks: 320,
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_WEBSITE_SETTINGS: WebsiteSettings = {
  siteName: 'RozgarX',
  logoText: 'RozgarX',
  tagline: 'Connecting Maharashtra with Quality Employment Opportunities',
  contactEmail: 'support@rozgarx.com',
  contactPhone: '+91 22 2202 5555',
  defaultCurrency: 'INR (₹)',
  defaultLanguage: 'en',
  maintenanceMode: false,
  jobPostingExpiryDays: 30,
  allowedFreePostsPerEmployer: 1,
  razorpayTestMode: true,
  updatedAt: new Date().toISOString()
};
