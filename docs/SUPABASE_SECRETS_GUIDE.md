# SUPABASE SECRETS & EDGE FUNCTION DEPLOYMENT GUIDE

This guide explains how to deploy the database migrations and Edge Functions for the MahaJobs SMS OTP system.

---

## 1. Apply Database Migration
Execute `supabase/migrations/003_sms_otp_registration.sql` against your Supabase project:

```bash
# Using Supabase CLI:
supabase db push

# Or execute via Supabase Dashboard SQL Editor:
# Copy the full contents of supabase/migrations/003_sms_otp_registration.sql
# and execute in the SQL Editor.
```

### Tables Created & Secured:
- `otp_challenges`: Metadata, expiration timestamps, IP hash, and verification attempts counter. RLS enabled: Zero public access (service-role only).
- `registration_approvals`: Stores single-use SHA-256 hashed approval tokens valid for 10 minutes. RLS enabled: Zero public access (service-role only).
- `otp_rate_limits`: Atomic rate-limiting table enforcing max 3 attempts per phone per 15 min and 10 attempts per IP per hour.
- `profiles`: Hardened with `phone_verified` boolean and RLS policy preventing user-initiated tampering of `phone_verified` or `role`.

---

## 2. Deploy Supabase Edge Functions

Deploy each function to your remote Supabase project:

```bash
# 1. Send Registration OTP
supabase functions deploy send-registration-otp --no-verify-jwt

# 2. Verify Registration OTP
supabase functions deploy verify-registration-otp --no-verify-jwt

# 3. Complete Registration (Atomically creates user and consumes approval token)
supabase functions deploy complete-registration --no-verify-jwt
```

---

## 3. Verify Edge Function Secrets
Ensure the 4 required environment variables are set:

```bash
supabase secrets set MSG91_AUTH_KEY="your_actual_msg91_authkey"
supabase secrets set MSG91_OTP_TEMPLATE_ID="your_dlt_mapped_template_id"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"
supabase secrets set SUPABASE_URL="https://your-project.supabase.co"
```

---

## 4. Frontend Environment Setup
In your deployment environment (Vercel, Cloud Run, Netlify, etc.), set only the public keys:

```env
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"
```

*Note: Never include `MSG91_AUTH_KEY` or `SUPABASE_SERVICE_ROLE_KEY` in frontend environment variables!*
