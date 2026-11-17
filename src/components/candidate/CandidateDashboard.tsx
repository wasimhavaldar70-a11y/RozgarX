'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  User,
  FileText,
  Briefcase,
  Bookmark,
  Bell,
  Settings,
  LogOut,
  MapPin,
  Clock,
  CheckCircle,
  Building,
  Upload,
  Download,
  Eye,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Send
} from 'lucide-react';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { CandidateProfile, JobApplication, Job, JobInvitation } from '../../types';
import { MAHARASHTRA_DISTRICTS } from '../../data/maharashtra';
import { findMatchingJobs } from '../../services/matchingService';
import { ResumeBuilder } from './ResumeBuilder';

interface CandidateDashboardProps {
  initialTab?: string;
  onTabChange?: (tab: string) => void;
  onNavigateToFindJobs: () => void;
  onViewJob: (job: Job) => void;
  onNavigateHome?: () => void;
}

export const CandidateDashboard: React.FC<CandidateDashboardProps> = ({
  initialTab = 'overview',
  onTabChange,
  onNavigateToFindJobs,
  onViewJob,
  onNavigateHome
}) => {
  const { user, candidateProfile, logout, savedJobIds, toggleSaveJob } = useAuth();

  const handleSignOut = () => {
    logout();
    if (onNavigateHome) {
      onNavigateHome();
    }
  };
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
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
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [profile, setProfile] = useState<CandidateProfile | null>(candidateProfile);
  const [invitations, setInvitations] = useState<JobInvitation[]>([]);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resumeText, setResumeText] = useState(
    profile?.resumeSummary ||
      'Software developer experienced in React, TypeScript, and PostgreSQL with a passion for building user-centric applications.'
  );

  const refreshCandidateData = () => {
    if (user?.candidateId || user?.id) {
      const candId = user.candidateId || user.id;
      const apps = db.getApplications({ candidateId: candId });
      setApplications(apps);
      const cp = db.getCandidateById(candId);
      if (cp) setProfile(cp);
      setInvitations(db.getJobInvitations({ candidateId: candId }));
      setAllJobs(db.getJobs());
    }
  };

  useEffect(() => {
    refreshCandidateData();
  }, [user, activeTab]);

  // Matching & Statistics
  const matchedJobs = profile ? findMatchingJobs(profile, allJobs) : [];
  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');
  const totalApps = applications.length;
  const underReview = applications.filter(a => a.status === 'Applied' || a.status === 'Viewed').length;
  const shortlisted = applications.filter(a => a.status === 'Shortlisted' || a.status === 'Interview Scheduled').length;
  const rejected = applications.filter(a => a.status === 'Rejected').length;
  const savedJobsList = db.getJobs().filter(j => savedJobIds.includes(j.id));

  const handleRespondInvitation = (inv: JobInvitation, status: 'accepted' | 'declined') => {
    db.respondToJobInvitation(inv.id, status);
    refreshCandidateData();
    if (status === 'accepted') {
      const targetJob = allJobs.find(j => j.id === inv.jobId);
      if (targetJob) {
        onViewJob(targetJob);
      }
    }
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    db.updateCandidateProfile(profile.id, {
      ...profile,
      resumeSummary: resumeText
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleWithdraw = (appId: string) => {
    if (confirm('Are you sure you want to withdraw this application?')) {
      db.updateApplicationStatus(appId, 'Withdrawn', 'Candidate withdrew application');
      setApplications(db.getApplications({ candidateId: profile?.id }));
    }
  };

  const sidebarLinks = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'smart-jobs', label: `Smart Job Match (${matchedJobs.length})`, icon: Sparkles },
    { id: 'invitations', label: `Employer Invitations (${pendingInvitations.length})`, icon: Mail },
    { id: 'applications', label: `My Applications (${totalApps})`, icon: Briefcase },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'resume', label: 'My Resume & CV', icon: FileText },
    { id: 'saved', label: `Saved Jobs (${savedJobIds.length})`, icon: Bookmark },
    { id: 'settings', label: 'Account Settings', icon: Settings }
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Greeting */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl overflow-hidden shrink-0">
              {profile?.profilePhoto ? (
                <img src={profile.profilePhoto} alt="" className="w-full h-full object-cover" />
              ) : (
                profile?.fullName?.charAt(0) || 'W'
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">
                  Welcome back, {profile?.fullName || user?.fullName}!
                </h1>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Job Seeker Active
                </span>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Phone className="w-2.5 h-2.5 text-blue-600" />
                  Phone Verified (SMS OTP)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {profile?.city ? `${profile.city}, ` : ''}
                  {profile?.district || 'Kolhapur'}, Maharashtra • Free Candidate Tier
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onNavigateToFindJobs}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
            >
              Search New Jobs
            </button>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Menu */}
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
                {/* 4 Overview Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Total Applications</span>
                    <p className="text-2xl font-black text-slate-900 mt-1">{totalApps}</p>
                    <span className="text-[10px] text-blue-600 font-medium">Submitted for free</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Under Review</span>
                    <p className="text-2xl font-black text-amber-600 mt-1">{underReview}</p>
                    <span className="text-[10px] text-slate-400">Viewed by recruiters</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Shortlisted</span>
                    <p className="text-2xl font-black text-emerald-600 mt-1">{shortlisted}</p>
                    <span className="text-[10px] text-emerald-600 font-medium">Interviews in progress</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Saved Jobs</span>
                    <p className="text-2xl font-black text-slate-900 mt-1">{savedJobIds.length}</p>
                    <span className="text-[10px] text-slate-400">Bookmarked to apply</span>
                  </div>
                </div>

                {/* Pending Direct Employer Invitations Alert */}
                {pendingInvitations.length > 0 && (
                  <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">
                          You have {pendingInvitations.length} Direct Job Invitation{pendingInvitations.length > 1 ? 's' : ''}!
                        </h4>
                        <p className="text-xs text-blue-100">
                          Employers reviewed your qualifications and invited you to apply directly.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => switchTab('invitations')}
                      className="px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
                    >
                      View Invitations
                    </button>
                  </div>
                )}

                {/* Smart Job Matches Widget */}
                {matchedJobs.length > 0 && (
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <h3 className="font-bold text-slate-900 text-sm">
                          Smart Job Matches for Your Profile
                        </h3>
                      </div>
                      <button
                        onClick={() => switchTab('smart-jobs')}
                        className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                      >
                        See All ({matchedJobs.length})
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {matchedJobs.slice(0, 2).map(({ job, matchScore, matchReasons }) => (
                        <div
                          key={job.id}
                          className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-all flex flex-col justify-between gap-2"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{job.title}</h4>
                              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                                {matchScore}% Match
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium">{job.companyName} • {job.district}</p>
                            <p className="text-[10px] text-slate-600 mt-1 line-clamp-1">
                              ✓ {matchReasons[0]}
                            </p>
                          </div>
                          <button
                            onClick={() => onViewJob(job)}
                            className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] rounded-lg transition-colors cursor-pointer"
                          >
                            View & Apply
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Application Tracker */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                    <h3 className="font-bold text-slate-900 text-sm">
                      Recent Application Status Tracker
                    </h3>
                    <button
                      onClick={() => switchTab('applications')}
                      className="text-xs text-blue-600 font-semibold hover:underline"
                    >
                      View All ({totalApps})
                    </button>
                  </div>

                  {applications.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      <p>You haven’t applied for any jobs yet.</p>
                      <button
                        onClick={onNavigateToFindJobs}
                        className="mt-2 text-blue-600 font-semibold hover:underline"
                      >
                        Explore Maharashtra Job Vacancies
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {applications.slice(0, 3).map(app => (
                        <div
                          key={app.id}
                          className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm">{app.jobTitle}</h4>
                              <p className="text-xs text-slate-600 mt-0.5">{app.companyName}</p>
                            </div>
                            <span
                              className={`self-start px-2.5 py-1 rounded-full text-xs font-bold ${
                                app.status === 'Shortlisted'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : app.status === 'Interview Scheduled'
                                  ? 'bg-purple-100 text-purple-800'
                                  : app.status === 'Rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {app.status}
                            </span>
                          </div>

                          {/* Status timeline badges */}
                          <div className="flex items-center gap-2 overflow-x-auto text-[11px] py-1 border-t border-slate-200/60">
                            {['Applied', 'Viewed', 'Shortlisted', 'Interview Scheduled', 'Selected'].map(
                              (step, idx) => {
                                const isPassed = app.statusHistory.some(h => h.status === step) || app.status === step;
                                return (
                                  <div
                                    key={step}
                                    className={`px-2 py-0.5 rounded flex items-center gap-1 ${
                                      isPassed
                                        ? 'bg-blue-600 text-white font-semibold'
                                        : 'bg-slate-200 text-slate-500'
                                    }`}
                                  >
                                    <span>{step}</span>
                                  </div>
                                );
                              }
                            )}
                          </div>

                          {app.interviewDate && (
                            <div className="p-3 bg-purple-50 rounded-lg text-xs text-purple-900 border border-purple-200">
                              <p className="font-bold">Scheduled Interview:</p>
                              <p className="mt-0.5">
                                Date: {app.interviewDate} at {app.interviewTime || '11:00 AM IST'}
                              </p>
                              {app.interviewLocationOrLink && (
                                <p className="mt-0.5 text-purple-700">
                                  Venue / Link: {app.interviewLocationOrLink}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SMART JOB MATCH TAB */}
            {activeTab === 'smart-jobs' && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-base">
                        Smart Job Match • Recommended for You
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Matched to your education ({profile?.education?.highestQualification || 'Graduate'}), skills, experience, and district ({profile?.district}).
                    </p>
                  </div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 shrink-0 self-start sm:self-center">
                    {matchedJobs.length} Matches Found
                  </span>
                </div>

                {matchedJobs.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    <p>No jobs currently match your profile criteria.</p>
                    <button
                      onClick={onNavigateToFindJobs}
                      className="mt-2 text-blue-600 font-semibold hover:underline"
                    >
                      Browse All Vacancies
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {matchedJobs.map(({ job, matchScore, matchReasons, isHighMatch }) => (
                      <div
                        key={job.id}
                        className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                            {job.companyLogo ? (
                              <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-cover" />
                            ) : (
                              <Building className="w-6 h-6 text-slate-400" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4
                                className="font-bold text-slate-900 text-sm hover:text-blue-600 cursor-pointer"
                                onClick={() => onViewJob(job)}
                              >
                                {job.title}
                              </h4>
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
                            </div>

                            <p className="text-xs text-slate-600">
                              <strong className="text-slate-800">{job.companyName}</strong> • {job.district}, Maharashtra • ₹{job.salaryMin.toLocaleString('en-IN')} - ₹{job.salaryMax.toLocaleString('en-IN')} / {job.salaryType}
                            </p>

                            {/* Why it matched */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {matchReasons.map((reason, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-medium"
                                >
                                  ✓ {reason}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => onViewJob(job)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                          >
                            View & Apply Free
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* EMPLOYER INVITATIONS TAB */}
            {activeTab === 'invitations' && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                        <Mail className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-base">
                        Direct Employer Invitations
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Exclusive job invitations sent directly to you by hiring employers on RozgarX.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shrink-0 self-start sm:self-center">
                    {invitations.length} Total Received
                  </span>
                </div>

                {invitations.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    <Mail className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p>No employer invitations received yet.</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Keep your profile and skills up-to-date so employers can discover and invite you.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invitations.map(inv => (
                      <div
                        key={inv.id}
                        className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-base">
                            {inv.companyName.charAt(0)}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-slate-900 text-sm">{inv.jobTitle}</h4>
                              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {inv.matchScore}% Match
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  inv.status === 'accepted'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : inv.status === 'declined'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {inv.status.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-slate-700">
                              {inv.companyName} • {inv.district}, Maharashtra
                            </p>
                            {inv.message && (
                              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-1">
                                "{inv.message}"
                              </p>
                            )}
                            <span className="text-[10px] text-slate-400 block pt-0.5">
                              Received {new Date(inv.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {inv.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleRespondInvitation(inv, 'accepted')}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Accept & Apply</span>
                              </button>
                              <button
                                onClick={() => handleRespondInvitation(inv, 'declined')}
                                className="px-3 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                              >
                                Decline
                              </button>
                            </>
                          ) : inv.status === 'accepted' ? (
                            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              <span>Accepted & Applied</span>
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-slate-400">
                              Declined
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MY APPLICATIONS TAB */}
            {activeTab === 'applications' && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm">
                    All Submitted Applications ({applications.length})
                  </h3>
                  <span className="text-xs text-slate-400">Real-time status updates from employers</span>
                </div>

                {applications.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 text-xs">
                    No applications submitted yet.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {applications.map(app => (
                      <div key={app.id} className="py-4 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{app.jobTitle}</h4>
                            <p className="text-xs text-slate-600 mt-0.5">{app.companyName}</p>
                            <span className="text-[11px] text-slate-400 block mt-1">
                              Applied on {new Date(app.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                app.status === 'Shortlisted'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : app.status === 'Interview Scheduled'
                                  ? 'bg-purple-100 text-purple-800'
                                  : app.status === 'Rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {app.status}
                            </span>
                            {app.status !== 'Withdrawn' && app.status !== 'Rejected' && (
                              <button
                                onClick={() => handleWithdraw(app.id)}
                                className="text-xs text-red-500 hover:text-red-700 underline"
                              >
                                Withdraw
                              </button>
                            )}
                          </div>
                        </div>

                        {app.coverMessage && (
                          <div className="text-xs bg-slate-50 p-2.5 rounded-lg text-slate-600 italic">
                            "{app.coverMessage}"
                          </div>
                        )}

                        {app.interviewDate && (
                          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-900">
                            <strong>Interview:</strong> {app.interviewDate} at {app.interviewTime}. {app.interviewLocationOrLink}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MY PROFILE TAB */}
            {activeTab === 'profile' && profile && (
              <form onSubmit={handleProfileSave} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Candidate Profile Information</h3>
                    <p className="text-xs text-slate-500">
                      Keep your details current so verified employers across Maharashtra can contact you.
                    </p>
                  </div>
                  {saveSuccess && (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Profile Updated!
                    </span>
                  )}
                </div>

                {/* Personal Information */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Full Name</label>
                      <input
                        type="text"
                        value={profile.fullName}
                        onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Email</label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={e => setProfile({ ...profile, email: e.target.value })}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Mobile Number</label>
                      <input
                        type="tel"
                        value={profile.mobile}
                        onChange={e => setProfile({ ...profile, mobile: e.target.value })}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">District</label>
                      <select
                        value={profile.district}
                        onChange={e => setProfile({ ...profile, district: e.target.value })}
                        className="w-full p-2 border rounded-lg bg-white"
                      >
                        {MAHARASHTRA_DISTRICTS.map(d => (
                          <option key={d.id} value={d.name}>
                            {d.name} ({d.marathiName})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Education */}
                <div className="pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                    Education & Qualification
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Highest Qualification</label>
                      <input
                        type="text"
                        value={profile.education.highestQualification}
                        onChange={e =>
                          setProfile({
                            ...profile,
                            education: { ...profile.education, highestQualification: e.target.value }
                          })
                        }
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">College / University</label>
                      <input
                        type="text"
                        value={profile.education.institute}
                        onChange={e =>
                          setProfile({
                            ...profile,
                            education: { ...profile.education, institute: e.target.value }
                          })
                        }
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Experience */}
                <div className="pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                    Experience & Employment
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Total Experience (Years)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={profile.experience.totalExperienceYears}
                        onChange={e =>
                          setProfile({
                            ...profile,
                            experience: {
                              ...profile.experience,
                              totalExperienceYears: Number(e.target.value),
                              isFresher: Number(e.target.value) === 0
                            }
                          })
                        }
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Current Company</label>
                      <input
                        type="text"
                        value={profile.experience.currentCompany || ''}
                        onChange={e =>
                          setProfile({
                            ...profile,
                            experience: { ...profile.experience, currentCompany: e.target.value }
                          })
                        }
                        placeholder="e.g. Infotech Kolhapur"
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Expected Salary (₹ / Yr)</label>
                      <input
                        type="number"
                        value={profile.experience.expectedSalary}
                        onChange={e =>
                          setProfile({
                            ...profile,
                            experience: { ...profile.experience, expectedSalary: Number(e.target.value) }
                          })
                        }
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    Save Profile Changes
                  </button>
                </div>
              </form>
            )}

            {/* MY RESUME & ONLINE BUILDER TAB */}
            {activeTab === 'resume' && (
              <div className="space-y-6">
                <ResumeBuilder isEmbedded={true} />
              </div>
            )}

            {/* SAVED JOBS TAB */}
            {activeTab === 'saved' && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm">
                    Bookmarked Vacancies ({savedJobsList.length})
                  </h3>
                </div>

                {savedJobsList.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 text-xs">
                    No jobs bookmarked yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedJobsList.map(job => (
                      <div
                        key={job.id}
                        className="p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4 hover:border-slate-300"
                      >
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{job.title}</h4>
                          <p className="text-xs text-slate-600">{job.companyName} • {job.district}</p>
                          <span className="text-[11px] text-emerald-700 font-bold">
                            ₹{job.salaryMin.toLocaleString('en-IN')} - ₹{job.salaryMax.toLocaleString('en-IN')} / {job.salaryType}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onViewJob(job)}
                            className="px-3 py-1.5 bg-blue-600 text-white font-semibold text-xs rounded-lg hover:bg-blue-700"
                          >
                            View & Apply
                          </button>
                          <button
                            onClick={() => toggleSaveJob(job.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg text-xs"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ACCOUNT SETTINGS TAB */}
            {activeTab === 'settings' && profile && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Privacy & Data Management</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Exercise your data principal rights under India’s Digital Personal Data Protection (DPDP) Act 2023 & GDPR.
                  </p>
                </div>

                {/* Discoverability Setting */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Employer Discoverability</p>
                    <p className="text-[11px] text-slate-500">
                      Allow verified Maharashtra employers with active recruitment subscriptions to discover your profile.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={profile.isDiscoverable}
                    onChange={e => {
                      const updated = !profile.isDiscoverable;
                      setProfile({ ...profile, isDiscoverable: updated });
                      db.updateCandidateProfile(profile.id, { isDiscoverable: updated });
                    }}
                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                  />
                </div>

                {/* Right to Data Portability */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Download My Data (Data Portability)</p>
                    <p className="text-[11px] text-slate-500">
                      Export a machine-readable JSON archive of your personal profile, qualifications, and application history.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const myApplications = db.getApplications({ candidateId: profile.id });
                      const exportPayload = {
                        exportDate: new Date().toISOString(),
                        platform: 'RozgarX Maharashtra Employment Portal',
                        legalFramework: 'India DPDP Act 2023 Section 11 / GDPR Article 20',
                        candidateProfile: {
                          id: profile.id,
                          fullName: profile.fullName,
                          email: profile.email,
                          mobile: profile.mobile,
                          district: profile.district,
                          city: profile.city,
                          skills: profile.skills,
                          experience: profile.experience,
                          education: profile.education,
                          resumeSummary: profile.resumeSummary,
                          preferredDistricts: profile.preferredDistricts,
                          expectedSalary: profile.experience?.expectedSalary || 0
                        },
                        applications: myApplications
                      };
                      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `RozgarX_MyData_${profile.id}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors shadow-2xs shrink-0 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>Download JSON Archive</span>
                  </button>
                </div>

                {/* Right to Erasure / Account Deletion */}
                <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-rose-900">Delete My Account & Purge Data</p>
                    <p className="text-[11px] text-rose-700">
                      Permanently erase your candidate profile, resume data, and job applications (Right to Erasure - DPDP Act 2023 s.12).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const confirmed = window.confirm(
                        'PERMANENT ACCOUNT DELETION NOTICE\n\nAre you sure you want to permanently delete your RozgarX account?\n\nThis will purge your profile, educational history, work experience, and job applications in compliance with your Right to Erasure under Section 12 of the Digital Personal Data Protection (DPDP) Act 2023. This action is irreversible.'
                      );
                      if (confirmed) {
                        db.deleteCandidateAccount(profile.id);
                        handleSignOut();
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-2xs shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete My Account</span>
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
