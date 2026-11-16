# MANUAL QA CHECKLIST: SMS OTP REGISTRATION VERIFICATION

Use this checklist to perform live manual quality assurance testing on the production-ready MahaJobs SMS OTP system.

---

## 1. Candidate Registration Journey
- [ ] **Step 1: Mobile & Name Input**
  - Open MahaJobs homepage and click **Candidate Sign Up**.
  - Verify modal opens on Step 1 with `🇮🇳 +91` prefix.
  - Enter an invalid number (e.g. `12345` or `0123456789`) → verify validation error appears: *"Please enter a valid 10-digit Indian mobile number"*.
  - Enter already registered number (`9876543210`) → verify error: *"This mobile number is already registered. Please sign in"*.
  - Enter a valid 10-digit mobile number (e.g. `98221 12345`) and full name → click **Send SMS Verification Code**.
  - Verify loading spinner is shown and button is disabled during dispatch.
- [ ] **Step 2: 6-Digit OTP Verification**
  - Modal transitions smoothly to Step 2 showing masked destination mobile.
  - Verify 6 individual digit boxes appear with first box auto-focused.
  - Type digits → verify focus auto-advances to next input.
  - Press backspace → verify focus moves backwards and clears digit.
  - Paste a 6-digit code (e.g. `123456`) into first box → verify all 6 inputs populate automatically.
  - Enter an invalid code → verify error message with remaining attempts count.
  - Verify 60-second countdown timer runs; once 0s is reached, **Resend OTP** becomes active.
  - Click **Change Mobile Number** → verify it returns to Step 1 preserving entered name.
  - Enter valid OTP and click **Verify OTP Code**.
- [ ] **Step 3: Complete Account**
  - Verify green badge: `✓ Mobile Verified: +91 98221 12345`.
  - Enter email, password (min 6 chars), select Maharashtra district (e.g. Pune, Kolhapur, Nagpur, Nashik).
  - Click **Complete Candidate Account (100% Free)**.
  - Verify success notification and redirect to Candidate Dashboard.
  - Verify Candidate Dashboard displays `Phone Verified (SMS OTP)` badge.

---

## 2. Employer Registration Journey
- [ ] **Step 1: Contact Person & Official Mobile**
  - Click **Post a Job** or **Employer Sign Up**.
  - Enter contact person name and official mobile number.
  - Click **Send SMS Verification Code**.
- [ ] **Step 2: OTP Verification**
  - Enter 6-digit OTP code and verify.
- [ ] **Step 3: Company Profile & KYC Notice**
  - Fill Company Name, Business Email, Password, District, City/MIDC, and Industry Sector.
  - Verify notice: *"Mobile verification confirms contact authenticity. Company business documents (GSTIN/Udyam) will be reviewed by Maharashtra portal admins before verified badge is granted."*
  - Complete registration.
  - Verify redirect to Employer Dashboard.
  - Confirm dashboard shows `KYC Pending` badge alongside `Phone Verified (SMS OTP)` badge.

---

## 3. Super Admin Panel: SMS OTP Audit
- [ ] Click User Menu → **Admin** → navigate to **Admin Control Center**.
- [ ] In the sidebar, click **SMS OTP Audit (MSG91)**.
- [ ] Verify 5 KPI metric cards:
  - Total OTP Requests
  - Verified Registrations & Conversion Rate
  - Failed Attempts
  - Expired Sessions
  - Candidate / Employer Breakdown
- [ ] Verify 7-day Activity Trend Chart.
- [ ] Test Filters:
  - Filter by Registration Purpose (Candidate vs Employer).
  - Filter by Status (Verified, Failed, Expired).
- [ ] Inspect Log Table:
  - Confirm mobile numbers are masked (e.g. `98220 **** 21`).
  - Confirm strictly zero plaintext OTP values are shown or exposed.

---

## 4. Normal Login Untouched
- [ ] Open Sign In tab.
- [ ] Verify email and password inputs work directly without requesting OTP.
- [ ] 1-Click demo logins for Candidate, Employer, and Super Admin function immediately.
