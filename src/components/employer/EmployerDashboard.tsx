'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Building,
  PlusCircle,
  Briefcase,
  Users,
  Search,
  Sparkles,
  CreditCard,
  Receipt,
  Bell,
  Settings,
  LogOut,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  FileText,
  Phone,
  Mail,
  ShieldCheck,
  Lock,
  Pause,
  Play,
  CheckCircle2,
  Upload,
  ArrowRight,
  X
} from 'lucide-react';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { Job, JobApplication, CandidateProfile, ApplicationStatus, getJobLocationDisplay } from '../../types';
import { PostJobModal } from './PostJobModal';
import { SubscriptionModal } from './SubscriptionModal';
import { MAHARASHTRA_DISTRICTS } from '../../data/maharashtra';
import { findMatchingCandidates } from '../../services/matchingService';

interface EmployerDashboardProps {
  initialTab?: string;
  onTabChange?: (tab: string) => void;
  onPostJobClick?: () => void;
  onNavigateHome?: () => void;
}

export const EmployerDashboard: React.FC<EmployerDashboardProps> = ({
  initialTab = 'overview',
  onTabChange,
  onPostJobClick,
  onNavigateHome
}) => {
  const { user, companyProfile, logout } = useAuth();
  const employerId = user?.employerId || user?.id || 'emp_1';

  const handleSignOut = () => {
    logout();
    if (onNavigateHome) {
      onNavigateHome();
    }
  };

  const [activeTab, setActiveTab] = useState(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const switchTab = (tabId: string) => {
    setActiveTab(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [company, setCompany] = useState(companyProfile || db.getCompanies()[0]);

  // Modals
  const [postJobOpen, setPostJobOpen] = useState(false);
  const [subModalOpen, setSubModalOpen] = useState(false);

  // Interview Schedule Modal state
  const [selectedAppForInterview, setSelectedAppForInterview] = useState<JobApplication | null>(null);
  const [interviewDate, setInterviewDate] = useState('2026-11-25');
  const [interviewTime, setInterviewTime] = useState('11:00 AM IST');
  const [interviewLocation, setInterviewLocation] = useState('Hinjewadi Office / Google Meet (https://meet.google.com/xyz)');
  const [interviewNote, setInterviewNote] = useState('Technical Screening Round 1');

  // Candidate Search Filters
  const [candSkillFilter, setCandSkillFilter] = useState('');
  const [candDistrictFilter, setCandDistrictFilter] = useState('All');

  // Smart Talent Pool state
  const [selectedMatchingJobId, setSelectedMatchingJobId] = useState<string>('');
  const [invitationSuccessMsg, setInvitationSuccessMsg] = useState<string>('');

  // Load Data
  const refreshData = () => {
    const employerJobs = db.getJobs({ employerId });
    setJobs(employerJobs);
    const employerApps = db.getApplications({ employerId });
    setApplications(employerApps);

    const currentSub = db.getEmployerSubscription(employerId);
    const hasActiveSubscription = Boolean(
      currentSub &&
      currentSub.status === 'active' &&
      currentSub.planName !== 'Free Starter'
    );

    const cands = db.getCandidates({
      skill: candSkillFilter || undefined,
      district: candDistrictFilter !== 'All' ? candDistrictFilter : undefined,
      maskContactInfo: !hasActiveSubscription
    });
    setCandidates(cands);
    const comp = db.getCompanyById(company?.id || 'comp_1');
    if (comp) setCompany(comp);
  };

  useEffect(() => {
    refreshData();
  }, [employerId, activeTab, candSkillFilter, candDistrictFilter]);

  const subscription = db.getEmployerSubscription(employerId);
  const isSubscribedEmployer = Boolean(
    subscription &&
    subscription.status === 'active' &&
    subscription.planName !== 'Free Starter'
  );
  const activeJobs = jobs.filter(j => j.status === 'approved');

  useEffect(() => {
    if (jobs.length > 0 && !selectedMatchingJobId) {
      setSelectedMatchingJobId(jobs[0].id);
    }
  }, [jobs, selectedMatchingJobId]);

  const handleSendJobInvitation = (jobId: string, candidateId: string, matchScore: number) => {
    const res = db.sendJobInvitation({
      jobId,
      candidateId,
      employerId,
      matchScore
    });

    if (res.success) {
      setInvitationSuccessMsg('Job invitation sent! The candidate has been notified in their dashboard.');
      refreshData();
      setTimeout(() => setInvitationSuccessMsg(''), 4000);
    } else {
      alert(res.error || 'Failed to send invitation');
    }
  };
  const totalApps = applications.length;
  const shortlistedCount = applications.filter(a => a.status === 'Shortlisted').length;
  const interviewsCount = applications.filter(a => a.status === 'Interview Scheduled').length;

  const handleUpdateAppStatus = (appId: string, status: ApplicationStatus, note?: string) => {
    db.updateApplicationStatus(appId, status, note);
    refreshData();
  };

  const handleConfirmInterview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppForInterview) return;

    db.updateApplicationStatus(
      selectedAppForInterview.id,
      'Interview Scheduled',
      interviewNote,
      {
        date: interviewDate,
        time: interviewTime,
        location: interviewLocation
      }
    );

    setSelectedAppForInterview(null);
    refreshData();
  };

  const handleToggleJobPause = (job: Job) => {
    const nextStatus = job.status === 'approved' ? 'paused' : 'approved';
    db.updateJob(job.id, { status: nextStatus });
    refreshData();
  };

  const handleFeatureJob = (jobId: string, days: number, price: number) => {
    db.featureJob(jobId, days, price);
    refreshData();
  };

  const sidebarLinks = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'jobs', label: `Manage Jobs (${jobs.length})`, icon: Briefcase },
    { id: 'applications', label: `Applications (${totalApps})`, icon: Users },
    { id: 'smart-talent-pool', label: 'Smart Talent Pool (AI)', icon: Sparkles },
    { id: 'candidate-search', label: 'Candidate Search', icon: Search },
    { id: 'plans', label: 'Subscription & Credits', icon: CreditCard },
    { id: 'company', label: 'Company Profile & KYC', icon: Building },
    { id: 'payments', label: 'Payments & Invoices', icon: Receipt },
    { id: 'settings', label: 'Account Settings', icon: Settings }
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
              {company?.logoUrl ? (
                <img src={company.logoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <Building className="w-7 h-7 text-slate-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900">{company?.name}</h1>
                {company?.verificationStatus === 'Verified' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Employer
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    KYC {company?.verificationStatus || 'Pending'}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                  <Phone className="w-3 h-3 text-blue-600" />
                  Phone Verified (SMS OTP)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <span>{company?.district}, Maharashtra</span>
                <span>•</span>
                <span>Plan: <strong>{subscription?.planName}</strong> ({subscription?.remainingCredits} Credits left)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSubModalOpen(true)}
              className="px-3.5 py-2 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-xl transition-colors"
            >
              Subscription Plans
            </button>
            <button
              onClick={() => setPostJobOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post New Vacancy</span>
            </button>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="col-span-1 bg-white p-3 rounded-2xl border border-slate-200 h-fit space-y-1">
            {sidebarLinks.map(link => {
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  onClick={() => switchTab(link.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl text-left transition-colors ${
                    activeTab === link.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </button>
              );
            })}

            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl text-left"
              >
                <LogOut className="w-4 h-4 shrink-0 text-red-500" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="col-span-1 md:col-span-3 space-y-6">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* 6 Key Overview Cards (Section 7) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Total Jobs Posted</span>
                    <p className="text-2xl font-black text-slate-900 mt-1">{jobs.length}</p>
                    <span className="text-[10px] text-slate-400">All vacancies</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Active Jobs Live</span>
                    <p className="text-2xl font-black text-blue-600 mt-1">{activeJobs.length}</p>
                    <span className="text-[10px] text-blue-600 font-medium">Visible to candidates</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Total Applications</span>
                    <p className="text-2xl font-black text-slate-900 mt-1">{totalApps}</p>
                    <span className="text-[10px] text-slate-400">Resumes received</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Shortlisted</span>
                    <p className="text-2xl font-black text-emerald-600 mt-1">{shortlistedCount}</p>
                    <span className="text-[10px] text-emerald-600 font-medium">Candidates approved</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Interviews Scheduled</span>
                    <p className="text-2xl font-black text-purple-600 mt-1">{interviewsCount}</p>
                    <span className="text-[10px] text-purple-600 font-medium">Active pipeline</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Remaining Credits</span>
                    <p className="text-2xl font-black text-blue-700 mt-1">
                      {subscription?.remainingCredits ?? 0}
                    </p>
                    <span className="text-[10px] text-blue-600 font-medium">{subscription?.planName}</span>
                  </div>
                </div>

                {/* Recent Applications Quick Review */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                    <h3 className="font-bold text-slate-900 text-sm">
                      Recent Candidate Applications
                    </h3>
                    <button
                      onClick={() => setActiveTab('applications')}
                      className="text-xs text-blue-600 font-semibold hover:underline"
                    >
                      Manage All ({totalApps})
                    </button>
                  </div>

                  {applications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No applications received yet. Vacancies are promoted across Maharashtra.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {applications.slice(0, 3).map(app => (
                        <div
                          key={app.id}
                          className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900 text-sm">{app.candidateName}</h4>
                              <span className="text-xs text-slate-400">• {app.candidateDistrict}</span>
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5">Applied for: {app.jobTitle}</p>
                            <span className="text-[11px] text-slate-400">
                              Exp: {app.candidateExperienceYears} yrs • Skills: {app.candidateSkills.slice(0, 3).join(', ')}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                app.status === 'Shortlisted'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : app.status === 'Interview Scheduled'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {app.status}
                            </span>
                            <button
                              onClick={() => setActiveTab('applications')}
                              className="px-3 py-1.5 bg-white border border-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-100 text-slate-700"
                            >
                              Review Candidate
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MANAGE JOBS TAB */}
            {activeTab === 'jobs' && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Job Vacancies ({jobs.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Manage, pause, renew, or promote your active openings.
                    </p>
                  </div>
                  <button
                    onClick={() => setPostJobOpen(true)}
                    className="px-3.5 py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-xs hover:bg-blue-700 flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Post Job</span>
                  </button>
                </div>

                {jobs.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    No jobs posted yet. Click "Post Job" above to create your first vacancy.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobs.map(job => (
                      <div
                        key={job.id}
                        className="p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-slate-900 text-base">{job.title}</h4>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  job.status === 'approved'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : job.status === 'pending'
                                    ? 'bg-amber-100 text-amber-800'
                                    : job.status === 'paused'
                                    ? 'bg-slate-200 text-slate-700'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {job.status === 'pending' ? 'Pending Admin Review' : job.status}
                              </span>

                              {job.isFeatured && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                                  <Sparkles className="w-3 h-3 text-amber-600" />
                                  Featured
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-600 mt-1">
                              {getJobLocationDisplay(job)} • {job.jobType} • {job.workMode} • ₹{job.salaryMin.toLocaleString('en-IN')} - ₹{job.salaryMax.toLocaleString('en-IN')} / {job.salaryType}
                            </p>

                            {/* Eligibility & Required Skills */}
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                                {job.experienceMinYears === 0
                                  ? 'Fresher Eligible'
                                  : `${job.experienceMinYears}–${job.experienceMaxYears} yrs exp`}
                              </span>
                              {job.educationRequirement && (
                                <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold border border-purple-200/60 text-[11px]">
                                  🎓 {job.educationRequirement}
                                </span>
                              )}
                            </div>

                            {job.requiredSkills && job.requiredSkills.length > 0 && (
                              <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                                <span className="text-[11px] font-bold text-slate-600">Skills:</span>
                                {job.requiredSkills.map((skill, sIdx) => (
                                  <span
                                    key={sIdx}
                                    className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {job.status === 'approved' && (
                              <button
                                onClick={() => handleToggleJobPause(job)}
                                className="px-3 py-1.5 border border-slate-200 text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-100 flex items-center gap-1"
                              >
                                <Pause className="w-3.5 h-3.5" />
                                <span>Pause</span>
                              </button>
                            )}

                            {job.status === 'paused' && (
                              <button
                                onClick={() => handleToggleJobPause(job)}
                                className="px-3 py-1.5 border border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold text-xs rounded-lg hover:bg-emerald-100 flex items-center gap-1"
                              >
                                <Play className="w-3.5 h-3.5" />
                                <span>Resume</span>
                              </button>
                            )}

                            {!job.isFeatured && job.status === 'approved' && (
                              <button
                                onClick={() => handleFeatureJob(job.id, 7, 199)}
                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-lg shadow-xs flex items-center gap-1"
                                title="Promote to top of search for 7 days"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Promote (₹199)</span>
                              </button>
                            )}

                            {job.status === 'approved' && (
                              <button
                                onClick={() => {
                                  setSelectedMatchingJobId(job.id);
                                  setActiveTab('smart-talent-pool');
                                }}
                                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-lg border border-blue-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                                title="Discover AI-matched candidates for this vacancy"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                <span>Smart Talent Pool</span>
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                          <span>
                            {job.viewCount || 0} Views • {job.applicationCount || 0} Applications Received
                          </span>
                          <span>Deadline: {job.applicationDeadline}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* APPLICATIONS MANAGEMENT TAB */}
            {activeTab === 'applications' && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Candidate Applications ({applications.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Screen applicants, inspect resumes, schedule interviews, and make job offers.
                    </p>
                  </div>
                </div>

                {applications.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    No applications received yet.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {applications.map(app => (
                      <div key={app.id} className="py-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-slate-900 text-sm">{app.candidateName}</h4>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  app.status === 'Shortlisted'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : app.status === 'Interview Scheduled'
                                    ? 'bg-purple-100 text-purple-800'
                                    : app.status === 'Selected'
                                    ? 'bg-blue-600 text-white'
                                    : app.status === 'Rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {app.status}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 mt-0.5">
                              Applied for: <strong>{app.jobTitle}</strong> • {app.candidateDistrict}
                            </p>

                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {app.candidateMobile}
                              </span>
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-400" />
                                {app.candidateEmail}
                              </span>
                              <span>Exp: {app.candidateExperienceYears} yrs</span>
                            </div>
                          </div>

                          {/* Action Controls */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              onClick={() => handleUpdateAppStatus(app.id, 'Shortlisted', 'Shortlisted by recruiter')}
                              className="px-2.5 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg border border-emerald-200"
                            >
                              Shortlist
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAppForInterview(app);
                              }}
                              className="px-2.5 py-1.5 text-xs font-semibold bg-purple-50 text-purple-800 hover:bg-purple-100 rounded-lg border border-purple-200"
                            >
                              Schedule Interview
                            </button>
                            <button
                              onClick={() => handleUpdateAppStatus(app.id, 'Selected', 'Candidate hired')}
                              className="px-2.5 py-1.5 text-xs font-semibold bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-lg border border-blue-200"
                            >
                              Hire / Select
                            </button>
                            <button
                              onClick={() => handleUpdateAppStatus(app.id, 'Rejected', 'Does not meet current requirements')}
                              className="px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              Reject
                            </button>
                          </div>
                        </div>

                        {app.coverMessage && (
                          <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100">
                            <strong>Candidate Note:</strong> "{app.coverMessage}"
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-blue-600" />
                            <span>Resume: {app.resumeFileName || 'Resume.pdf'}</span>
                          </span>
                          <span>Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SMART TALENT POOL (AI CANDIDATE MATCHING) */}
            {activeTab === 'smart-talent-pool' && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-base">
                        Smart Talent Pool • AI Candidate Discovery
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Instantly matched candidates based on qualifications, skills, experience, and district without exposing private contact info.
                    </p>
                  </div>

                  {/* Vacancy Selector */}
                  {jobs.length > 0 && (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-semibold text-slate-600">Matching For:</span>
                      <select
                        value={selectedMatchingJobId}
                        onChange={e => setSelectedMatchingJobId(e.target.value)}
                        className="px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      >
                        {jobs.map(j => (
                          <option key={j.id} value={j.id}>
                            {j.title} ({j.district})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {invitationSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{invitationSuccessMsg}</span>
                  </div>
                )}

                {/* Privacy Banner */}
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center gap-2 text-xs text-blue-900">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    <strong>Privacy-Safe Matching:</strong> Candidate personal contact info is masked. Send a direct job invitation — interested candidates will review and apply directly.
                  </span>
                </div>

                {/* Matched Candidates List */}
                {(() => {
                  const currentJob = jobs.find(j => j.id === selectedMatchingJobId) || jobs[0];
                  if (!currentJob) {
                    return (
                      <div className="text-center py-12 text-slate-500 text-xs">
                        Please post a job vacancy first to view matched candidates in your Smart Talent Pool.
                      </div>
                    );
                  }

                  const allInvitations = db.getJobInvitations({ employerId });
                  const matchedCandidates = findMatchingCandidates(currentJob, candidates, allInvitations);

                  if (matchedCandidates.length === 0) {
                    return (
                      <div className="text-center py-12 text-slate-500 text-xs">
                        No candidates currently match this vacancy's specific requirements.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {matchedCandidates.map(({ candidate: cand, matchScore, matchReasons, isHighMatch, hasBeenInvited }) => (
                        <div
                          key={cand.id}
                          className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-blue-300 hover:shadow-xs"
                        >
                          <div className="flex items-start gap-3.5">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center shrink-0 text-base border border-blue-100">
                              {cand.fullName.charAt(0)}
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-slate-900 text-sm">{cand.fullName}</h4>
                                <span
                                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                    isHighMatch
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : 'bg-blue-100 text-blue-800 border border-blue-300'
                                  }`}
                                >
                                  <Sparkles className="w-3 h-3" />
                                  <span>{matchScore}% Match</span>
                                </span>
                                {hasBeenInvited && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                                    Invited
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-slate-600">
                                {cand.education?.highestQualification || 'Graduate'} • {cand.district}, Maharashtra •{' '}
                                {cand.experience?.isFresher ? 'Fresher' : `${cand.experience?.totalExperienceYears} yrs exp`}
                              </p>

                              {/* Why it matched */}
                              <div className="flex flex-wrap gap-1.5 pt-0.5">
                                {matchReasons.map((reason, rIdx) => (
                                  <span
                                    key={rIdx}
                                    className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-medium"
                                  >
                                    ✓ {reason}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="flex items-center gap-2 shrink-0">
                            {hasBeenInvited ? (
                              <button
                                disabled
                                className="px-4 py-2 bg-slate-100 text-slate-500 font-semibold text-xs rounded-xl border border-slate-200 cursor-not-allowed flex items-center gap-1.5"
                              >
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Invitation Sent</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSendJobInvitation(currentJob.id, cand.id, matchScore)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Send Job Invitation</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* CANDIDATE DATABASE SEARCH TAB (Section 9) */}
            {activeTab === 'candidate-search' && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm">
                    Maharashtra Candidate Database Search
                  </h3>
                  <p className="text-xs text-slate-500">
                    Discover local job seekers who have enabled employer discoverability across all 36 districts.
                  </p>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Skill Keyword</label>
                    <input
                      type="text"
                      value={candSkillFilter}
                      onChange={e => setCandSkillFilter(e.target.value)}
                      placeholder="e.g. React, CNC, Tally, Java..."
                      className="w-full px-3 py-2 text-xs border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
                    <select
                      value={candDistrictFilter}
                      onChange={e => setCandDistrictFilter(e.target.value)}
                      className="w-full px-3 py-2 text-xs border rounded-lg bg-white"
                    >
                      <option value="All">All Maharashtra Districts</option>
                      {MAHARASHTRA_DISTRICTS.map(d => (
                        <option key={d.id} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Privacy & Subscription Notice */}
                {!isSubscribedEmployer && (
                  <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold block">Candidate Contact & Resume Shield Active</span>
                        <p className="text-[11px] text-amber-800">
                          Direct phone numbers, email addresses, and full ATS Resumes are reserved for Subscribed Employers.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSubModalOpen(true)}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shrink-0 shadow-xs transition-colors self-start sm:self-center"
                    >
                      Upgrade to Unlock
                    </button>
                  </div>
                )}

                {/* Candidates List */}
                <div className="space-y-3 pt-2">
                  {candidates.map(cand => (
                    <div
                      key={cand.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 transition-shadow hover:shadow-xs"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-base">
                          {cand.fullName.charAt(0)}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-slate-900 text-sm">{cand.fullName}</h4>
                            {isSubscribedEmployer ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                Unlocked
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                <Lock className="w-3 h-3 text-amber-600" />
                                Contact Locked
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600">
                            {cand.education?.highestQualification || 'Graduate'} • {cand.district}, Maharashtra
                          </p>

                          {/* Contact Details (Subscribed vs Locked) */}
                          <div className="flex items-center gap-3 pt-1 text-xs">
                            {isSubscribedEmployer ? (
                              <>
                                <a
                                  href={`tel:${cand.mobile}`}
                                  className="inline-flex items-center gap-1 text-slate-700 hover:text-blue-600 font-medium"
                                >
                                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                                  <span>{cand.mobile}</span>
                                </a>
                                <a
                                  href={`mailto:${cand.email}`}
                                  className="inline-flex items-center gap-1 text-slate-700 hover:text-blue-600 font-medium"
                                >
                                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                                  <span>{cand.email}</span>
                                </a>
                              </>
                            ) : (
                              <div className="flex items-center gap-2 text-slate-400 text-xs">
                                <span className="inline-flex items-center gap-1">
                                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                                  <span>+91 98XXX XXXXX</span>
                                </span>
                                <span>•</span>
                                <span className="inline-flex items-center gap-1">
                                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                                  <span>c***@email.com</span>
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {cand.skills?.slice(0, 5).map((sk, i) => (
                              <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-medium">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isSubscribedEmployer ? (
                          <>
                            <button
                              onClick={() =>
                                alert(`Candidate Direct Contact:\nName: ${cand.fullName}\nPhone: ${cand.mobile}\nEmail: ${cand.email}\nDistrict: ${cand.district}`)
                              }
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-lg border border-blue-200 transition-colors"
                            >
                              Contact Info
                            </button>
                            <button
                              onClick={() =>
                                alert(`Downloading ATS Resume for ${cand.fullName} (${cand.resumeFileName || 'Resume.pdf'})`)
                              }
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-2xs flex items-center gap-1 transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Download Resume</span>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setSubModalOpen(true)}
                            className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Unlock Phone & Resume</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUBSCRIPTION & CREDITS TAB */}
            {activeTab === 'plans' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Subscription Plans & Balance</h3>
                    <p className="text-xs text-slate-500">
                      Manage employer job posting credits and active hiring packages.
                    </p>
                  </div>
                  <button
                    onClick={() => setSubModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-xs hover:bg-blue-700"
                  >
                    Upgrade / Renew Plan
                  </button>
                </div>

                <div className="p-5 bg-blue-50/80 rounded-2xl border border-blue-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-xs text-slate-500">Active Package:</span>
                    <p className="text-xl font-bold text-blue-900">{subscription?.planName}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">Remaining Job Credits:</span>
                    <p className="text-2xl font-black text-blue-700">{subscription?.remainingCredits ?? 0}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">Valid Until:</span>
                    <p className="text-sm font-bold text-slate-800">
                      {subscription?.expiryDate
                        ? new Date(subscription.expiryDate).toLocaleDateString()
                        : 'Unlimited'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* COMPANY PROFILE & KYC VERIFICATION TAB (Section 7) */}
            {activeTab === 'company' && company && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Company Profile & KYC</h3>
                    <p className="text-xs text-slate-500">
                      Submit business documents (GSTIN / Udyam / Incorporation) to receive the verified badge.
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      company.verificationStatus === 'Verified'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Status: {company.verificationStatus}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Company Name</label>
                    <input
                      type="text"
                      value={company.name}
                      onChange={e => setCompany({ ...company, name: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Industry Sector</label>
                    <input
                      type="text"
                      value={company.industry}
                      onChange={e => setCompany({ ...company, industry: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={company.contactEmail}
                      onChange={e => setCompany({ ...company, contactEmail: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Contact Mobile</label>
                    <input
                      type="tel"
                      value={company.contactPhone}
                      onChange={e => setCompany({ ...company, contactPhone: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-semibold mb-1">About Company</label>
                    <textarea
                      rows={3}
                      value={company.about}
                      onChange={e => setCompany({ ...company, about: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                </div>

                {/* Document Upload Section */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900">
                    Business Verification Document (Certificate / Udyam / GST)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Current Document: <strong>{company.verificationDocumentType || 'Incorporation Certificate'}</strong>
                  </p>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-50">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New Business Proof</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.png"
                      className="hidden"
                      onChange={e => {
                        if (e.target.files?.[0]) {
                          const f = e.target.files[0];
                          db.updateCompany(company.id, {
                            verificationDocumentType: f.name,
                            verificationStatus: 'Pending'
                          });
                          refreshData();
                          alert('Business proof document uploaded and sent for Admin verification.');
                        }
                      }}
                    />
                  </label>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      db.updateCompany(company.id, company);
                      alert('Company profile saved successfully!');
                    }}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* PAYMENTS TAB */}
            {activeTab === 'payments' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-base">Payment History & Invoices</h3>
                  <span className="text-xs text-slate-400">Secured with Razorpay Gateway</span>
                </div>

                <div className="space-y-3">
                  {db.getPayments(employerId).map(pay => (
                    <div
                      key={pay.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4 text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{pay.planName}</p>
                        <p className="text-slate-500 text-[11px]">
                          Order ID: {pay.orderId} • Method: {pay.paymentMethod}
                        </p>
                        <p className="text-slate-400 text-[10px]">
                          {new Date(pay.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900">₹{pay.amount}</span>
                        <span className="block text-[10px] font-bold text-emerald-700">
                          {pay.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* SCHEDULE INTERVIEW MODAL */}
      {selectedAppForInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                Schedule Interview: {selectedAppForInterview.candidateName}
              </h3>
              <button onClick={() => setSelectedAppForInterview(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleConfirmInterview} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Interview Date</label>
                <input
                  type="date"
                  required
                  value={interviewDate}
                  onChange={e => setInterviewDate(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Time & Timezone</label>
                <input
                  type="text"
                  required
                  value={interviewTime}
                  onChange={e => setInterviewTime(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Meeting Link or Office Address</label>
                <input
                  type="text"
                  required
                  value={interviewLocation}
                  onChange={e => setInterviewLocation(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Notes / Instructions</label>
                <textarea
                  rows={2}
                  value={interviewNote}
                  onChange={e => setInterviewNote(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAppForInterview(null)}
                  className="px-4 py-2 border rounded-lg text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                >
                  Confirm & Notify Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post Job Modal */}
      <PostJobModal
        isOpen={postJobOpen}
        onClose={() => setPostJobOpen(false)}
        onJobCreated={refreshData}
        onOpenSubscriptionPlans={() => {
          setPostJobOpen(false);
          setSubModalOpen(true);
        }}
      />

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={subModalOpen}
        onClose={() => setSubModalOpen(false)}
        onSubscriptionUpdated={refreshData}
      />
    </div>
  );
};
