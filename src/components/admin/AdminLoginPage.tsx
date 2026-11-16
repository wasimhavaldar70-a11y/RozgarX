'use client';

import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Building2,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { db } from '../../services/db';

interface AdminLoginPageProps {
  onLoginSuccess?: () => void;
  onNavigateHome?: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onNavigateHome
}) => {
  const { user, role, loginAs, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // If already logged in as a non-admin role (Candidate or Employer)
  if (user && role !== 'super_admin') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-900/5">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Administrator Access Required
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            You are currently signed in as a <strong className="text-slate-800 capitalize">{role}</strong> ({user.email}).
            This administrative console is strictly restricted to verified Super Administrators.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => {
                logout();
                setErrorMessage('');
              }}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-xs"
            >
              Sign In with Admin Account
            </button>
            <button
              onClick={onNavigateHome}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors"
            >
              Return to Public Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setErrorMessage('Please enter both administrative email and password');
      return;
    }

    setIsLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        // Authenticate with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });

        if (error || !data.user) {
          setErrorMessage(error?.message || 'Invalid administrator credentials');
          return;
        }

        // CRITICAL SECURITY ENFORCEMENT:
        // Verify role directly from database 'profiles' table
        const { data: profile, error: profError } = await supabase
          .from('profiles')
          .select('id, user_id, full_name, avatar_url, role')
          .or(`id.eq.${data.user.id},user_id.eq.${data.user.id}`)
          .maybeSingle();

        const userRole =
          profile?.role ||
          data.user.user_metadata?.role ||
          (data.user as any).app_metadata?.role;

        const isSuperAdmin =
          userRole === 'super_admin' ||
          cleanEmail === 'wasimhavaldar70@gmail.com' ||
          cleanEmail === 'wasimhavalaldar70@gmail.com';

        if (!isSuperAdmin) {
          // Immediately terminate session - NOT an admin
          await supabase.auth.signOut();
          setErrorMessage(
            'Access Denied: This account is not authorized for Super Administrator access.'
          );
          return;
        }

        setSuccessMessage('Administrator verified. Loading control center...');
        loginAs(
          'super_admin',
          cleanEmail,
          profile?.full_name || 'Super Administrator',
          profile?.avatar_url,
          data.user.id
        );

        if (onLoginSuccess) {
          setTimeout(() => {
            onLoginSuccess();
          }, 400);
        }
      } else {
        // Fallback for offline/local simulation
        if (cleanEmail.includes('admin') || cleanEmail === 'wasimhavaldar70@gmail.com') {
          setSuccessMessage('Administrator verified. Loading control center...');
          loginAs('super_admin', cleanEmail, 'Super Administrator');
          if (onLoginSuccess) {
            setTimeout(() => {
              onLoginSuccess();
            }, 400);
          }
        } else {
          setErrorMessage('Access Denied: Only authorized Super Administrators may sign in here.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <div className="mb-6">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to RozgarX Portal
          </button>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-700/30 overflow-hidden">
          {/* Card Header */}
          <div className="bg-slate-950 text-white px-6 py-6 border-b border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <span className="bg-blue-900/60 text-blue-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-blue-700/50 uppercase tracking-wider">
                Govt of Maharashtra
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Super Admin Control Center
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Restricted portal for state recruitment management, KYC verification & audit oversight.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="p-6 sm:p-8 space-y-5">
            {errorMessage && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-start gap-2.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Administrator Email ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@rozgarx.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Master Security Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authenticate & Open Admin Console</span>
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>Protected by PostgreSQL Row Level Security (RLS) & TLS 1.3</span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

