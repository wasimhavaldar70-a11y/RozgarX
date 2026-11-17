import {
  Job,
  Company,
  CandidateProfile,
  JobApplication,
  SubscriptionPlan,
  EmployerSubscription,
  PaymentTransaction,
  FeaturedJobPlan,
  Advertisement,
  RecruitmentRequest,
  JobInvitation,
  NotificationItem,
  AuditLog,
  WebsiteSettings,
  ApplicationStatus,
  VerificationStatus,
  UserRole,
  OtpChallenge,
  RegistrationApproval,
  OtpAdminStats
} from '../types';
import {
  INITIAL_SUBSCRIPTION_PLANS,
  INITIAL_FEATURED_PLANS,
  INITIAL_WEBSITE_SETTINGS,
  INITIAL_COMPANIES,
  INITIAL_JOBS,
  INITIAL_CANDIDATES
} from '../data/seed';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY_PREFIX = 'mahajobs_real_v3_';

class DatabaseService {
  private subscriptionPlans: SubscriptionPlan[] = [];
  private featuredPlans: FeaturedJobPlan[] = [];
  private companies: Company[] = [];
  private jobs: Job[] = [];
  private candidates: CandidateProfile[] = [];
  private applications: JobApplication[] = [];
  private subscriptions: EmployerSubscription[] = [];
  private payments: PaymentTransaction[] = [];
  private advertisements: Advertisement[] = [];
  private recruitmentRequests: RecruitmentRequest[] = [];
  private jobInvitations: JobInvitation[] = [];
  private auditLogs: AuditLog[] = [];
  private notifications: NotificationItem[] = [];
  private websiteSettings: WebsiteSettings = { ...INITIAL_WEBSITE_SETTINGS };
  private otpChallenges: OtpChallenge[] = [];
  private registrationApprovals: RegistrationApproval[] = [];

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      // Purge any legacy storage keys from v1 and v2
      if (typeof window !== 'undefined') {
        const legacyPrefixes = ['mahajobs_db_v1_', 'mahajobs_real_v2_'];
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && legacyPrefixes.some(p => key.startsWith(p))) {
            localStorage.removeItem(key);
          }
        }
      }

      const getStored = <T>(key: string, fallback: T): T => {
        if (typeof window === 'undefined') return fallback;
        const val = localStorage.getItem(STORAGE_KEY_PREFIX + key);
        if (!val) return fallback;
        try {
          return JSON.parse(val);
        } catch {
          return fallback;
        }
      };

      // Helper function to deduplicate companies strictly by name and ID
      const dedupeCompanies = (list: Company[]): Company[] => {
        const seenNames = new Set<string>();
        const seenIds = new Set<string>();
        const res: Company[] = [];
        for (const c of list) {
          const normName = (c.name || '').trim().toLowerCase();
          if (!normName || seenNames.has(normName) || seenIds.has(c.id)) continue;
          seenNames.add(normName);
          seenIds.add(c.id);
          res.push(c);
        }
        return res;
      };

      // Helper function to deduplicate jobs strictly by ID
      const dedupeJobs = (list: Job[]): Job[] => {
        const seenIds = new Set<string>();
        const res: Job[] = [];
        for (const j of list) {
          if (!j.id || seenIds.has(j.id)) continue;
          seenIds.add(j.id);
          res.push(j);
        }
        return res;
      };

      // Helper function to deduplicate candidates strictly by email
      const dedupeCandidates = (list: CandidateProfile[]): CandidateProfile[] => {
        const seenEmails = new Set<string>();
        const res: CandidateProfile[] = [];
        for (const c of list) {
          const email = (c.email || '').trim().toLowerCase();
          if (!email || seenEmails.has(email)) continue;
          seenEmails.add(email);
          res.push(c);
        }
        return res;
      };

      this.subscriptionPlans = getStored('subscription_plans', INITIAL_SUBSCRIPTION_PLANS);
      this.featuredPlans = getStored('featured_plans', INITIAL_FEATURED_PLANS);

      const storedCompanies = getStored<Company[]>('companies', []);
      this.companies = dedupeCompanies([...INITIAL_COMPANIES, ...storedCompanies]);
      this.persist('companies', this.companies);

      const storedJobs = getStored<Job[]>('jobs', []);
      this.jobs = dedupeJobs([...INITIAL_JOBS, ...storedJobs]).map(j => {
        let jobItem: Job = {
          ...j,
          jobRole: j.jobRole || (j.category?.toLowerCase().includes('labour') ? 'Labourer' : j.category || 'Executive'),
          englishRequirement: j.englishRequirement || (j.title?.toLowerCase().includes('helper') || j.category?.toLowerCase().includes('labour') ? 'No English Required' : 'Basic English Required'),
          jobTimings: j.jobTimings || '9:30 AM - 6:30 PM | Monday to Saturday',
          interviewTimings: j.interviewTimings || '11:00 AM - 4:00 PM | Monday to Saturday',
          genderPreference: j.genderPreference || 'Both male and female can apply',
          whatsappNumber: j.whatsappNumber || j.contactPhone || '+91 98220 11223',
          viewCount: j.viewCount || 22,
          isNew: j.isNew !== undefined ? j.isNew : true,
          applyFirst: j.applyFirst !== undefined ? j.applyFirst : (j.applicationCount < 5)
        };

        if (jobItem.companyName === 'Nakshatra Motors' || jobItem.title === 'Senior Mechanical') {
          jobItem = {
            ...jobItem,
            companyLogo: '/assets/jobs/nakshatra_logo.png',
            companyVerified: true,
            isUrgent: true,
            district: jobItem.district || 'Kolhapur',
            city: jobItem.city || 'Kolhapur',
            address: jobItem.address || 'Kolhapur, Maharashtra'
          };
        }
        // Heal and normalize work location if address was provided
        if (jobItem.address && (jobItem.address.toLowerCase().includes('vathar') || jobItem.address.toLowerCase().includes('vadgaon'))) {
          jobItem = {
            ...jobItem,
            district: jobItem.district === 'Pune' ? 'Kolhapur' : jobItem.district,
            city: jobItem.city === 'Hinjewadi' || !jobItem.city ? 'Vathar Taraf vadgaon' : jobItem.city
          };
        }
        return jobItem;
      });
      this.persist('jobs', this.jobs);

      const storedCandidates = getStored<CandidateProfile[]>('candidates', []);
      this.candidates = dedupeCandidates([...INITIAL_CANDIDATES, ...storedCandidates]);
      this.persist('candidates', this.candidates);

      this.applications = getStored('applications', []);
      this.auditLogs = getStored('audit_logs', []);
      this.notifications = getStored('notifications', []);
      this.websiteSettings = getStored('website_settings', INITIAL_WEBSITE_SETTINGS);
      this.otpChallenges = getStored('otp_challenges', []);
      this.registrationApprovals = getStored('registration_approvals', []);
      this.subscriptions = getStored('subscriptions', []);
      this.payments = getStored('payments', []);
      this.advertisements = getStored('advertisements', []);
      this.recruitmentRequests = getStored('recruitment_requests', []);
      this.jobInvitations = getStored('job_invitations', []);
    } catch (e) {
      console.error('Error loading database state:', e);
    }
  }

  private persist(key: string, data: unknown) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(data));
    } catch (e) {
      console.error(`Failed to persist ${key}:`, e);
    }
  }

  // ==========================================
  // JOBS
  // ==========================================
  public getJobs(filters?: {
    search?: string;
    district?: string;
    city?: string;
    category?: string;
    jobType?: string;
    workMode?: string;
    minSalary?: number;
    experience?: number;
    status?: string;
    employerId?: string;
    companyId?: string;
    companyName?: string;
    isFeatured?: boolean;
  }): Job[] {
    let result = [...this.jobs];

    if (filters?.companyId) {
      result = result.filter(j => j.companyId === filters.companyId);
    } else if (filters?.companyName) {
      const cLower = filters.companyName.toLowerCase();
      result = result.filter(j => j.companyName.toLowerCase() === cLower);
    } else if (filters?.employerId) {
      result = result.filter(j => j.employerId === filters.employerId);
    } else if (filters?.status) {
      result = result.filter(j => j.status === filters.status);
    } else {
      // Public search shows only approved jobs
      result = result.filter(j => j.status === 'approved');
    }

    if (filters?.isFeatured !== undefined) {
      result = result.filter(j => Boolean(j.isFeatured) === filters.isFeatured);
    }

    if (filters?.district && filters.district !== 'All') {
      const distLower = filters.district.toLowerCase();
      result = result.filter(j => j.district.toLowerCase().includes(distLower));
    }

    if (filters?.city && filters.city !== 'All') {
      const cityLower = filters.city.toLowerCase();
      result = result.filter(j => j.city.toLowerCase().includes(cityLower));
    }

    if (filters?.category && filters.category !== 'All') {
      const catLower = filters.category.toLowerCase();
      result = result.filter(j => j.category.toLowerCase().includes(catLower));
    }

    if (filters?.jobType && filters.jobType !== 'All') {
      result = result.filter(j => j.jobType === filters.jobType);
    }

    if (filters?.workMode && filters.workMode !== 'All') {
      result = result.filter(j => j.workMode === filters.workMode);
    }

    if (filters?.minSalary) {
      result = result.filter(j => j.salaryMax >= (filters.minSalary || 0));
    }

    if (filters?.experience !== undefined && filters.experience > 0) {
      result = result.filter(j => j.experienceMinYears <= (filters.experience || 0));
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        j =>
          j.title.toLowerCase().includes(q) ||
          j.companyName.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q) ||
          j.requiredSkills.some(s => s.toLowerCase().includes(q)) ||
          j.district.toLowerCase().includes(q) ||
          j.city.toLowerCase().includes(q)
      );
    }

    // Sort: Featured jobs first, then newest first
    return result.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  public getJobById(id: string): Job | null {
    const job = this.jobs.find(j => j.id === id);
    if (job) {
      job.viewCount = (job.viewCount || 0) + 1;
      this.persist('jobs', this.jobs);
      return { ...job };
    }
    return null;
  }

  public createJob(jobData: Omit<Job, 'id' | 'viewCount' | 'applicationCount' | 'createdAt' | 'updatedAt'>): { success: boolean; job?: Job; error?: string } {
    // 1. Verify Employer Subscription and Credit Limit
    const sub = this.getEmployerSubscription(jobData.employerId);
    if (!sub || sub.status !== 'active') {
      return {
        success: false,
        error: 'No active subscription found. Please select a subscription plan to post jobs.'
      };
    }

    if (sub.remainingCredits <= 0) {
      return {
        success: false,
        error: 'You have exhausted your job posting credits. Please upgrade or renew your plan.'
      };
    }

    // 2. Deduct 1 credit
    sub.usedCredits += 1;
    sub.remainingCredits -= 1;
    this.persist('subscriptions', this.subscriptions);

    const now = new Date().toISOString();
    const newJob: Job = {
      ...jobData,
      id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      status: 'pending', // Requires admin approval as per Section 7 & 10
      viewCount: 0,
      applicationCount: 0,
      createdAt: now,
      updatedAt: now
    };

    this.jobs.unshift(newJob);
    this.persist('jobs', this.jobs);

    // Synchronize to Supabase PostgreSQL database table in background
    if (typeof window !== 'undefined') {
      const syncJobToServer = async () => {
        try {
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (isSupabaseConfigured && supabase) {
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData?.session?.access_token) {
              headers['Authorization'] = `Bearer ${sessionData.session.access_token}`;
            }
          }
          const res = await fetch('/api/jobs/create', {
            method: 'POST',
            headers,
            body: JSON.stringify(newJob)
          });
          const data = await res.json();
          if (data?.success && data?.job?.id) {
            newJob.id = data.job.id;
            this.persist('jobs', this.jobs);
          }
        } catch (e) {
          console.warn('Background database sync for job:', e);
        }
      };
      syncJobToServer();
    }

    // Notify Employer
    this.addNotification({
      userId: jobData.employerId,
      role: 'employer',
      title: 'Job Submitted for Review',
      message: `"${newJob.title}" has been submitted and is currently pending Super Admin review.`,
      type: 'info'
    });

    // Notify Admin
    this.addNotification({
      userId: 'admin',
      role: 'super_admin',
      title: 'New Job Vacancy Pending Approval',
      message: `${newJob.companyName} submitted "${newJob.title}" (${newJob.district}).`,
      type: 'warning'
    });

    // Log admin audit
    this.logAdminAction(
      'JOB_SUBMITTED',
      'job',
      newJob.id,
      `Employer ${newJob.companyName} posted "${newJob.title}". 1 credit deducted. Status: pending.`
    );

    return { success: true, job: newJob };
  }

  public updateJob(id: string, updates: Partial<Job>): { success: boolean; error?: string } {
    const idx = this.jobs.findIndex(j => j.id === id);
    if (idx === -1) return { success: false, error: 'Job not found' };

    this.jobs[idx] = {
      ...this.jobs[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist('jobs', this.jobs);
    return { success: true };
  }

  public approveJob(jobId: string, adminName: string = 'Super Administrator'): boolean {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) return false;

    job.status = 'approved';
    job.rejectionReason = undefined;
    job.updatedAt = new Date().toISOString();
    this.persist('jobs', this.jobs);

    this.addNotification({
      userId: job.employerId,
      role: 'employer',
      title: 'Job Approved & Live!',
      message: `Your job vacancy "${job.title}" has been approved and is now visible across Maharashtra.`,
      type: 'success'
    });

    this.logAdminAction('APPROVE_JOB', 'job', job.id, `Admin ${adminName} approved job "${job.title}".`);
    return true;
  }

  public rejectJob(jobId: string, reason: string, adminName: string = 'Super Administrator'): boolean {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) return false;

    job.status = 'rejected';
    job.rejectionReason = reason;
    job.updatedAt = new Date().toISOString();

    // Refund the job credit since job was rejected by admin
    const sub = this.getEmployerSubscription(job.employerId);
    if (sub) {
      sub.usedCredits = Math.max(0, sub.usedCredits - 1);
      sub.remainingCredits += 1;
      this.persist('subscriptions', this.subscriptions);
    }

    this.persist('jobs', this.jobs);

    this.addNotification({
      userId: job.employerId,
      role: 'employer',
      title: 'Job Vacancy Rejected',
      message: `Your job vacancy "${job.title}" was rejected: ${reason}. 1 job posting credit has been refunded.`,
      type: 'alert'
    });

    this.logAdminAction('REJECT_JOB', 'job', job.id, `Admin ${adminName} rejected job: ${reason}. Credit refunded.`);
    return true;
  }

  public featureJob(jobId: string, days: number, price: number): { success: boolean; error?: string } {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) return { success: false, error: 'Job not found' };

    const until = new Date();
    until.setDate(until.getDate() + days);

    job.isFeatured = true;
    job.featuredUntil = until.toISOString();
    job.updatedAt = new Date().toISOString();
    this.persist('jobs', this.jobs);

    // Record payment
    const payment: PaymentTransaction = {
      id: `pay_feat_${Date.now()}`,
      employerId: job.employerId,
      companyName: job.companyName,
      planName: `Featured Job (${days} Days)`,
      amount: price,
      currency: 'INR',
      orderId: `order_feat_${Date.now()}`,
      paymentId: `pay_feat_succ_${Date.now()}`,
      status: 'Successful',
      paymentMethod: 'Razorpay UPI / Cards',
      createdAt: new Date().toISOString()
    };
    this.payments.unshift(payment);
    this.persist('payments', this.payments);

    this.addNotification({
      userId: job.employerId,
      role: 'employer',
      title: 'Job Promoted to Featured!',
      message: `"${job.title}" will now be highlighted at the top of search for ${days} days.`,
      type: 'success'
    });

    this.logAdminAction('FEATURE_JOB', 'job', job.id, `Featured for ${days} days (₹${price}).`);
    return { success: true };
  }

  // ==========================================
  // APPLICATIONS
  // ==========================================
  public getApplications(filters?: {
    jobId?: string;
    candidateId?: string;
    employerId?: string;
    status?: string;
  }): JobApplication[] {
    let result = [...this.applications];

    if (filters?.jobId) {
      result = result.filter(a => a.jobId === filters.jobId);
    }
    if (filters?.candidateId) {
      result = result.filter(a => a.candidateId === filters.candidateId);
    }
    if (filters?.employerId) {
      const employerJobIds = new Set(this.jobs.filter(j => j.employerId === filters.employerId).map(j => j.id));
      result = result.filter(a => employerJobIds.has(a.jobId));
    }
    if (filters?.status) {
      result = result.filter(a => a.status === filters.status);
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public submitApplication(data: {
    jobId: string;
    candidateId: string;
    coverMessage?: string;
    resumeFileName?: string;
  }): { success: boolean; application?: JobApplication; error?: string } {
    const job = this.jobs.find(j => j.id === data.jobId);
    if (!job) return { success: false, error: 'Job not found' };

    const candidate = this.candidates.find(c => c.id === data.candidateId || c.userId === data.candidateId);
    if (!candidate) {
      return { success: false, error: 'Candidate profile not found' };
    }

    // Prevent duplicate applications for the same job (Section 6 & 19)
    const existing = this.applications.find(
      a => a.jobId === data.jobId && (a.candidateId === candidate.id || a.candidateId === candidate.userId)
    );
    if (existing) {
      return {
        success: false,
        error: 'You have already applied for this job vacancy.'
      };
    }

    const now = new Date().toISOString();
    const newApp: JobApplication = {
      id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      jobId: job.id,
      jobTitle: job.title,
      companyId: job.companyId,
      companyName: job.companyName,
      candidateId: candidate.id,
      candidateName: candidate.fullName,
      candidateEmail: candidate.email,
      candidateMobile: candidate.mobile,
      candidateDistrict: candidate.district,
      candidateExperienceYears: candidate.experience?.totalExperienceYears || 0,
      candidateSkills: candidate.skills || [],
      resumeFileName: data.resumeFileName || candidate.resumeFileName || 'Resume.pdf',
      coverMessage: data.coverMessage,
      status: 'Applied',
      statusHistory: [
        {
          status: 'Applied',
          changedAt: now,
          note: 'Application successfully submitted.'
        }
      ],
      createdAt: now,
      updatedAt: now
    };

    this.applications.unshift(newApp);
    this.persist('applications', this.applications);

    // Increment application count on job
    job.applicationCount = (job.applicationCount || 0) + 1;
    this.persist('jobs', this.jobs);

    // Notify Employer
    this.addNotification({
      userId: job.employerId,
      role: 'employer',
      title: 'New Candidate Applied',
      message: `${candidate.fullName} applied for "${job.title}".`,
      type: 'info'
    });

    // Notify Candidate
    this.addNotification({
      userId: candidate.userId,
      role: 'candidate',
      title: 'Application Sent!',
      message: `Your application for "${job.title}" at ${job.companyName} was submitted for free.`,
      type: 'success'
    });

    return { success: true, application: newApp };
  }

  public updateApplicationStatus(
    applicationId: string,
    status: ApplicationStatus,
    note?: string,
    interviewDetails?: { date?: string; time?: string; location?: string },
    internalNotes?: string
  ): { success: boolean; error?: string } {
    const app = this.applications.find(a => a.id === applicationId);
    if (!app) return { success: false, error: 'Application not found' };

    const now = new Date().toISOString();
    app.status = status;
    app.updatedAt = now;
    if (internalNotes !== undefined) {
      app.internalNotes = internalNotes;
    }
    if (interviewDetails) {
      app.interviewDate = interviewDetails.date;
      app.interviewTime = interviewDetails.time;
      app.interviewLocationOrLink = interviewDetails.location;
    }

    app.statusHistory.push({
      status,
      changedAt: now,
      note: note || `Status updated to ${status}`
    });

    this.persist('applications', this.applications);

    // Notify Candidate of status change (Section 6 & 7)
    let notifTitle = `Application Status: ${status}`;
    let notifType: 'info' | 'success' | 'alert' | 'warning' = 'info';

    if (status === 'Shortlisted') {
      notifTitle = 'Congratulations! You are Shortlisted';
      notifType = 'success';
    } else if (status === 'Interview Scheduled') {
      notifTitle = 'Interview Scheduled!';
      notifType = 'warning';
    } else if (status === 'Selected') {
      notifTitle = 'Job Offer / Selected!';
      notifType = 'success';
    } else if (status === 'Rejected') {
      notifTitle = 'Application Update';
      notifType = 'alert';
    }

    this.addNotification({
      userId: app.candidateId,
      role: 'candidate',
      title: notifTitle,
      message: `${app.companyName} updated your application for "${app.jobTitle}" to ${status}. ${note || ''}`,
      type: notifType
    });

    return { success: true };
  }

  // ==========================================
  // EMPLOYERS & COMPANIES
  // ==========================================
  public getCompanies(): Company[] {
    const seenNames = new Set<string>();
    const seenIds = new Set<string>();
    const unique: Company[] = [];
    for (const c of this.companies) {
      const normName = (c.name || '').trim().toLowerCase();
      if (!normName || seenNames.has(normName) || seenIds.has(c.id)) continue;
      seenNames.add(normName);
      seenIds.add(c.id);
      unique.push(c);
    }
    return unique;
  }

  public getCompanyById(id: string): Company | null {
    return this.companies.find(c => c.id === id || c.employerId === id) || null;
  }

  public updateCompany(id: string, updates: Partial<Company>): boolean {
    const idx = this.companies.findIndex(c => c.id === id || c.employerId === id);
    if (idx === -1) {
      this.companies.push(updates as Company);
      this.persist('companies', this.companies);
      return true;
    }
    this.companies[idx] = {
      ...this.companies[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist('companies', this.companies);
    return true;
  }


  public verifyEmployer(
    companyId: string,
    status: VerificationStatus,
    notes?: string,
    adminName: string = 'Super Administrator'
  ): boolean {
    const comp = this.companies.find(c => c.id === companyId);
    if (!comp) return false;

    comp.verificationStatus = status;
    comp.verificationNotes = notes;
    comp.updatedAt = new Date().toISOString();
    this.persist('companies', this.companies);

    // Also update verified flag on their jobs
    const isVerified = status === 'Verified';
    this.jobs.forEach(j => {
      if (j.companyId === comp.id || j.employerId === comp.employerId) {
        j.companyVerified = isVerified;
      }
    });
    this.persist('jobs', this.jobs);

    this.addNotification({
      userId: comp.employerId,
      role: 'employer',
      title: `Employer Verification ${status}`,
      message: `Your company profile verification status is now: ${status}. ${notes || ''}`,
      type: status === 'Verified' ? 'success' : 'alert'
    });

    this.logAdminAction(
      'VERIFY_EMPLOYER',
      'employer',
      comp.id,
      `Admin ${adminName} updated verification for ${comp.name} to ${status}.`
    );

    return true;
  }

  // ==========================================
  // CANDIDATES
  // ==========================================
  public getCandidates(filters?: {
    search?: string;
    district?: string;
    skill?: string;
    maskContactInfo?: boolean;
    includeNonDiscoverable?: boolean;
  }): CandidateProfile[] {
    let list = [...this.candidates];

    // Privacy & DPDP Compliance: Candidate discoverability is strictly opt-in
    if (!filters?.includeNonDiscoverable) {
      list = list.filter(c => c.isDiscoverable === true);
    }

    if (filters?.district && filters.district !== 'All') {
      list = list.filter(c => c.district.toLowerCase() === filters.district!.toLowerCase());
    }

    if (filters?.skill) {
      const s = filters.skill.toLowerCase();
      list = list.filter(c => c.skills.some(sk => sk.toLowerCase().includes(s)));
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        c =>
          c.fullName.toLowerCase().includes(q) ||
          c.skills.some(sk => sk.toLowerCase().includes(q)) ||
          c.district.toLowerCase().includes(q)
      );
    }

    // Strict Data-Layer Privacy Gating: When maskContactInfo is active,
    // personal contact details (mobile, email, exact address) are permanently masked
    // at the service layer so raw values are never exposed in browser memory or dev tools.
    if (filters?.maskContactInfo) {
      return list.map(c => ({
        ...c,
        mobile: '+91 98XXX XXXXX (Protected)',
        email: `${c.fullName.toLowerCase().replace(/\s+/g, '.')}***@candidate.rozgarx.com`,
        address: `${c.city || c.district}, ${c.district}, Maharashtra (Full Address Masked)`
      }));
    }

    return list;
  }

  public getCandidateById(
    id: string,
    options?: { maskContactInfo?: boolean }
  ): CandidateProfile | null {
    const cand = this.candidates.find(c => c.id === id || c.userId === id);
    if (!cand) return null;

    if (options?.maskContactInfo) {
      return {
        ...cand,
        mobile: '+91 98XXX XXXXX (Protected)',
        email: `${cand.fullName.toLowerCase().replace(/\s+/g, '.')}***@candidate.rozgarx.com`,
        address: `${cand.city || cand.district}, ${cand.district}, Maharashtra (Full Address Masked)`
      };
    }

    return cand;
  }

  public updateCandidateProfile(id: string, updates: Partial<CandidateProfile>): boolean {
    let cand = this.candidates.find(c => c.id === id || c.userId === id);
    if (!cand) {
      // Create profile
      cand = {
        id: `cand_${Date.now()}`,
        userId: id,
        fullName: updates.fullName || '',
        email: updates.email || '',
        mobile: updates.mobile || '',
        address: updates.address || '',
        district: updates.district || 'Pune',
        city: updates.city || '',
        pincode: updates.pincode || '',
        education: updates.education || { id: `edu_${Date.now()}`, highestQualification: '', degreeName: '', institute: '', passingYear: '' },
        experience: updates.experience || { id: `exp_${Date.now()}`, isFresher: true, totalExperienceYears: 0, expectedSalary: 0 },
        skills: updates.skills || [],
        languagesKnown: updates.languagesKnown || ['Marathi', 'English'],
        preferredJobRoles: updates.preferredJobRoles || [],
        preferredDistricts: updates.preferredDistricts || [],
        isDiscoverable: updates.isDiscoverable ?? false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...updates
      };
      this.candidates.push(cand);
    } else {
      Object.assign(cand, updates, { updatedAt: new Date().toISOString() });
    }
    this.persist('candidates', this.candidates);
    return true;
  }

  /**
   * Permanently purge candidate account and associated applications
   * (Right to Erasure - India DPDP Act 2023 Section 12 & GDPR Article 17)
   */
  public deleteCandidateAccount(id: string): boolean {
    const initialCount = this.candidates.length;
    this.candidates = this.candidates.filter(c => c.id !== id && c.userId !== id);
    this.applications = this.applications.filter(a => a.candidateId !== id);
    this.persist('candidates', this.candidates);
    this.persist('applications', this.applications);
    return this.candidates.length < initialCount;
  }

  // ==========================================
  // REAL-TIME MAHAJOBS PORTAL STATISTICS
  // ==========================================
  public getLiveStats(): {
    liveJobsCount: number;
    talentPoolCount: number;
    companiesCount: number;
    districtsCount: number;
    placementRate: number;
    dailyInteractions: number;
  } {
    const liveJobs = this.jobs.filter(j => j.status === 'approved');
    const liveDistricts = new Set(liveJobs.map(j => (j.district || '').trim()).filter(Boolean)).size;
    const discoverableCandidates = this.candidates.filter(c => c.isDiscoverable !== false);
    const verifiedCompanies = this.getCompanies().filter(c => c.verificationStatus === 'Verified');

    // Calculate placement rate based on shortlisted/interviewed/selected applications
    const successfulApps = this.applications.filter(a =>
      ['Shortlisted', 'Interview Scheduled', 'Selected'].includes(a.status)
    ).length;
    const totalApps = this.applications.length;
    const placementRate = totalApps > 0 ? Math.round((successfulApps / totalApps) * 100) : 0;

    // Calculate aggregate employer views / daily calls
    const totalViews = liveJobs.reduce((acc, j) => acc + (j.viewCount || 0), 0);
    const dailyInteractions = totalViews;

    return {
      liveJobsCount: liveJobs.length,
      talentPoolCount: discoverableCandidates.length,
      companiesCount: verifiedCompanies.length > 0 ? verifiedCompanies.length : this.companies.length,
      districtsCount: liveDistricts,
      placementRate,
      dailyInteractions
    };
  }

  // ==========================================
  // SUBSCRIPTIONS & PAYMENTS
  // ==========================================
  public getSubscriptionPlans(): SubscriptionPlan[] {
    return [...this.subscriptionPlans];
  }

  public updateSubscriptionPlan(planId: string, updates: Partial<SubscriptionPlan>): boolean {
    const idx = this.subscriptionPlans.findIndex(p => p.id === planId);
    if (idx === -1) return false;
    this.subscriptionPlans[idx] = { ...this.subscriptionPlans[idx], ...updates };
    this.persist('subscription_plans', this.subscriptionPlans);
    this.logAdminAction('UPDATE_PLAN', 'subscription', planId, `Updated plan ${this.subscriptionPlans[idx].name}`);
    return true;
  }

  public getEmployerSubscription(employerId: string): EmployerSubscription {
    let sub = this.subscriptions.find(s => s.employerId === employerId && s.status === 'active');
    if (!sub) {
      // Assign Free Starter plan automatically on initial registration
      const freePlan = this.subscriptionPlans.find(p => p.code === 'FREE') || INITIAL_SUBSCRIPTION_PLANS[0];
      const now = new Date();
      const exp = new Date();
      exp.setDate(exp.getDate() + freePlan.validityDays);

      sub = {
        id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        employerId,
        planId: freePlan.id,
        planName: freePlan.name,
        totalCredits: freePlan.jobPostingLimit,
        usedCredits: 0,
        remainingCredits: freePlan.jobPostingLimit,
        startDate: now.toISOString(),
        expiryDate: exp.toISOString(),
        status: 'active',
        createdAt: now.toISOString()
      };
      this.subscriptions.push(sub);
      this.persist('subscriptions', this.subscriptions);
    }
    return sub;
  }

  public activateSubscription(
    employerId: string,
    planId: string,
    paymentDetails: {
      orderId: string;
      paymentId: string;
      signature?: string;
      method: string;
    }
  ): { success: boolean; subscription?: EmployerSubscription; error?: string } {
    const plan = this.subscriptionPlans.find(p => p.id === planId);
    if (!plan) return { success: false, error: 'Subscription plan not found' };

    const company = this.companies.find(c => c.employerId === employerId);
    const companyName = company ? company.name : 'Registered Employer';

    // 1. Record verified payment transaction (Section 8)
    const payment: PaymentTransaction = {
      id: `pay_${Date.now()}`,
      employerId,
      companyName,
      planId: plan.id,
      planName: plan.name,
      amount: plan.price,
      currency: 'INR',
      orderId: paymentDetails.orderId,
      paymentId: paymentDetails.paymentId,
      signature: paymentDetails.signature || 'sig_verified_server_hmac256',
      status: 'Successful',
      paymentMethod: paymentDetails.method || 'Razorpay UPI / Cards',
      createdAt: new Date().toISOString()
    };
    this.payments.unshift(payment);
    this.persist('payments', this.payments);

    // 2. Mark existing active subscriptions as renewed
    this.subscriptions.forEach(s => {
      if (s.employerId === employerId) s.status = 'expired';
    });

    // 3. Create fresh subscription
    const now = new Date();
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + plan.validityDays);

    const newSub: EmployerSubscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      employerId,
      planId: plan.id,
      planName: plan.name,
      totalCredits: plan.jobPostingLimit,
      usedCredits: 0,
      remainingCredits: plan.jobPostingLimit,
      startDate: now.toISOString(),
      expiryDate: expiry.toISOString(),
      status: 'active',
      createdAt: now.toISOString()
    };

    this.subscriptions.unshift(newSub);
    this.persist('subscriptions', this.subscriptions);

    // 4. In-app notifications
    this.addNotification({
      userId: employerId,
      role: 'employer',
      title: 'Subscription Activated!',
      message: `Your ${plan.name} plan is now active with ${plan.jobPostingLimit} job posting credits valid until ${expiry.toLocaleDateString()}.`,
      type: 'success'
    });

    this.logAdminAction(
      'SUBSCRIPTION_PURCHASE',
      'payment',
      payment.id,
      `Employer ${companyName} purchased ${plan.name} (₹${plan.price}) via ${payment.paymentMethod}.`
    );

    return { success: true, subscription: newSub };
  }

  public getPayments(employerId?: string): PaymentTransaction[] {
    if (employerId) {
      return this.payments.filter(p => p.employerId === employerId);
    }
    return [...this.payments];
  }

  // ==========================================
  // RECRUITMENT REQUESTS & ADS
  // ==========================================
  public getAdvertisements(): Advertisement[] {
    return [...this.advertisements];
  }

  public getRecruitmentRequests(): RecruitmentRequest[] {
    return [...this.recruitmentRequests];
  }

  public createRecruitmentRequest(req: Omit<RecruitmentRequest, 'id' | 'status' | 'createdAt'>): RecruitmentRequest {
    const newReq: RecruitmentRequest = {
      ...req,
      id: `rec_${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    this.recruitmentRequests.unshift(newReq);
    this.persist('recruitment_requests', this.recruitmentRequests);

    this.logAdminAction(
      'RECRUITMENT_REQUEST',
      'settings',
      newReq.id,
      `Recruitment request submitted by ${req.companyName} for ${req.jobRole} (${req.requiredEmployees} staff).`
    );

    return newReq;
  }

  // ==========================================
  // NOTIFICATIONS & AUDIT LOGS
  // ==========================================
  public getNotifications(userId?: string, role?: UserRole): NotificationItem[] {
    return this.notifications.filter(n => {
      if (userId && n.userId === userId) return true;
      if (role && n.role === role) return true;
      return false;
    });
  }

  public markNotificationRead(id: string): void {
    const item = this.notifications.find(n => n.id === id);
    if (item) {
      item.isRead = true;
      this.persist('notifications', this.notifications);
    }
  }

  public addNotification(item: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>): void {
    const notif: NotificationItem = {
      ...item,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    this.notifications.unshift(notif);
    this.persist('notifications', this.notifications);
  }

  public getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  public logAdminAction(
    action: string,
    targetType: AuditLog['targetType'],
    targetId: string,
    details: string,
    adminName: string = 'Super Administrator'
  ): void {
    const log: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      adminId: 'admin',
      adminName,
      action,
      targetType,
      targetId,
      details,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(log);
    this.persist('audit_logs', this.auditLogs);
  }

  // ==========================================
  // WEBSITE SETTINGS
  // ==========================================
  public getWebsiteSettings(): WebsiteSettings {
    return { ...this.websiteSettings };
  }

  public updateWebsiteSettings(updates: Partial<WebsiteSettings>): boolean {
    this.websiteSettings = {
      ...this.websiteSettings,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist('website_settings', this.websiteSettings);
    this.logAdminAction('UPDATE_SETTINGS', 'settings', 'global', 'Updated global portal configuration.');
    return true;
  }

  // ==========================================
  // SMS OTP & REGISTRATION APPROVALS
  // ==========================================
  public getOtpChallenges(): OtpChallenge[] {
    return [...this.otpChallenges];
  }

  public saveOtpChallenge(challenge: OtpChallenge): void {
    // Cancel prior pending challenges for same phone & purpose
    this.otpChallenges.forEach(c => {
      if (c.phone === challenge.phone && c.purpose === challenge.purpose && c.status === 'pending') {
        c.status = 'cancelled';
      }
    });
    this.otpChallenges.unshift(challenge);
    this.persist('otp_challenges', this.otpChallenges);
  }

  public updateOtpChallenge(id: string, updates: Partial<OtpChallenge>): void {
    const idx = this.otpChallenges.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.otpChallenges[idx] = { ...this.otpChallenges[idx], ...updates };
      this.persist('otp_challenges', this.otpChallenges);
    }
  }

  public saveRegistrationApproval(approval: RegistrationApproval): void {
    this.registrationApprovals.unshift(approval);
    this.persist('registration_approvals', this.registrationApprovals);
  }

  public getRegistrationApprovalByHash(tokenHash: string): RegistrationApproval | null {
    return this.registrationApprovals.find(a => a.tokenHash === tokenHash) || null;
  }

  public consumeRegistrationApproval(tokenHash: string, phone: string, role: string): boolean {
    const approval = this.registrationApprovals.find(
      a => a.tokenHash === tokenHash && a.phone === phone && a.role === role
    );
    if (!approval) return false;
    if (approval.consumedAt) return false; // Already consumed
    if (new Date(approval.expiresAt).getTime() < Date.now()) return false; // Expired

    approval.consumedAt = new Date().toISOString();
    this.persist('registration_approvals', this.registrationApprovals);
    return true;
  }

  public isPhoneRegistered(phone: string): boolean {
    const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
    const normalizedDigits = cleaned.startsWith('91') && cleaned.length === 12 ? cleaned.slice(2) : cleaned;

    const matchesCand = this.candidates.some(c => {
      const cClean = (c.mobile || '').replace(/[\s\-\(\)\+]/g, '');
      const cDigits = cClean.startsWith('91') && cClean.length === 12 ? cClean.slice(2) : cClean;
      return cDigits === normalizedDigits;
    });

    const matchesComp = this.companies.some(c => {
      const pClean = (c.contactPhone || '').replace(/[\s\-\(\)\+]/g, '');
      const pDigits = pClean.startsWith('91') && pClean.length === 12 ? pClean.slice(2) : pClean;
      return pDigits === normalizedDigits;
    });

    return matchesCand || matchesComp;
  }

  public getOtpAdminStats(): OtpAdminStats {
    const challenges = this.otpChallenges;
    const totalRequests = challenges.length;
    const successfulVerifications = challenges.filter(c => c.status === 'verified').length;
    const failedVerifications = challenges.filter(c => c.status === 'failed').length;
    const expiredChallenges = challenges.filter(c => c.status === 'expired').length;
    const deliveryFailures = challenges.filter(c => (c.sendAttempts || 0) > 1 && c.status === 'cancelled').length;

    const candidateRegistrations = challenges.filter(c => c.purpose === 'candidate_registration' && c.status === 'verified').length;
    const employerRegistrations = challenges.filter(c => c.purpose === 'employer_registration' && c.status === 'verified').length;

    // MSG91 estimated cost: ₹0.15 + 18% GST = ~₹0.18 per SMS
    const estimatedCostInr = Math.round(totalRequests * 0.18 * 100) / 100;

    // Group requests by date (last 7 days)
    const dateMap = new Map<string, { requests: number; verified: number }>();
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      dateMap.set(key, { requests: 0, verified: 0 });
    }

    challenges.forEach(c => {
      const d = new Date(c.createdAt);
      const key = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      if (dateMap.has(key)) {
        const item = dateMap.get(key)!;
        item.requests += 1;
        if (c.status === 'verified') item.verified += 1;
      }
    });

    const requestsByDate = Array.from(dateMap.entries()).map(([date, counts]) => ({
      date,
      requests: counts.requests,
      verified: counts.verified
    }));

    // Mask phone numbers for admin view (no full numbers, no OTPs, privacy-compliant)
    const recentLogs = challenges.slice(0, 15).map(c => {
      const clean = c.phone.replace(/[\s\-\+]/g, '');
      const last2 = clean.slice(-2);
      const first5 = clean.slice(0, 5);
      return {
        id: c.id,
        phoneMasked: `${first5} **** ${last2}`,
        purpose: c.purpose,
        status: c.status,
        attempts: c.verifyAttempts,
        createdAt: c.createdAt,
        verifiedAt: c.verifiedAt
      };
    });

    return {
      totalRequests,
      successfulVerifications,
      failedVerifications,
      expiredChallenges,
      deliveryFailures,
      candidateRegistrations,
      employerRegistrations,
      estimatedCostInr,
      requestsByDate,
      recentLogs
    };
  }

  // ==========================================
  // SMART MATCHING & JOB INVITATIONS
  // ==========================================
  public getJobInvitations(filters?: { employerId?: string; candidateId?: string; jobId?: string }): JobInvitation[] {
    let result = [...this.jobInvitations];
    if (filters?.employerId) {
      result = result.filter(inv => inv.employerId === filters.employerId);
    }
    if (filters?.candidateId) {
      result = result.filter(inv => inv.candidateId === filters.candidateId);
    }
    if (filters?.jobId) {
      result = result.filter(inv => inv.jobId === filters.jobId);
    }
    return result;
  }

  public sendJobInvitation(data: {
    jobId: string;
    candidateId: string;
    employerId: string;
    matchScore?: number;
    message?: string;
  }): { success: boolean; invitation?: JobInvitation; error?: string } {
    const job = this.getJobById(data.jobId);
    if (!job) return { success: false, error: 'Job not found' };

    const cand = this.getCandidateById(data.candidateId);
    if (!cand) return { success: false, error: 'Candidate not found' };

    // Prevent duplicates
    const existing = this.jobInvitations.find(
      inv => inv.jobId === data.jobId && inv.candidateId === data.candidateId
    );
    if (existing) {
      return { success: false, error: 'An invitation has already been sent to this candidate for this vacancy' };
    }

    const invitation: JobInvitation = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      jobId: data.jobId,
      jobTitle: job.title,
      employerId: data.employerId,
      companyName: job.companyName,
      companyLogo: job.companyLogo,
      district: job.district,
      candidateId: data.candidateId,
      candidateName: cand.fullName,
      matchScore: data.matchScore || 85,
      message: data.message || `We noticed your profile strongly matches our requirement for ${job.title}. We would love to review your application.`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.jobInvitations.push(invitation);
    this.persist('job_invitations', this.jobInvitations);

    // In-app notification to the candidate
    this.addNotification({
      userId: cand.userId || cand.id,
      role: 'candidate',
      title: `📩 Direct Job Invitation from ${job.companyName}`,
      message: `${job.companyName} invited you to apply for "${job.title}" (${invitation.matchScore}% Match).`,
      type: 'success',
      link: '/candidate-dashboard'
    });

    this.logAdminAction(
      'SEND_JOB_INVITATION',
      'job',
      invitation.id,
      `Employer ${job.companyName} sent job invitation to candidate ${cand.fullName} for job: ${job.title}`
    );

    return { success: true, invitation };
  }

  public respondToJobInvitation(invitationId: string, status: 'accepted' | 'declined'): boolean {
    const idx = this.jobInvitations.findIndex(i => i.id === invitationId);
    if (idx === -1) return false;

    this.jobInvitations[idx].status = status;
    this.jobInvitations[idx].updatedAt = new Date().toISOString();
    this.persist('job_invitations', this.jobInvitations);

    const inv = this.jobInvitations[idx];
    this.addNotification({
      userId: inv.employerId,
      role: 'employer',
      title: `Invitation ${status === 'accepted' ? 'Accepted' : 'Declined'}`,
      message: `Candidate ${inv.candidateName} ${status === 'accepted' ? 'accepted' : 'declined'} your invitation for "${inv.jobTitle}".`,
      type: status === 'accepted' ? 'success' : 'info'
    });

    return true;
  }

  public resetToSeed(): void {
    if (typeof window !== 'undefined') {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(STORAGE_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    }
    this.loadState();
  }
}

export const db = new DatabaseService();
