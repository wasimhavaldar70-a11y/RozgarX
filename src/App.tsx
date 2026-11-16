'use client';

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/public/Hero';
import { PopularCategories } from './components/public/PopularCategories';
import { PopularDistricts } from './components/public/PopularDistricts';
import { LatestJobs } from './components/public/LatestJobs';
import { HowItWorks } from './components/public/HowItWorks';
import { FindJobsPage } from './components/public/FindJobsPage';
import { JobDetailsModal } from './components/public/JobDetailsModal';
import { CompaniesPage } from './components/public/CompaniesPage';
import { CareerAdvicePage } from './components/public/CareerAdvicePage';
import { CandidateDashboard } from './components/candidate/CandidateDashboard';
import { EmployerDashboard } from './components/employer/EmployerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLoginPage } from './components/admin/AdminLoginPage';
import { AuthModal } from './components/auth/AuthModal';
import { PostJobModal } from './components/employer/PostJobModal';
import { SubscriptionModal } from './components/employer/SubscriptionModal';
import { RecruitmentRequestModal } from './components/public/RecruitmentRequestModal';
import {
  PrivacyPolicyPage,
  TermsConditionsPage,
  JobSeekerAgreementPage,
  EmployerAgreementPage,
  RefundPolicyPage,
  DisclaimerPage,
  CookiePolicyPage,
  GrievanceRedressalPage,
  LegalHubPage,
  ContactUsPage
} from './components/public/InfoPages';
import { ResumeBuilder } from './components/candidate/ResumeBuilder';
import { db } from './services/db';
import { Job, Company } from './types';

// Helper to parse browser pathname & search params into an internal view
const parseLocation = (): {
  view: string;
  searchParams: { search?: string; district?: string; category?: string };
} => {
  if (typeof window === 'undefined') {
    return { view: 'home', searchParams: { search: '', district: 'All', category: 'All' } };
  }

  const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);
  const search = searchParams.get('search') || '';
  const district = searchParams.get('district') || 'All';
  const category = searchParams.get('category') || 'All';

  let view = 'home';
  const tab = searchParams.get('tab');
  if (path === 'findjobs' || path === 'find-jobs') {
    view = 'find-jobs';
  } else if (path === 'companies') {
    view = 'companies';
  } else if (path === 'career-advice') {
    view = 'career-advice';
  } else if (path === 'resume-builder' || path === 'resumebuilder' || path === 'resume') {
    view = 'resume-builder';
  } else if (path === 'candidate-dashboard') {
    if (tab === 'applications') view = 'candidate-applications';
    else if (tab === 'profile') view = 'candidate-profile';
    else if (tab === 'resume') view = 'candidate-resume';
    else view = 'candidate-dashboard';
  } else if (path === 'candidate-applications' || path === 'candidate/applications') {
    view = 'candidate-applications';
  } else if (path === 'candidate-profile' || path === 'candidate/profile') {
    view = 'candidate-profile';
  } else if (path === 'candidate-resume' || path === 'candidate/resume') {
    view = 'candidate-resume';
  } else if (path === 'employer-dashboard') {
    if (tab === 'jobs') view = 'employer-jobs';
    else if (tab === 'plans') view = 'employer-plans';
    else view = 'employer-dashboard';
  } else if (path === 'employer-jobs' || path === 'employer/jobs') {
    view = 'employer-jobs';
  } else if (path === 'employer-plans' || path === 'employer/plans') {
    view = 'employer-plans';
  } else if (path === 'admin' || path === 'admin-dashboard') {
    view = 'admin-dashboard';
  } else if (path === 'privacy-policy' || path === 'privacy') {
    view = 'privacy-policy';
  } else if (path === 'terms-conditions' || path === 'terms' || path === 'terms-of-service') {
    view = 'terms-conditions';
  } else if (path === 'job-seeker-agreement' || path === 'candidate-agreement') {
    view = 'job-seeker-agreement';
  } else if (path === 'employer-agreement') {
    view = 'employer-agreement';
  } else if (path === 'refund-policy' || path === 'refund-cancellation') {
    view = 'refund-policy';
  } else if (path === 'disclaimer') {
    view = 'disclaimer';
  } else if (path === 'cookie-policy' || path === 'cookies') {
    view = 'cookie-policy';
  } else if (path === 'grievance-redressal' || path === 'grievance') {
    view = 'grievance-redressal';
  } else if (path === 'legal' || path === 'legal-hub') {
    view = 'legal';
  } else if (path === 'contact-us') {
    view = 'contact-us';
  }

  return {
    view,
    searchParams: { search, district, category }
  };
};

// Helper to convert view and search parameters to a clean browser URL
const getUrlForView = (
  view: string,
  params?: { search?: string; district?: string; category?: string }
): string => {
  if (view === 'home') return '/';
  if (view === 'find-jobs' || view === 'findjobs') {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.district && params.district !== 'All') q.set('district', params.district);
    if (params?.category && params.category !== 'All') q.set('category', params.category);
    const qs = q.toString();
    return `/findjobs${qs ? `?${qs}` : ''}`;
  }
  if (view === 'companies') return '/companies';
  if (view === 'career-advice') return '/career-advice';
  if (view === 'resume-builder' || view === 'resumebuilder') return '/resume-builder';
  if (view === 'admin-dashboard') return '/admin';
  if (view === 'candidate-dashboard') return '/candidate-dashboard';
  if (view === 'candidate-applications') return '/candidate-dashboard?tab=applications';
  if (view === 'candidate-profile') return '/candidate-dashboard?tab=profile';
  if (view === 'candidate-resume') return '/candidate-dashboard?tab=resume';
  if (view === 'employer-dashboard') return '/employer-dashboard';
  if (view === 'employer-jobs') return '/employer-dashboard?tab=jobs';
  if (view === 'employer-plans') return '/employer-dashboard?tab=plans';
  return `/${view}`;
};

const MainAppContent: React.FC = () => {
  const { user, role, isLoggedIn } = useAuth();
  const [currentView, setCurrentView] = useState('home');

  // Search parameters for FindJobsPage
  const [searchParams, setSearchParams] = useState<{
    search?: string;
    district?: string;
    category?: string;
  }>({
    search: '',
    district: 'All',
    category: 'All'
  });

  // Handle popstate (Browser Back & Forward navigation)
  React.useEffect(() => {
    // Initial sync on mount
    const loc = parseLocation();
    setCurrentView(loc.view);
    setSearchParams(loc.searchParams);

    const handlePopState = () => {
      const state = parseLocation();
      setCurrentView(state.view);
      setSearchParams(state.searchParams);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Auto-redirect to home on logout if user was viewing any protected dashboard
  React.useEffect(() => {
    if (!isLoggedIn) {
      const protectedDashboardViews = [
        'candidate-dashboard',
        'candidate-applications',
        'candidate-profile',
        'candidate-resume',
        'employer-dashboard',
        'employer-jobs',
        'employer-plans',
        'admin-dashboard'
      ];
      if (protectedDashboardViews.includes(currentView)) {
        handleNavigate('home');
      }
    }
  }, [isLoggedIn, currentView]);

  // Modals state
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [jobModalApplyMode, setJobModalApplyMode] = useState(false);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register_candidate' | 'register_employer'>('login');

  const [postJobModalOpen, setPostJobModalOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [recruitmentModalOpen, setRecruitmentModalOpen] = useState(false);

  // Unified Handler with Browser History PushState
  const handleNavigate = (view: string, payload?: any, pushHistory = true) => {
    if (view === 'recruitment-services') {
      setRecruitmentModalOpen(true);
      return;
    }

    let nextView = view;
    let nextSearchParams = { ...searchParams };

    if (view.startsWith('district-')) {
      const distName = view.replace('district-', '');
      const formatted = distName.charAt(0).toUpperCase() + distName.slice(1);
      nextSearchParams = { district: formatted, search: '', category: 'All' };
      nextView = 'find-jobs';
    } else if (payload?.district) {
      nextSearchParams = {
        district: payload.district,
        search: payload.search || '',
        category: payload.category || 'All'
      };
      nextView = 'find-jobs';
    } else if (view === 'find-jobs' || view === 'findjobs') {
      nextView = 'find-jobs';
      if (payload) {
        nextSearchParams = {
          search: payload.search ?? searchParams.search ?? '',
          district: payload.district ?? searchParams.district ?? 'All',
          category: payload.category ?? searchParams.category ?? 'All'
        };
      }
    } else if (view === 'home') {
      nextView = 'home';
      nextSearchParams = { search: '', district: 'All', category: 'All' };
    }

    setCurrentView(nextView);
    setSearchParams(nextSearchParams);

    if (pushHistory && typeof window !== 'undefined') {
      const targetUrl = getUrlForView(nextView, nextSearchParams);
      const currentUrl = window.location.pathname + window.location.search;
      if (currentUrl !== targetUrl) {
        window.history.pushState({ view: nextView, searchParams: nextSearchParams }, '', targetUrl);
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHeroSearch = (params: { search?: string; district?: string }) => {
    handleNavigate('find-jobs', {
      search: params.search || '',
      district: params.district || 'All',
      category: 'All'
    });
  };

  const handleSelectCategory = (categoryName: string) => {
    handleNavigate('find-jobs', {
      search: '',
      district: 'All',
      category: categoryName
    });
  };

  const handleSelectDistrict = (districtName: string) => {
    handleNavigate('find-jobs', {
      search: '',
      district: districtName,
      category: 'All'
    });
  };

  const handleOpenJobDetails = (job: Job, applyMode: boolean = false) => {
    setSelectedJob(job);
    setJobModalApplyMode(applyMode);
    setJobModalOpen(true);
  };

  const handleOpenAuth = (mode: 'login' | 'register_candidate' | 'register_employer' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const jobs = db.getJobs();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation Header */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
        onOpenPostJob={() => setPostJobModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <>
            <Hero onSearch={handleHeroSearch} onOpenAuth={handleOpenAuth} />
            <LatestJobs
              jobs={jobs}
              onSelectJob={j => handleOpenJobDetails(j, false)}
              onApplyJob={j => handleOpenJobDetails(j, true)}
              onViewAllJobs={() => handleNavigate('find-jobs')}
            />
            <PopularCategories onSelectCategory={handleSelectCategory} />
            <PopularDistricts onSelectDistrict={handleSelectDistrict} />
            <HowItWorks onOpenAuth={handleOpenAuth} />
          </>
        )}

        {currentView === 'find-jobs' && (
          <FindJobsPage
            initialSearch={searchParams.search}
            initialDistrict={searchParams.district}
            initialCategory={searchParams.category}
            onSelectJob={j => handleOpenJobDetails(j, false)}
            onApplyJob={j => handleOpenJobDetails(j, true)}
          />
        )}

        {currentView === 'companies' && (
          <CompaniesPage
            onSelectCompany={comp => {
              setSearchParams({ search: comp.name, district: 'All', category: 'All' });
              setCurrentView('find-jobs');
            }}
            onViewJobsForCompany={compName => {
              setSearchParams({ search: compName, district: 'All', category: 'All' });
              setCurrentView('find-jobs');
            }}
          />
        )}

        {currentView === 'career-advice' && (
          <CareerAdvicePage
            onOpenResumeBuilder={() => handleNavigate('resume-builder')}
            onExploreJobs={() => handleNavigate('find-jobs')}
          />
        )}

        {currentView === 'resume-builder' && (
          <ResumeBuilder
            onBack={() => handleNavigate('home')}
            onOpenAuth={mode => handleOpenAuth(mode || 'register_candidate')}
          />
        )}

        {/* Candidate Dashboard & Tabs */}
        {(currentView === 'candidate-dashboard' ||
          currentView === 'candidate-applications' ||
          currentView === 'candidate-profile' ||
          currentView === 'candidate-resume') && (
          <CandidateDashboard
            key={currentView}
            initialTab={
              currentView === 'candidate-applications'
                ? 'applications'
                : currentView === 'candidate-profile'
                ? 'profile'
                : currentView === 'candidate-resume'
                ? 'resume'
                : 'overview'
            }
            onTabChange={tab => {
              if (tab === 'applications') handleNavigate('candidate-applications');
              else if (tab === 'profile') handleNavigate('candidate-profile');
              else if (tab === 'resume') handleNavigate('candidate-resume');
              else if (tab === 'overview') handleNavigate('candidate-dashboard');
            }}
            onNavigateToFindJobs={() => handleNavigate('find-jobs')}
            onViewJob={j => handleOpenJobDetails(j, false)}
            onNavigateHome={() => handleNavigate('home')}
          />
        )}

        {/* Employer Dashboard & Tabs */}
        {(currentView === 'employer-dashboard' ||
          currentView === 'employer-jobs' ||
          currentView === 'employer-plans') && (
          <EmployerDashboard
            key={currentView}
            initialTab={
              currentView === 'employer-jobs'
                ? 'jobs'
                : currentView === 'employer-plans'
                ? 'plans'
                : 'overview'
            }
            onTabChange={tab => {
              if (tab === 'jobs') handleNavigate('employer-jobs');
              else if (tab === 'plans') handleNavigate('employer-plans');
              else if (tab === 'overview') handleNavigate('employer-dashboard');
            }}
            onPostJobClick={() => setPostJobModalOpen(true)}
            onNavigateHome={() => handleNavigate('home')}
          />
        )}

        {/* Super Admin Dashboard or Login Gate */}
        {currentView === 'admin-dashboard' && (
          user?.role === 'super_admin' ? (
            <AdminDashboard onNavigateHome={() => handleNavigate('home')} />
          ) : (
            <AdminLoginPage
              onLoginSuccess={() => setCurrentView('admin-dashboard')}
              onNavigateHome={() => handleNavigate('home')}
            />
          )
        )}

        {/* Static Legal Hub & Compliance Pages */}
        {currentView === 'privacy-policy' && <PrivacyPolicyPage onNavigate={handleNavigate} />}
        {currentView === 'terms-conditions' && <TermsConditionsPage onNavigate={handleNavigate} />}
        {currentView === 'job-seeker-agreement' && <JobSeekerAgreementPage onNavigate={handleNavigate} />}
        {currentView === 'employer-agreement' && <EmployerAgreementPage onNavigate={handleNavigate} />}
        {currentView === 'refund-policy' && <RefundPolicyPage onNavigate={handleNavigate} />}
        {currentView === 'disclaimer' && <DisclaimerPage onNavigate={handleNavigate} />}
        {currentView === 'cookie-policy' && <CookiePolicyPage onNavigate={handleNavigate} />}
        {currentView === 'grievance-redressal' && <GrievanceRedressalPage onNavigate={handleNavigate} />}
        {currentView === 'legal' && <LegalHubPage onNavigate={handleNavigate} />}
        {currentView === 'contact-us' && <ContactUsPage onNavigate={handleNavigate} />}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} onOpenAuth={handleOpenAuth} />

      {/* Global Modals */}
      <JobDetailsModal
        job={selectedJob}
        isOpen={jobModalOpen}
        initialApplyMode={jobModalApplyMode}
        onClose={() => setJobModalOpen(false)}
        onOpenAuth={handleOpenAuth}
        onApplicationSuccess={() => {
          // If candidate is on dashboard, refresh
        }}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      <PostJobModal
        isOpen={postJobModalOpen}
        onClose={() => setPostJobModalOpen(false)}
        onJobCreated={() => {
          // Job created
        }}
        onOpenSubscriptionPlans={() => {
          setPostJobModalOpen(false);
          setSubscriptionModalOpen(true);
        }}
      />

      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
      />

      <RecruitmentRequestModal
        isOpen={recruitmentModalOpen}
        onClose={() => setRecruitmentModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
