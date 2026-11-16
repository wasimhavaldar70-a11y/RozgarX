'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, CandidateProfile, Company } from '../types';
import { db } from '../services/db';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  employerId?: string;
  candidateId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole;
  isLoggedIn: boolean;
  candidateProfile: CandidateProfile | null;
  companyProfile: Company | null;
  savedJobIds: string[];
  toggleSaveJob: (jobId: string) => void;
  isJobSaved: (jobId: string) => boolean;
  loginAs: (
    role: UserRole,
    customEmail?: string,
    customName?: string,
    customAvatar?: string,
    customUserId?: string
  ) => void;
  logout: () => void;
  registerCandidate: (data: { fullName: string; email: string; mobile: string; district: string; city: string }) => void;
  registerEmployer: (data: { ownerName: string; companyName: string; email: string; mobile: string; district: string; city: string; industry: string }) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Real authentication: starts logged out (null) unless a real session was previously saved
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('mahajobs_current_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('mahajobs_saved_jobs');
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null);
  const [companyProfile, setCompanyProfile] = useState<Company | null>(null);

  useEffect(() => {
    if (user?.role === 'candidate' && user.candidateId) {
      setCandidateProfile(db.getCandidateById(user.candidateId) || null);
    } else if (user?.role === 'employer' && user.employerId) {
      setCompanyProfile(db.getCompanyById(user.employerId) || null);
    } else {
      setCandidateProfile(null);
      setCompanyProfile(null);
    }
  }, [user]);

  const toggleSaveJob = (jobId: string) => {
    setSavedJobIds(prev => {
      const next = prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId];
      if (typeof window !== 'undefined') {
        localStorage.setItem('mahajobs_saved_jobs', JSON.stringify(next));
      }
      return next;
    });
  };

  const isJobSaved = (jobId: string) => savedJobIds.includes(jobId);

  const loginAs = (
    role: UserRole,
    customEmail?: string,
    customName?: string,
    customAvatar?: string,
    customUserId?: string
  ) => {
    const email = customEmail || '';
    const userId = customUserId || `user_${Date.now()}`;
    const name = customName || (email ? email.split('@')[0] : 'User');

    let newUser: AuthUser;

    if (role === 'super_admin') {
      newUser = {
        id: userId,
        email,
        fullName: name,
        role: 'super_admin',
        avatarUrl: customAvatar
      };
      setUser(newUser);
    } else if (role === 'employer') {
      const comp = db.getCompanies().find(c => c.contactEmail.toLowerCase() === email.toLowerCase());
      newUser = {
        id: userId,
        email,
        fullName: name,
        role: 'employer',
        employerId: comp?.id || userId,
        avatarUrl: customAvatar || comp?.logoUrl
      };
      setUser(newUser);
      if (comp) setCompanyProfile(comp);
    } else {
      const cand = db.getCandidates().find(c => c.email.toLowerCase() === email.toLowerCase());
      newUser = {
        id: userId,
        email,
        fullName: name,
        role: 'candidate',
        candidateId: cand?.id,
        avatarUrl: customAvatar || cand?.profilePhoto
      };
      setUser(newUser);
      if (cand) setCandidateProfile(cand);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('mahajobs_current_user', JSON.stringify(newUser));
    }
  };

  const registerCandidate = (data: { fullName: string; email: string; mobile: string; district: string; city: string }) => {
    const newUserId = `user_cand_${Date.now()}`;
    const newCandId = `cand_${Date.now()}`;
    const newProfile: CandidateProfile = {
      id: newCandId,
      userId: newUserId,
      fullName: data.fullName,
      email: data.email,
      mobile: data.mobile,
      address: `${data.city}, ${data.district}`,
      district: data.district,
      city: data.city,
      pincode: '',
      education: {
        id: `edu_${Date.now()}`,
        highestQualification: '',
        degreeName: '',
        institute: '',
        passingYear: '',
        percentageOrCgpa: ''
      },
      experience: {
        id: `exp_${Date.now()}`,
        isFresher: true,
        totalExperienceYears: 0,
        expectedSalary: 0
      },
      skills: [],
      languagesKnown: ['Marathi', 'English'],
      preferredJobRoles: [],
      preferredDistricts: [data.district],
      isDiscoverable: true,
      phoneVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.updateCandidateProfile(newCandId, newProfile);
    const authUser: AuthUser = {
      id: newUserId,
      email: data.email,
      fullName: data.fullName,
      role: 'candidate',
      candidateId: newCandId
    };
    setUser(authUser);
    setCandidateProfile(newProfile);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mahajobs_current_user', JSON.stringify(authUser));
    }
  };

  const registerEmployer = (data: {
    ownerName: string;
    companyName: string;
    email: string;
    mobile: string;
    district: string;
    city: string;
    industry: string;
  }) => {
    const newEmpId = `emp_${Date.now()}`;
    const newCompId = `comp_${Date.now()}`;
    const newComp: Company = {
      id: newCompId,
      employerId: newEmpId,
      name: data.companyName,
      tagline: 'Registered Employer in Maharashtra',
      about: `Company registered in ${data.city}, ${data.district}. Actively hiring local talent.`,
      industry: data.industry,
      companyType: 'Private Limited',
      companySize: '10-50 Employees',
      district: data.district,
      city: data.city,
      address: `${data.city}, ${data.district}`,
      pincode: '',
      contactEmail: data.email,
      contactPhone: data.mobile,
      verificationStatus: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save company into db
    db.updateCompany(newCompId, newComp);

    // Give default Free Starter plan with 1 credit
    db.getEmployerSubscription(newEmpId);

    const authUser: AuthUser = {
      id: newEmpId,
      email: data.email,
      fullName: data.ownerName,
      role: 'employer',
      employerId: newEmpId
    };
    setUser(authUser);
    setCompanyProfile(newComp);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mahajobs_current_user', JSON.stringify(authUser));
    }
  };

  const logout = () => {
    setUser(null);
    setCandidateProfile(null);
    setCompanyProfile(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mahajobs_current_user');
      localStorage.removeItem('mahajobs_saved_jobs');
      if (typeof document !== 'undefined') {
        document.cookie = 'mahajobs_admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax;';
        document.cookie = 'mahajobs_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax;';
      }
      const path = window.location.pathname.toLowerCase();
      if (
        path.includes('dashboard') ||
        path.includes('candidate') ||
        path.includes('employer') ||
        path.includes('admin')
      ) {
        window.history.pushState({ view: 'home' }, '', '/');
      }
    }
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut().catch(() => {});
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'candidate',
        isLoggedIn: Boolean(user),
        candidateProfile,
        companyProfile,
        savedJobIds,
        toggleSaveJob,
        isJobSaved,
        loginAs,
        logout,
        registerCandidate,
        registerEmployer
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
