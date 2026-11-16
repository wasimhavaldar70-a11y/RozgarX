export type UserRole = 'super_admin' | 'employer' | 'candidate';

export type JobType = 'Full Time' | 'Part Time' | 'Internship' | 'Contract' | 'Temporary';
export type WorkMode = 'Office' | 'Remote' | 'Hybrid';
export type JobStatus = 'pending' | 'approved' | 'rejected' | 'paused' | 'closed' | 'expired';

export type ApplicationStatus =
  | 'Applied'
  | 'Viewed'
  | 'Shortlisted'
  | 'Interview Scheduled'
  | 'Selected'
  | 'Rejected'
  | 'Withdrawn';

export type VerificationStatus = 'Pending' | 'Verified' | 'Rejected' | 'Suspended';

export type PaymentStatus = 'Created' | 'Pending' | 'Successful' | 'Failed' | 'Refunded';

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  mobile: string;
  phoneVerified?: boolean;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}


export interface CandidateEducation {
  id: string;
  highestQualification: string;
  degreeName: string;
  institute: string;
  passingYear: string;
  percentageOrCgpa?: string;
}

export interface CandidateExperience {
  id: string;
  isFresher: boolean;
  currentCompany?: string;
  previousCompany?: string;
  totalExperienceYears: number;
  currentSalary?: number;
  expectedSalary: number;
  designation?: string;
}

export interface CandidateProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  mobile: string;
  profilePhoto?: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  address: string;
  district: string;
  city: string;
  pincode: string;
  education: CandidateEducation;
  experience: CandidateExperience;
  skills: string[];
  languagesKnown: string[];
  preferredJobRoles: string[];
  preferredDistricts: string[];
  resumeUrl?: string;
  resumeFileName?: string;
  resumeSummary?: string;
  isDiscoverable: boolean;
  phoneVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}


export interface Company {
  id: string;
  employerId: string;
  name: string;
  tagline?: string;
  logoUrl?: string;
  about: string;
  industry: string;
  companyType: string;
  companySize: string;
  district: string;
  city: string;
  address: string;
  pincode: string;
  website?: string;
  contactEmail: string;
  contactPhone: string;
  verificationStatus: VerificationStatus;
  verificationDocumentType?: string;
  verificationDocumentUrl?: string;
  verificationNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  employerId: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  companyVerified: boolean;
  title: string;
  category: string;
  description: string;
  responsibilities: string[];
  requiredSkills: string[];
  educationRequirement: string;
  experienceMinYears: number;
  experienceMaxYears: number;
  salaryMin: number;
  salaryMax: number;
  salaryType: 'Per Month' | 'Per Annum' | 'Negotiable';
  vacancies: number;
  jobType: JobType;
  workMode: WorkMode;
  district: string;
  city: string;
  address: string;
  applicationDeadline: string;
  contactEmail: string;
  contactPhone: string;
  status: JobStatus;
  rejectionReason?: string;
  isFeatured?: boolean;
  isUrgent?: boolean;
  featuredUntil?: string;
  viewCount: number;
  applicationCount: number;
  createdAt: string;
  updatedAt: string;
}

export function getJobLocationDisplay(job: {
  address?: string;
  city?: string;
  district: string;
}): string {
  if (job.address && job.address.trim()) {
    const cleanAddr = job.address.trim();
    const dist = (job.district || '').trim();
    if (dist && !cleanAddr.toLowerCase().includes(dist.toLowerCase())) {
      return `${cleanAddr}, ${dist}`;
    }
    return cleanAddr;
  }
  if (job.city && job.city.trim()) {
    const cleanCity = job.city.trim();
    const dist = (job.district || '').trim();
    if (dist && cleanCity.toLowerCase() !== dist.toLowerCase()) {
      return `${cleanCity}, ${dist}`;
    }
    return cleanCity;
  }
  return job.district || 'Maharashtra';
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  companyName: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateMobile: string;
  candidateDistrict: string;
  candidateExperienceYears: number;
  candidateSkills: string[];
  resumeUrl?: string;
  resumeFileName?: string;
  coverMessage?: string;
  status: ApplicationStatus;
  statusHistory: {
    status: ApplicationStatus;
    changedAt: string;
    note?: string;
  }[];
  interviewDate?: string;
  interviewTime?: string;
  interviewLocationOrLink?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlan {
  id: string;
  code: 'FREE' | 'BASIC' | 'STANDARD' | 'PREMIUM';
  name: string;
  price: number;
  jobPostingLimit: number;
  validityDays: number;
  description: string;
  features: string[];
  isPopular?: boolean;
  isActive: boolean;
  candidateSearchAllowed: boolean;
}

export interface EmployerSubscription {
  id: string;
  employerId: string;
  planId: string;
  planName: string;
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
  startDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'suspended';
  createdAt: string;
}

export interface PaymentTransaction {
  id: string;
  employerId: string;
  companyName: string;
  planId?: string;
  planName: string;
  amount: number;
  currency: string;
  orderId: string;
  paymentId?: string;
  signature?: string;
  status: PaymentStatus;
  paymentMethod: string;
  createdAt: string;
}

export interface FeaturedJobPlan {
  id: string;
  days: number;
  price: number;
  label: string;
  description: string;
}

export interface Advertisement {
  id: string;
  title: string;
  bannerUrl: string;
  targetUrl: string;
  placement: 'header' | 'sidebar' | 'footer' | 'job_listing';
  startDate: string;
  endDate: string;
  isActive: boolean;
  clicks: number;
  createdAt: string;
}

export interface RecruitmentRequest {
  id: string;
  companyName: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  jobRole: string;
  requiredEmployees: number;
  location: string;
  requiredSkills: string[];
  budget: string;
  additionalDetails?: string;
  status: 'pending' | 'in_progress' | 'fulfilled' | 'closed';
  createdAt: string;
}

export interface JobInvitation {
  id: string;
  jobId: string;
  jobTitle: string;
  employerId: string;
  companyName: string;
  companyLogo?: string;
  district: string;
  candidateId: string;
  candidateName: string;
  matchScore: number;
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  updatedAt: string;
}

export interface MatchedCandidate {
  candidate: CandidateProfile;
  matchScore: number;
  matchReasons: string[];
  isHighMatch: boolean;
  hasBeenInvited: boolean;
}

export interface MatchedJob {
  job: Job;
  matchScore: number;
  matchReasons: string[];
  isHighMatch: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  role: UserRole;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: 'employer' | 'job' | 'candidate' | 'subscription' | 'settings' | 'payment';
  targetId: string;
  details: string;
  timestamp: string;
}

export interface WebsiteSettings {
  siteName: string;
  logoText: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  defaultCurrency: string;
  defaultLanguage: 'en' | 'mr' | 'hi';
  maintenanceMode: boolean;
  jobPostingExpiryDays: number;
  allowedFreePostsPerEmployer: number;
  razorpayTestMode: boolean;
  updatedAt: string;
}

export type OtpPurpose = 'candidate_registration' | 'employer_registration';
export type OtpChallengeStatus = 'pending' | 'verified' | 'expired' | 'failed' | 'cancelled';

export interface OtpChallenge {
  id: string;
  phone: string;
  requestId?: string;
  purpose: OtpPurpose;
  status: OtpChallengeStatus;
  sendAttempts: number;
  verifyAttempts: number;
  createdAt: string;
  expiresAt: string;
  verifiedAt?: string;
  ipHash?: string;
}

export interface RegistrationApproval {
  id: string;
  phone: string;
  role: 'candidate' | 'employer';
  tokenHash: string;
  expiresAt: string;
  consumedAt?: string;
  createdAt: string;
}

export interface OtpAdminStats {
  totalRequests: number;
  successfulVerifications: number;
  failedVerifications: number;
  expiredChallenges: number;
  deliveryFailures: number;
  candidateRegistrations: number;
  employerRegistrations: number;
  estimatedCostInr: number;
  requestsByDate: { date: string; requests: number; verified: number }[];
  recentLogs: {
    id: string;
    phoneMasked: string;
    purpose: OtpPurpose;
    status: OtpChallengeStatus;
    attempts: number;
    createdAt: string;
    verifiedAt?: string;
  }[];
}

// ==========================================
// STATUTORY COMPLIANCE & LEGAL RECORDS
// ==========================================
export interface LegalAcceptance {
  id: string;
  userId: string;
  documentId: string;
  version: string;
  ipAddress?: string;
  acceptedAt: string;
}

export interface CandidatePrivacySettings {
  candidateId: string;
  isDiscoverable: boolean;
  maskContactInfo: boolean;
  allowDirectEmployerCall: boolean;
  consentTimestamp: string;
  revokedAt?: string;
}

export interface CandidatePayment {
  id: string;
  candidateId: string;
  amount: number; // ₹199
  currency: 'INR';
  purpose: 'candidate_registration_service';
  gatewayTransactionId: string;
  paymentMethod: 'upi' | 'card' | 'netbanking';
  status: 'pending' | 'success' | 'failed' | 'refunded';
  receiptNumber: string;
  paidAt: string;
  invoiceUrl?: string;
}

export interface RefundRequest {
  id: string;
  candidateId: string;
  mobile: string;
  transactionId: string;
  paymentDate: string;
  reason: 'duplicate_payment' | 'not_activated' | 'technical_failure' | 'unauthorized' | 'other';
  description: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'processed';
  resolutionNotes?: string;
  processedAt?: string;
  createdAt: string;
}

export interface GrievanceRequest {
  id: string;
  complainantName: string;
  mobile: string;
  email: string;
  category:
    | 'fake_job'
    | 'fraudulent_recruiter'
    | 'privacy_violation'
    | 'payment_refund'
    | 'unauthorized_access'
    | 'other';
  subject: string;
  description: string;
  status: 'acknowledged' | 'under_investigation' | 'resolved' | 'closed';
  acknowledgedAt: string; // Within 24 hours
  resolutionTargetAt: string; // Within 7 days SLA
  resolvedAt?: string;
  resolutionRemarks?: string;
  officerName: string;
  createdAt: string;
}


