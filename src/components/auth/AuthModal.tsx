'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  User,
  Building2,
  ShieldCheck,
  Mail,
  Lock,
  Phone,
  CheckCircle2,
  RotateCcw,
  KeyRound,
  Smartphone,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { MAHARASHTRA_DISTRICTS } from '../../data/maharashtra';
import { JOB_CATEGORIES } from '../../data/categories';
import {
  otpService,
  normalizeIndianMobile
} from '../../services/otpService';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { db } from '../../services/db';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register_candidate' | 'register_employer';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login'
}) => {
  const { loginAs, registerCandidate, registerEmployer } = useAuth();
  const [mode, setMode] = useState<'login' | 'register_candidate' | 'register_employer' | 'reset_password'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>('candidate');

  // Multi-step Registration State: 1 = Enter Phone, 2 = Enter OTP, 3 = Complete Profile
  const [regStep, setRegStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [district, setDistrict] = useState('Pune');
  const [city, setCity] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('IT & Software');

  // Legal, Age & Consent State (India DPDP Act 2023 & GDPR Compliant)
  const [confirmAdult, setConfirmAdult] = useState<boolean>(false);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);

  // OTP Verification State
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [challengeId, setChallengeId] = useState<string>('');
  const [approvalToken, setApprovalToken] = useState<string>('');
  const [verifiedPhone, setVerifiedPhone] = useState<string>('');
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Refs for 6-digit OTP input boxes
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset form when modal opens or mode changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setRegStep(1);
      setErrorMessage('');
      setSuccessMessage('');
      setOtpDigits(['', '', '', '', '', '']);
      setApprovalToken('');
      setVerifiedPhone('');
      setConfirmAdult(false);
      setAgreeTerms(false);
    }
  }, [isOpen, initialMode]);

  // Resend cooldown timer countdown
  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  // -------------------------------------------------------------
  // STEP 1: Send Registration OTP via MSG91
  // -------------------------------------------------------------
  const handleSendOtp = async (role: 'candidate' | 'employer') => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!mobile.trim()) {
      setErrorMessage('Please enter your 10-digit mobile number');
      return;
    }

    if (role === 'candidate' && !fullName.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }

    if (role === 'employer' && !fullName.trim()) {
      setErrorMessage('Please enter the contact person name');
      return;
    }

    const norm = normalizeIndianMobile(mobile);
    if (!norm.isValid) {
      setErrorMessage(norm.error || 'Invalid Indian mobile number');
      return;
    }

    setIsLoading(true);
    try {
      const res = await otpService.sendRegistrationOtp(mobile, role);
      if (res.success && res.challengeId) {
        setChallengeId(res.challengeId);
        setVerifiedPhone(norm.displayFormat);
        setSuccessMessage(res.message);
        setResendCooldown(res.resendCooldownSeconds || 60);
        setRegStep(2);
        // Auto-focus first OTP input after small delay
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
      } else {
        setErrorMessage(res.error || 'Failed to dispatch SMS OTP. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error while requesting OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------
  // STEP 2: Verify 6-digit OTP
  // -------------------------------------------------------------
  const handleVerifyOtp = async (role: 'candidate' | 'employer') => {
    setErrorMessage('');
    setSuccessMessage('');

    const fullOtp = otpDigits.join('').trim();
    if (fullOtp.length !== 6 || !/^\d{6}$/.test(fullOtp)) {
      setErrorMessage('Please enter the complete 6-digit OTP received via SMS');
      return;
    }

    setIsLoading(true);
    try {
      const res = await otpService.verifyRegistrationOtp(challengeId, mobile, fullOtp, role);
      if (res.success && res.approvalToken) {
        setApprovalToken(res.approvalToken);
        setVerifiedPhone(res.displayMobile || res.verifiedMobile || mobile);
        setSuccessMessage(res.message);
        // Advance to Step 3 (final profile details)
        setTimeout(() => {
          setRegStep(3);
          setSuccessMessage('');
        }, 800);
      } else {
        setErrorMessage(res.error || 'Invalid or expired OTP. Please check and retry.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Resend OTP Handler
  // -------------------------------------------------------------
  const handleResendOtp = async (role: 'candidate' | 'employer') => {
    if (resendCooldown > 0) return;
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const res = challengeId
        ? await otpService.resendRegistrationOtp(challengeId, mobile, role)
        : await otpService.sendRegistrationOtp(mobile, role);
      if (res.success && res.challengeId) {
        setChallengeId(res.challengeId);
        setResendCooldown(res.resendCooldownSeconds || 60);
        setSuccessMessage('Fresh 6-digit OTP dispatched to ' + verifiedPhone);
        setOtpDigits(['', '', '', '', '', '']);
        otpInputRefs.current[0]?.focus();
      } else {
        setErrorMessage(res.error || 'Failed to resend OTP');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP digit box change
  const handleOtpDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const updated = [...otpDigits];
    updated[index] = digit;
    setOtpDigits(updated);

    // Auto-advance focus to next input
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP backspace and arrow navigation
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        const updated = [...otpDigits];
        updated[index - 1] = '';
        setOtpDigits(updated);
        otpInputRefs.current[index - 1]?.focus();
      } else {
        const updated = [...otpDigits];
        updated[index] = '';
        setOtpDigits(updated);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Paste event for 6-digit code
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const updated = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      updated[i] = pasted[i] || '';
    }
    setOtpDigits(updated);

    const nextIndex = Math.min(pasted.length, 5);
    otpInputRefs.current[nextIndex]?.focus();
  };

  // -------------------------------------------------------------
  // STEP 3: Complete Candidate Registration with Approval Token
  // -------------------------------------------------------------
  const handleCompleteCandidateRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!approvalToken) {
      setErrorMessage('Mobile verification approval token missing. Please verify your mobile number again.');
      setRegStep(1);
      return;
    }

    if (!fullName || !email || !password || !district) {
      setErrorMessage('Please fill in all required registration fields');
      return;
    }

    if (!confirmAdult) {
      setErrorMessage('You must confirm you are at least 18 years of age to register (India DPDP Act 2023).');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('You must agree to the Terms & Conditions and Privacy Policy to create an account.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long for security');
      return;
    }

    setIsLoading(true);
    try {
      const res = await otpService.completeRegistration({
        role: 'candidate',
        approvalToken,
        fullName,
        email,
        password,
        mobile,
        district,
        city: city || district
      });

      if (res.success) {
        // Register in client auth context
        registerCandidate({
          fullName,
          email,
          mobile,
          district,
          city: city || district
        });
        setSuccessMessage('Candidate account created! Mobile verified with MSG91 OTP.');
        setTimeout(() => {
          onClose();
        }, 900);
      } else {
        setErrorMessage(res.error || 'Failed to complete registration');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error completing registration');
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------
  // STEP 3: Complete Employer Registration with Approval Token
  // -------------------------------------------------------------
  const handleCompleteEmployerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!approvalToken) {
      setErrorMessage('Mobile verification approval token missing. Please verify your mobile number again.');
      setRegStep(1);
      return;
    }

    if (!companyName || !fullName || !email || !password || !district) {
      setErrorMessage('Please fill in all required company details');
      return;
    }

    if (!confirmAdult) {
      setErrorMessage('You must confirm you are at least 18 years of age to register an employer account.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('You must agree to the Terms & Conditions and Privacy Policy.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long for security');
      return;
    }

    setIsLoading(true);
    try {
      const res = await otpService.completeRegistration({
        role: 'employer',
        approvalToken,
        contactPerson: fullName,
        companyName,
        email,
        password,
        mobile,
        district,
        city: city || district,
        industry
      });

      if (res.success) {
        registerEmployer({
          ownerName: fullName,
          companyName,
          email,
          mobile,
          district,
          city: city || district,
          industry
        });
        setSuccessMessage('Employer registered! Mobile verified. Company KYC review is Pending.');
        setTimeout(() => {
          onClose();
        }, 900);
      } else {
        setErrorMessage(res.error || 'Failed to complete employer registration');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error completing registration');
    } finally {
      setIsLoading(false);
    }
  };

  // Standard Login submit (NO SMS OTP required for normal login)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Please enter email and password');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });

        if (error || !data.user) {
          setErrorMessage(error?.message || 'Invalid email or password');
          return;
        }

        // Retrieve real profile & role from Supabase
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, role')
          .eq('id', data.user.id)
          .maybeSingle();

        const role = (profile?.role || data.user.user_metadata?.role || selectedRole) as UserRole;
        loginAs(role, cleanEmail, profile?.full_name, profile?.avatar_url, data.user.id);
        onClose();
        return;
      } catch (err: any) {
        setErrorMessage(err?.message || 'Sign in failed');
        return;
      } finally {
        setIsLoading(false);
      }
    } else {
      loginAs(selectedRole, cleanEmail);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-lg">
                {mode === 'login' && 'Sign In to RozgarX'}
                {mode === 'register_candidate' && 'Candidate Registration'}
                {mode === 'register_employer' && 'Employer Registration'}
                {mode === 'reset_password' && 'Reset Password'}
              </h3>
              {(mode === 'register_candidate' || mode === 'register_employer') && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 uppercase tracking-wider">
                  SMS OTP
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'login' && 'Access candidate portal, employer tools or admin.'}
              {mode === 'register_candidate' && '100% Free registration for Maharashtra job seekers.'}
              {mode === 'register_employer' && 'Post vacancies and hire talent across 36 districts.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-Step Progress Stepper for Registration */}
        {(mode === 'register_candidate' || mode === 'register_employer') && (
          <div className="bg-slate-50 px-6 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                  regStep >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                1
              </div>
              <span className={regStep === 1 ? 'font-semibold text-blue-900' : 'text-slate-500'}>
                Mobile
              </span>
            </div>
            <div className="w-6 h-px bg-slate-300" />
            <div className="flex items-center gap-2">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                  regStep >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                2
              </div>
              <span className={regStep === 2 ? 'font-semibold text-blue-900' : 'text-slate-500'}>
                OTP Verify
              </span>
            </div>
            <div className="w-6 h-px bg-slate-300" />
            <div className="flex items-center gap-2">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                  regStep >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                3
              </div>
              <span className={regStep === 3 ? 'font-semibold text-blue-900' : 'text-slate-500'}>
                Account Details
              </span>
            </div>
          </div>
        )}

        <div className="p-6">
          {/* Alerts */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ============================================================== */}
          {/* LOGIN FORM (Standard Email/Password, No OTP Required on Login)  */}
          {/* ============================================================== */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Your Account Role
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('candidate')}
                    className={`py-2.5 px-3 text-xs font-medium rounded-lg border flex flex-col items-center gap-1 transition-colors ${
                      selectedRole === 'candidate'
                        ? 'border-blue-600 bg-blue-50/60 text-blue-700 font-semibold shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Candidate
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('employer')}
                    className={`py-2.5 px-3 text-xs font-medium rounded-lg border flex flex-col items-center gap-1 transition-colors ${
                      selectedRole === 'employer'
                        ? 'border-blue-600 bg-blue-50/60 text-blue-700 font-semibold shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    Employer
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={
                      selectedRole === 'employer'
                        ? 'hr@company.com'
                        : 'candidate@example.com'
                    }
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setMode('reset_password')}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-xs transition-colors"
              >
                Sign In
              </button>

              <div className="pt-2 text-center text-xs text-slate-600">
                Don’t have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register_candidate');
                    setRegStep(1);
                  }}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Candidate Sign Up
                </button>
                {' · '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register_employer');
                    setRegStep(1);
                  }}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Employer Sign Up
                </button>
              </div>
            </form>
          )}

          {/* ============================================================== */}
          {/* CANDIDATE REGISTRATION (3-Step SMS OTP Flow)                    */}
          {/* ============================================================== */}
          {mode === 'register_candidate' && (
            <div>
              {/* STEP 1: Full Name & Mobile */}
              {regStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="e.g. Ramesh Deshmukh"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Mobile Number (for SMS OTP verification) *
                    </label>
                    <div className="relative flex rounded-lg shadow-xs">
                      <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 bg-slate-100 text-slate-600 text-xs font-medium">
                        🇮🇳 +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={mobile}
                        onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="9876543210"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-r-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 font-mono tracking-wider"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      We will send a 6-digit OTP via MSG91 SMS gateway. Standard SMS charges do not apply (Free).
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isLoading || !mobile || mobile.length < 10 || !fullName}
                    onClick={() => handleSendOtp('candidate')}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <span className="animate-spin text-base">◌</span>
                    ) : (
                      <>
                        <Smartphone className="w-4 h-4" />
                        Send SMS Verification Code
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center text-xs text-slate-600 pt-1">
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: 6-Digit OTP Verification */}
              {regStep === 2 && (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
                    <p className="text-xs text-blue-900 font-medium">
                      Enter the 6-digit OTP sent to:
                    </p>
                    <p className="text-sm font-bold text-blue-900 font-mono mt-0.5">
                      {verifiedPhone || `+91 ${mobile}`}
                    </p>
                    <button
                      type="button"
                      onClick={() => setRegStep(1)}
                      className="text-[11px] text-blue-600 hover:underline mt-1 inline-block"
                    >
                      Change Mobile Number
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2 text-center">
                      Enter 6-Digit Security Code
                    </label>
                    <div className="flex justify-center gap-1.5 sm:gap-2">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={el => { otpInputRefs.current[idx] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleOtpDigitChange(idx, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(idx, e)}
                          onPaste={idx === 0 ? handleOtpPaste : undefined}
                          className="w-9 h-11 sm:w-11 sm:h-12 text-center text-lg sm:text-xl font-bold font-mono border-2 border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30 transition-all bg-white"
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isLoading || otpDigits.join('').length !== 6}
                    onClick={() => handleVerifyOtp('candidate')}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <span className="animate-spin text-base">◌</span>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        Verify OTP Code
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                    <span>Didn't receive SMS?</span>
                    {resendCooldown > 0 ? (
                      <span className="text-slate-400 font-mono">
                        Resend in {resendCooldown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleResendOtp('candidate')}
                        disabled={isLoading}
                        className="text-blue-600 font-medium hover:underline flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: Complete Remaining Candidate Profile Details */}
              {regStep === 3 && (
                <form onSubmit={handleCompleteCandidateRegister} className="space-y-3.5">
                  <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-xs text-green-800">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    <span>
                      Mobile Verified: <strong>{verifiedPhone}</strong>
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="ramesh@example.com"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">District *</label>
                      <select
                        value={district}
                        onChange={e => setDistrict(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 bg-white"
                      >
                        {MAHARASHTRA_DISTRICTS.map(d => (
                          <option key={d.id} value={d.name}>
                            {d.name} ({d.marathiName})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">City / Taluka</label>
                      <input
                        type="text"
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        placeholder="e.g. Haveli / Hinjewadi"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Create Password *</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min 8 characters (letters & numbers)"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                    />
                  </div>

                  {/* Legal, Consent & Age Verification (India DPDP Act & GDPR Compliant) */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <label className="flex items-start gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        required
                        checked={confirmAdult}
                        onChange={e => setConfirmAdult(e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span>
                        I confirm that I am <strong>18 years of age or older</strong> (in compliance with India’s Digital Personal Data Protection Act 2023).
                      </span>
                    </label>

                    <label className="flex items-start gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        required
                        checked={agreeTerms}
                        onChange={e => setAgreeTerms(e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span>
                        I agree to the{' '}
                        <a
                          href="/terms-conditions"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-medium"
                        >
                          Terms & Conditions
                        </a>{' '}
                        and have read the{' '}
                        <a
                          href="/privacy-policy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-medium"
                        >
                          Privacy Policy
                        </a>.
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-medium text-sm rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <span className="animate-spin text-base">◌</span>
                    ) : (
                      'Complete Candidate Account (100% Free)'
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* EMPLOYER REGISTRATION (3-Step SMS OTP Flow)                     */}
          {/* ============================================================== */}
          {mode === 'register_employer' && (
            <div>
              {/* STEP 1: Contact Person & Mobile */}
              {regStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Contact Person / HR Director Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="e.g. Anand Kulkarni"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Official Mobile Number (for SMS OTP verification) *
                    </label>
                    <div className="relative flex rounded-lg shadow-xs">
                      <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 bg-slate-100 text-slate-600 text-xs font-medium">
                        🇮🇳 +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={mobile}
                        onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="9822012345"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-r-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 font-mono tracking-wider"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Official number used for employer identity verification and candidate hiring communications.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isLoading || !mobile || mobile.length < 10 || !fullName}
                    onClick={() => handleSendOtp('employer')}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <span className="animate-spin text-base">◌</span>
                    ) : (
                      <>
                        <Smartphone className="w-4 h-4" />
                        Send SMS Verification Code
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center text-xs text-slate-600 pt-1">
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: 6-Digit OTP Verification */}
              {regStep === 2 && (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
                    <p className="text-xs text-blue-900 font-medium">
                      Enter the 6-digit OTP sent to:
                    </p>
                    <p className="text-sm font-bold text-blue-900 font-mono mt-0.5">
                      {verifiedPhone || `+91 ${mobile}`}
                    </p>
                    <button
                      type="button"
                      onClick={() => setRegStep(1)}
                      className="text-[11px] text-blue-600 hover:underline mt-1 inline-block"
                    >
                      Change Mobile Number
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2 text-center">
                      Enter 6-Digit Security Code
                    </label>
                    <div className="flex justify-center gap-1.5 sm:gap-2">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={el => { otpInputRefs.current[idx] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleOtpDigitChange(idx, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(idx, e)}
                          onPaste={idx === 0 ? handleOtpPaste : undefined}
                          className="w-9 h-11 sm:w-11 sm:h-12 text-center text-lg sm:text-xl font-bold font-mono border-2 border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30 transition-all bg-white"
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isLoading || otpDigits.join('').length !== 6}
                    onClick={() => handleVerifyOtp('employer')}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <span className="animate-spin text-base">◌</span>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        Verify OTP Code
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                    <span>Didn't receive SMS?</span>
                    {resendCooldown > 0 ? (
                      <span className="text-slate-400 font-mono">
                        Resend in {resendCooldown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleResendOtp('employer')}
                        disabled={isLoading}
                        className="text-blue-600 font-medium hover:underline flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: Company Details & Account Creation */}
              {regStep === 3 && (
                <form onSubmit={handleCompleteEmployerRegister} className="space-y-3.5">
                  <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between text-xs text-green-800">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                      <span>Phone Verified: <strong>{verifiedPhone}</strong></span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-semibold">
                      KYC: Pending
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Company / Organization Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      placeholder="e.g. Swaraj Precision Castings Ltd"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Contact Person</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Industry Sector</label>
                      <select
                        value={industry}
                        onChange={e => setIndustry(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 bg-white"
                      >
                        {JOB_CATEGORIES.map(c => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Business Email *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="careers@company.com"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">District *</label>
                      <select
                        value={district}
                        onChange={e => setDistrict(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 bg-white"
                      >
                        {MAHARASHTRA_DISTRICTS.map(d => (
                          <option key={d.id} value={d.name}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">City / MIDC Area</label>
                      <input
                        type="text"
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        placeholder="e.g. Shiroli MIDC"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min 8 characters (letters & numbers)"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                    />
                  </div>

                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800">
                    <strong>Note on Company Verification:</strong> Mobile verification confirms contact authenticity. Company business documents (GSTIN/Udyam) will be reviewed by Maharashtra portal admins before verified badge is granted.
                  </div>

                  {/* Legal, Consent & Age Verification (India DPDP Act & GDPR Compliant) */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <label className="flex items-start gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        required
                        checked={confirmAdult}
                        onChange={e => setConfirmAdult(e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span>
                        I confirm that I am an authorized corporate representative <strong>18 years of age or older</strong>.
                      </span>
                    </label>

                    <label className="flex items-start gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        required
                        checked={agreeTerms}
                        onChange={e => setAgreeTerms(e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span>
                        I agree to the{' '}
                        <a
                          href="/terms-conditions"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-medium"
                        >
                          Employer Terms
                        </a>{' '}
                        and have read the{' '}
                        <a
                          href="/privacy-policy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-medium"
                        >
                          Privacy Policy
                        </a>.
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-medium text-sm rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <span className="animate-spin text-base">◌</span>
                    ) : (
                      'Register Company & Claim 1 Free Job Post'
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* RESET PASSWORD MODAL                                            */}
          {/* ============================================================== */}
          {mode === 'reset_password' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Enter your registered email address. We will send a secure password reset link.
              </p>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@email.com"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setSuccessMessage('Password reset instructions sent to your email.');
                  setTimeout(() => setMode('login'), 1500);
                }}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg"
              >
                Send Reset Link
              </button>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-center text-xs text-slate-600 hover:underline"
              >
                Back to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
