'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Building,
  Briefcase,
  CreditCard,
  Receipt,
  FileCheck2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Database,
  History,
  TrendingUp,
  Search,
  Check,
  X,
  ExternalLink,
  RotateCcw,
  Copy,
  DollarSign,
  Plus,
  Smartphone
} from 'lucide-react';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { AdminLoginPage } from './AdminLoginPage';
import {
  Job,
  Company,
  CandidateProfile,
  SubscriptionPlan,
  AuditLog,
  PaymentTransaction,
  OtpAdminStats
} from '../../types';


interface AdminDashboardProps {
  onNavigateHome?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateHome }) => {
  const { user, logout } = useAuth();

  const handleSignOut = () => {
    logout();
    if (onNavigateHome) {
      onNavigateHome();
    }
  };
  const [activeTab, setActiveTab] = useState('overview');

  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [rejectionModalJob, setRejectionModalJob] = useState<Job | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Duplicate or incomplete job description');

  // OTP Audit & Statistics
  const [otpStats, setOtpStats] = useState<OtpAdminStats | null>(null);
  const [otpPurposeFilter, setOtpPurposeFilter] = useState<'all' | 'candidate_registration' | 'employer_registration'>('all');
  const [otpStatusFilter, setOtpStatusFilter] = useState<'all' | 'verified' | 'failed' | 'expired'>('all');

  // Editable Plan Modal
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  const loadData = () => {
    // Admin gets all jobs including pending and rejected
    const allJobs = db.getJobs({ status: undefined });
    // Also include pending jobs explicitly
    const pendingJobs = (db as any).jobs || [];
    setJobs(pendingJobs.length > 0 ? pendingJobs : allJobs);
    setCompanies(db.getCompanies());
    setCandidates(db.getCandidates());
    setPlans(db.getSubscriptionPlans());
    setPayments(db.getPayments());
    setAuditLogs(db.getAuditLogs());
    setOtpStats(db.getOtpAdminStats());
  };


  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Global KPIs (Section 10)
  const totalCandidates = candidates.length;
  const totalEmployers = companies.length;
  const verifiedEmployers = companies.filter(c => c.verificationStatus === 'Verified').length;
  const pendingEmployerApprovals = companies.filter(c => c.verificationStatus === 'Pending').length;
  const totalJobsCount = jobs.length;
  const activeJobsCount = jobs.filter(j => j.status === 'approved').length;
  const pendingJobs = jobs.filter(j => j.status === 'pending');
  const pendingJobsCount = pendingJobs.length;
  const totalApplications = db.getApplications().length;
  const totalRevenue = payments
    .filter(p => p.status === 'Successful')
    .reduce((sum, p) => sum + p.amount, 0);

  const handleApproveJob = (jobId: string) => {
    db.approveJob(jobId, user?.fullName || 'Super Administrator');
    loadData();
  };

  const handleRejectJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionModalJob) return;
    db.rejectJob(rejectionModalJob.id, rejectionReason, user?.fullName || 'Super Administrator');
    setRejectionModalJob(null);
    loadData();
  };

  const handleVerifyCompany = (companyId: string, status: 'Verified' | 'Rejected') => {
    const note = status === 'Verified' ? 'Documents checked and approved' : 'Invalid documents';
    db.verifyEmployer(companyId, status, note, user?.fullName || 'Super Administrator');
    loadData();
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    db.updateSubscriptionPlan(editingPlan.id, {
      price: Number(editingPlan.price),
      jobPostingLimit: Number(editingPlan.jobPostingLimit),
      validityDays: Number(editingPlan.validityDays)
    });
    setEditingPlan(null);
    loadData();
  };

  const sidebarLinks = [
    { id: 'overview', label: 'Dashboard Overview', icon: TrendingUp },
    { id: 'jobs', label: `Job Approvals (${pendingJobsCount} Pending)`, icon: Briefcase },
    { id: 'employers', label: `Employer KYC (${pendingEmployerApprovals} Pending)`, icon: Building },
    { id: 'candidates', label: `Candidates (${totalCandidates})`, icon: Users },
    { id: 'subscriptions', label: 'Subscription Plans', icon: CreditCard },
    { id: 'payments', label: 'Revenue & Payments', icon: Receipt },
    { id: 'recruitment', label: 'Recruitment Requests', icon: FileCheck2 },
    { id: 'otp_audit', label: 'SMS OTP Audit (MSG91)', icon: Smartphone },
    { id: 'audit', label: 'Audit Logs', icon: History }
  ];


  if (!user || user.role !== 'super_admin') {
    return <AdminLoginPage onLoginSuccess={loadData} />;
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Banner */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-xs">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">Super Admin Control Center</h1>
                <span className="bg-blue-500/30 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-400/40">
                  Govt of Maharashtra
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Central oversight for candidates, employer verification, job moderation, and subscriptions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 hidden sm:inline">
              Logged in as: <strong>{user?.fullName}</strong>
            </span>
            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="col-span-1 bg-white p-3 rounded-2xl border border-slate-200 h-fit space-y-1">
            {sidebarLinks.map(link => {
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl text-left transition-colors ${
                    activeTab === link.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </aside>

          {/* Main Workspace */}
          <main className="col-span-1 md:col-span-3 space-y-6">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* 8 Primary Metric Cards (Section 10) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Total Candidates</span>
                    <p className="text-2xl font-black text-slate-900 mt-1">{totalCandidates}</p>
                    <span className="text-[10px] text-emerald-600 font-semibold">Free Registered</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Total Employers</span>
                    <p className="text-2xl font-black text-slate-900 mt-1">{totalEmployers}</p>
                    <span className="text-[10px] text-blue-600 font-semibold">{verifiedEmployers} Verified</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Pending Approvals</span>
                    <p className="text-2xl font-black text-amber-600 mt-1">
                      {pendingJobsCount + pendingEmployerApprovals}
                    </p>
                    <span className="text-[10px] text-amber-600 font-semibold">Needs Attention</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Total Revenue</span>
                    <p className="text-2xl font-black text-emerald-700 mt-1">
                      ₹{totalRevenue.toLocaleString('en-IN')}
                    </p>
                    <span className="text-[10px] text-slate-400">Employer Packages</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Total Jobs Listed</span>
                    <p className="text-2xl font-black text-slate-900 mt-1">{totalJobsCount}</p>
                    <span className="text-[10px] text-slate-400">{activeJobsCount} Active Live</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Job Applications</span>
                    <p className="text-2xl font-black text-slate-900 mt-1">{totalApplications}</p>
                    <span className="text-[10px] text-slate-400">Candidate Submissions</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Pending Jobs</span>
                    <p className="text-2xl font-black text-amber-600 mt-1">{pendingJobsCount}</p>
                    <span className="text-[10px] text-amber-600 font-medium">Require moderation</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Maharashtra Districts</span>
                    <p className="text-2xl font-black text-slate-900 mt-1">36</p>
                    <span className="text-[10px] text-blue-600 font-medium">100% Coverage</span>
                  </div>
                </div>

                {/* Pending Actions Feed */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm">
                    Pending Jobs Moderation Queue ({pendingJobsCount})
                  </h3>

                  {pendingJobsCount === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      All job vacancies are up-to-date and moderated.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingJobs.map(job => (
                        <div
                          key={job.id}
                          className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900 text-sm">{job.title}</h4>
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                Pending
                              </span>
                            </div>
                            <p className="text-slate-600 mt-0.5">
                              {job.companyName} • {job.district} • ₹{job.salaryMin.toLocaleString('en-IN')} - ₹{job.salaryMax.toLocaleString('en-IN')} / {job.salaryType}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApproveJob(job.id)}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg flex items-center gap-1 shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => setRejectionModalJob(job)}
                              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg flex items-center gap-1 shadow-xs"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* JOB APPROVALS TAB */}
            {activeTab === 'jobs' && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm">
                    Job Management & Moderation ({jobs.length} Total)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Review and verify job postings before they go live on public search.
                  </p>
                </div>

                <div className="space-y-3">
                  {jobs.map(job => (
                    <div
                      key={job.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-slate-300"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{job.title}</h4>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              job.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : job.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {job.status}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-0.5">
                          {job.companyName} • {job.district} • {job.category}
                        </p>
                        <p className="text-slate-400 text-[11px] mt-0.5">
                          Posted: {new Date(job.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {job.status !== 'approved' && (
                          <button
                            onClick={() => handleApproveJob(job.id)}
                            className="px-3 py-1.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                        )}
                        {job.status !== 'rejected' && (
                          <button
                            onClick={() => setRejectionModalJob(job)}
                            className="px-3 py-1.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EMPLOYER KYC TAB */}
            {activeTab === 'employers' && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm">
                    Employer Business Document Verification
                  </h3>
                  <p className="text-xs text-slate-500">
                    Inspect Udyam / GST / Registration proof and grant verified badges.
                  </p>
                </div>

                <div className="space-y-3">
                  {companies.map(comp => (
                    <div
                      key={comp.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{comp.name}</h4>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              comp.verificationStatus === 'Verified'
                                ? 'bg-emerald-100 text-emerald-800'
                                : comp.verificationStatus === 'Pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {comp.verificationStatus}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-0.5">
                          {comp.district} • {comp.industry} • Contact: {comp.contactEmail}
                        </p>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          Document: <strong>{comp.verificationDocumentType || 'Pending Upload'}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {comp.verificationStatus !== 'Verified' && (
                          <button
                            onClick={() => handleVerifyCompany(comp.id, 'Verified')}
                            className="px-3 py-1.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700"
                          >
                            Verify & Approve
                          </button>
                        )}
                        {comp.verificationStatus !== 'Rejected' && (
                          <button
                            onClick={() => handleVerifyCompany(comp.id, 'Rejected')}
                            className="px-3 py-1.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700"
                          >
                            Reject Proof
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CANDIDATES TAB */}
            {activeTab === 'candidates' && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm">
                    Candidate User Accounts ({candidates.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    All registered job seekers across Maharashtra. Free service guaranteed.
                  </p>
                </div>

                <div className="space-y-3">
                  {candidates.map(cand => (
                    <div
                      key={cand.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{cand.fullName}</h4>
                        <p className="text-slate-600 mt-0.5">
                          {cand.email} • {cand.mobile} • {cand.district}
                        </p>
                        <p className="text-slate-400 text-[11px]">
                          Qualification: {cand.education?.highestQualification}
                        </p>
                      </div>

                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 font-semibold rounded-full text-[10px]">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUBSCRIPTION PLANS MANAGER (Section 8 & 10) */}
            {activeTab === 'subscriptions' && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm">
                    Employer Subscription Plans Configuration
                  </h3>
                  <p className="text-xs text-slate-500">
                    Database-driven plan pricing and job posting limits. Edit values dynamically.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {plans.map(plan => (
                    <div
                      key={plan.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">{plan.name}</span>
                        <span className="font-black text-blue-600 text-base">
                          {plan.price === 0 ? 'FREE' : `₹${plan.price}`}
                        </span>
                      </div>
                      <p className="text-slate-600">{plan.description}</p>
                      <div className="pt-2 border-t border-slate-200 flex justify-between text-slate-500">
                        <span>Job Limit: <strong>{plan.jobPostingLimit}</strong></span>
                        <span>Validity: <strong>{plan.validityDays} Days</strong></span>
                      </div>
                      <button
                        onClick={() => setEditingPlan(plan)}
                        className="w-full mt-2 py-1.5 bg-white border border-slate-300 font-semibold text-slate-700 rounded-lg hover:bg-slate-100"
                      >
                        Edit Plan Details
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* REVENUE & PAYMENTS TAB */}
            {activeTab === 'payments' && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm">
                    Payment Gateway Transactions ({payments.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Live Razorpay order and payment signature verification records.
                  </p>
                </div>

                <div className="space-y-3">
                  {payments.map(p => (
                    <div
                      key={p.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{p.companyName} • {p.planName}</p>
                        <p className="text-slate-500 text-[11px]">
                          Order ID: {p.orderId} • Payment ID: {p.paymentId || 'N/A'} • {p.paymentMethod}
                        </p>
                        <p className="text-slate-400 text-[10px]">
                          {new Date(p.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900">₹{p.amount}</span>
                        <span className="block text-[10px] font-bold text-emerald-700">
                          {p.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AUDIT LOGS TAB (Section 10) */}
            {activeTab === 'audit' && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm">
                    Administrative Action Audit Trail
                  </h3>
                  <p className="text-xs text-slate-500">
                    Immutable chronological record of all administrative approvals, modifications, and pricing updates.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {auditLogs.map(log => (
                    <div
                      key={log.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-start gap-3"
                    >
                      <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{log.action}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-0.5 leading-relaxed">{log.details}</p>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          By: {log.adminName}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* SMS OTP AUDIT & MSG91 ANALYTICS                          */}
            {/* ======================================================== */}
            {activeTab === 'otp_audit' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-900">
                          SMS OTP Gateway & Verification Audit
                        </h2>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">
                          MSG91 v5 Active
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Real-time tracking of registration OTP challenges, verification rates, and SMS delivery costs.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Est. SMS Spend:</span>
                      <span className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 font-bold text-xs rounded-lg">
                        ₹{otpStats?.estimatedCostInr.toFixed(2) || '0.00'} INR
                      </span>
                    </div>
                  </div>

                  {/* 5 KPI Metric Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-[11px] text-slate-500 font-medium">Total OTP Requests</p>
                      <p className="text-xl font-bold text-slate-900 mt-1">
                        {otpStats?.totalRequests || 0}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">TRAI 6-digit OTPs</p>
                    </div>

                    <div className="p-3.5 bg-green-50/60 rounded-xl border border-green-200">
                      <p className="text-[11px] text-green-700 font-medium">Verified Registrations</p>
                      <p className="text-xl font-bold text-green-700 mt-1">
                        {otpStats?.successfulVerifications || 0}
                      </p>
                      <p className="text-[10px] text-green-600 mt-0.5">
                        {otpStats?.totalRequests
                          ? `${Math.round((otpStats.successfulVerifications / otpStats.totalRequests) * 100)}% Success Rate`
                          : '100%'}
                      </p>
                    </div>

                    <div className="p-3.5 bg-red-50/60 rounded-xl border border-red-200">
                      <p className="text-[11px] text-red-700 font-medium">Failed Attempts</p>
                      <p className="text-xl font-bold text-red-700 mt-1">
                        {otpStats?.failedVerifications || 0}
                      </p>
                      <p className="text-[10px] text-red-600 mt-0.5">&gt;5 failed codes</p>
                    </div>

                    <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200">
                      <p className="text-[11px] text-amber-700 font-medium">Expired Sessions</p>
                      <p className="text-xl font-bold text-amber-700 mt-1">
                        {otpStats?.expiredChallenges || 0}
                      </p>
                      <p className="text-[10px] text-amber-600 mt-0.5">&gt;5 mins unused</p>
                    </div>

                    <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200">
                      <p className="text-[11px] text-blue-700 font-medium">Candidate / Employer</p>
                      <p className="text-xl font-bold text-blue-900 mt-1">
                        {otpStats?.candidateRegistrations || 0} / {otpStats?.employerRegistrations || 0}
                      </p>
                      <p className="text-[10px] text-blue-600 mt-0.5">Verified Accounts</p>
                    </div>
                  </div>

                  {/* 7-Day Activity Chart */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-700">
                        7-Day OTP Activity Trend
                      </span>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                          Requested
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                          Verified
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2 h-24 items-end pt-4">
                      {otpStats?.requestsByDate.map((item, idx) => {
                        const maxVal = Math.max(...(otpStats?.requestsByDate.map(d => d.requests) || [1]), 1);
                        const reqHeight = Math.max(15, Math.round((item.requests / maxVal) * 100));
                        const verHeight = item.requests > 0 
                          ? Math.max(10, Math.round((item.verified / maxVal) * 100))
                          : 0;

                        return (
                          <div key={idx} className="flex flex-col items-center gap-1">
                            <div className="w-full flex items-end justify-center gap-1 h-16">
                              <div
                                style={{ height: `${reqHeight}%` }}
                                className="w-3 bg-blue-500/80 rounded-t-sm"
                                title={`Requested: ${item.requests}`}
                              />
                              <div
                                style={{ height: `${verHeight}%` }}
                                className="w-3 bg-green-500 rounded-t-sm"
                                title={`Verified: ${item.verified}`}
                              />
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 truncate w-full text-center">
                              {item.date}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Privacy & Security Architecture Note */}
                  <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-xs text-blue-900 mb-6 flex items-start gap-2.5">
                    <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong>Security Guarantee:</strong> OTP codes are delivered securely via MSG91 SMS gateway and verified directly via MSG91 API without storing plain OTPs in the database. Successful verifications generate a single-use SHA-256 hashed approval token valid for 10 minutes.
                    </p>
                  </div>

                  {/* Filters for Recent OTP Logs */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
                    <h3 className="text-xs font-bold text-slate-800">
                      Recent Verification Challenge Logs
                    </h3>

                    <div className="flex items-center gap-2">
                      <select
                        value={otpPurposeFilter}
                        onChange={e => setOtpPurposeFilter(e.target.value as any)}
                        className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
                      >
                        <option value="all">All Purposes</option>
                        <option value="candidate_registration">Candidate Registration</option>
                        <option value="employer_registration">Employer Registration</option>
                      </select>

                      <select
                        value={otpStatusFilter}
                        onChange={e => setOtpStatusFilter(e.target.value as any)}
                        className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
                      >
                        <option value="all">All Statuses</option>
                        <option value="verified">Verified Only</option>
                        <option value="failed">Failed Only</option>
                        <option value="expired">Expired Only</option>
                      </select>
                    </div>
                  </div>

                  {/* OTP Challenge Logs Table */}
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="px-4 py-2.5">Masked Mobile</th>
                          <th className="px-4 py-2.5">Registration Purpose</th>
                          <th className="px-4 py-2.5">Verification Status</th>
                          <th className="px-4 py-2.5">Attempts</th>
                          <th className="px-4 py-2.5">Created At</th>
                          <th className="px-4 py-2.5">Verified At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {otpStats?.recentLogs
                          .filter(log => otpPurposeFilter === 'all' || log.purpose === otpPurposeFilter)
                          .filter(log => otpStatusFilter === 'all' || log.status === otpStatusFilter)
                          .map(log => (
                            <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="px-4 py-3 font-mono font-medium text-slate-900">
                                {log.phoneMasked}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                    log.purpose === 'candidate_registration'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-purple-100 text-purple-800'
                                  }`}
                                >
                                  {log.purpose === 'candidate_registration' ? 'Candidate' : 'Employer'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                    log.status === 'verified'
                                      ? 'bg-green-100 text-green-800'
                                      : log.status === 'failed'
                                      ? 'bg-red-100 text-red-800'
                                      : log.status === 'expired'
                                      ? 'bg-slate-100 text-slate-600'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {log.status === 'verified' && <Check className="w-3 h-3" />}
                                  {log.status === 'failed' && <X className="w-3 h-3" />}
                                  {log.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-600 font-mono">
                                {log.attempts} / 5
                              </td>
                              <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                                {new Date(log.createdAt).toLocaleString('en-IN', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </td>
                              <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                                {log.verifiedAt ? (
                                  <span className="text-green-700 font-medium">
                                    {new Date(log.verifiedAt).toLocaleString('en-IN', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* REJECTION REASON MODAL */}
      {rejectionModalJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-md w-full space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">
              Reject Job: {rejectionModalJob.title}
            </h3>
            <p className="text-xs text-slate-500">
              Please specify the reason for rejecting this vacancy. 1 job posting credit will be refunded to the employer.
            </p>
            <form onSubmit={handleRejectJobSubmit} className="space-y-3 text-xs">
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectionModalJob(null)}
                  className="px-4 py-2 border rounded-lg text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700"
                >
                  Confirm Rejection & Refund Credit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PLAN MODAL */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-sm w-full space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Edit {editingPlan.name}</h3>
            <form onSubmit={handleSavePlan} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={editingPlan.price}
                  onChange={e => setEditingPlan({ ...editingPlan, price: Number(e.target.value) })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Job Postings Limit</label>
                <input
                  type="number"
                  value={editingPlan.jobPostingLimit}
                  onChange={e => setEditingPlan({ ...editingPlan, jobPostingLimit: Number(e.target.value) })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Validity (Days)</label>
                <input
                  type="number"
                  value={editingPlan.validityDays}
                  onChange={e => setEditingPlan({ ...editingPlan, validityDays: Number(e.target.value) })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 border rounded-lg text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
