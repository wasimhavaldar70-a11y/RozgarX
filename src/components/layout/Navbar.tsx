'use client';

import React, { useState } from 'react';
import {
  Briefcase,
  Search,
  Building,
  GraduationCap,
  LogIn,
  UserPlus,
  Globe,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  FileText,
  User,
  Shield,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage, Language } from '../../context/LanguageContext';
import { NotificationBell } from '../common/NotificationBell';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuth: (mode?: 'login' | 'register_candidate' | 'register_employer') => void;
  onOpenPostJob: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
  onOpenPostJob
}) => {
  const { user, role, isLoggedIn, logout, loginAs } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: t.home, icon: null },
    { id: 'find-jobs', label: t.findJobs, icon: Search },
    { id: 'companies', label: t.companies, icon: Building },
    { id: 'career-advice', label: t.careerAdvice, icon: GraduationCap }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-700 transition-colors">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  Rozgar<span className="text-blue-600">X</span>
                </span>
                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                  MH
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium -mt-1 hidden sm:block">
                36 Districts • Free Candidate Portal
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentView === link.id
                    ? 'text-blue-600 bg-blue-50/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Right CTA / Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>
                {language === 'en' ? 'English' : language === 'mr' ? 'मराठी' : 'हिंदी'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-32 bg-white border border-slate-200 rounded-lg shadow-md z-50 py-1 text-xs">
                <button
                  onClick={() => {
                    setLanguage('en');
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between ${
                    language === 'en' ? 'font-bold text-blue-600' : 'text-slate-700'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => {
                    setLanguage('mr');
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between ${
                    language === 'mr' ? 'font-bold text-blue-600' : 'text-slate-700'
                  }`}
                >
                  मराठी
                </button>
                <button
                  onClick={() => {
                    setLanguage('hi');
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between ${
                    language === 'hi' ? 'font-bold text-blue-600' : 'text-slate-700'
                  }`}
                >
                  हिंदी
                </button>
              </div>
            )}
          </div>

          {/* Notifications */}
          {isLoggedIn && <NotificationBell />}

          {/* Desktop Post Job Action (Free) */}
          <button
            onClick={onOpenPostJob}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50/80 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors cursor-pointer"
          >
            <Briefcase className="w-3.5 h-3.5 text-blue-600" />
            <span>Post Job</span>
          </button>

          {/* User Profile or Login/Register */}
          {isLoggedIn && user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 text-left border border-slate-200"
              >
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs overflow-hidden">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    user.fullName.charAt(0)
                  )}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold text-slate-800 leading-none truncate max-w-[120px]">
                    {user.fullName}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium capitalize mt-0.5">
                    {user.role.replace('_', ' ')}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1.5 text-xs">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="font-semibold text-slate-900 truncate">{user.fullName}</p>
                    <p className="text-slate-500 text-[11px] truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">
                      {user.role === 'super_admin'
                        ? 'Super Admin'
                        : user.role === 'employer'
                        ? 'Employer Account'
                        : 'Job Seeker'}
                    </span>
                  </div>

                  {/* Dashboard link according to role */}
                  {user.role === 'candidate' && (
                    <>
                      <button
                        onClick={() => {
                          onNavigate('candidate-dashboard');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        Candidate Dashboard
                      </button>
                      <button
                        onClick={() => {
                          onNavigate('candidate-applications');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <Briefcase className="w-4 h-4 text-slate-400" />
                        My Applications
                      </button>
                      <button
                        onClick={() => {
                          onNavigate('candidate-profile');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        My Profile
                      </button>
                      <button
                        onClick={() => {
                          onNavigate('candidate-resume');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <FileText className="w-4 h-4 text-slate-400" />
                        My Profile & Resume
                      </button>
                    </>
                  )}

                  {user.role === 'employer' && (
                    <>
                      <button
                        onClick={() => {
                          onNavigate('employer-dashboard');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        Employer Dashboard
                      </button>
                      <button
                        onClick={() => {
                          onNavigate('employer-jobs');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <Briefcase className="w-4 h-4 text-slate-400" />
                        Manage Posted Jobs
                      </button>
                      <button
                        onClick={() => {
                          onNavigate('employer-plans');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <CreditCard className="w-4 h-4 text-slate-400" />
                        Subscription & Credits
                      </button>
                    </>
                  )}

                  {user.role === 'super_admin' && (
                    <>
                      <button
                        onClick={() => {
                          onNavigate('admin-dashboard');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <Shield className="w-4 h-4 text-slate-400" />
                        Super Admin Panel
                      </button>
                    </>
                  )}

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                      onNavigate('home');
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-red-50 text-red-600 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                {t.login}
              </button>
              <button
                onClick={() => onOpenAuth('register_candidate')}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
              >
                {t.register}
              </button>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg ${
                currentView === link.id
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.label}
            </button>
          ))}

          <div className="pt-2 border-t border-slate-100">
            {role === 'candidate' && (
              <>
                <button
                  onClick={() => {
                    onNavigate('candidate-dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4 text-blue-600" />
                  Candidate Dashboard
                </button>
                <button
                  onClick={() => {
                    onNavigate('candidate-applications');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                >
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  My Applications
                </button>
                <button
                  onClick={() => {
                    onNavigate('candidate-profile');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-blue-600" />
                  My Profile
                </button>
                <button
                  onClick={() => {
                    onNavigate('candidate-resume');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  My Profile & Resume
                </button>
              </>
            )}
            {role === 'employer' && (
              <button
                onClick={() => {
                  onNavigate('employer-dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-blue-600" />
                Employer Dashboard
              </button>
            )}
            {role === 'super_admin' && (
              <button
                onClick={() => {
                  onNavigate('admin-dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
              >
                <Shield className="w-4 h-4 text-blue-600" />
                Super Admin Panel
              </button>
            )}

            {isLoggedIn && (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  onNavigate('home');
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                Sign Out
              </button>
            )}

            {!isLoggedIn && (
              <div className="space-y-2 pt-1 pb-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onOpenAuth('login');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl text-center transition-colors flex items-center justify-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5 text-slate-600" />
                    <span>{t.login}</span>
                  </button>
                  <button
                    onClick={() => {
                      onOpenAuth('register_candidate');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl text-center shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{t.register}</span>
                  </button>
                </div>
                <button
                  onClick={() => {
                    onOpenAuth('register_employer');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-xs rounded-xl text-center transition-colors flex items-center justify-center gap-1.5"
                >
                  <Building className="w-3.5 h-3.5 text-blue-600" />
                  <span>Employer / Recruiter Sign Up</span>
                </button>
              </div>
            )}

            <button
              onClick={() => {
                onOpenPostJob();
                setMobileMenuOpen(false);
              }}
              className="w-full mt-2 py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl text-center shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Briefcase className="w-4 h-4" />
              <span>Post a Job Vacancy (Free)</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
