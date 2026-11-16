# MSG91 SMS OTP INTEGRATION GUIDE FOR MAHAJOBS

This guide details how to configure MSG91 SendOTP and DLT registration for production SMS OTP delivery across all Maharashtra mobile networks.

---

## 1. Create and Verify MSG91 Account
1. Visit [MSG91 Portal](https://msg91.com/) and register with your company email.
2. Complete KYC identity verification for business messaging in India.
3. Once approved, navigate to **Dashboard** → **AuthKey** (under Developer/API Settings).
4. Generate a dedicated API AuthKey:
   - Label: `MahaJobs Production OTP Key`
   - Permissions: `OTP / SendOTP / VerifyOTP`
   - Store this key securely as `MSG91_AUTH_KEY`.

---

## 2. Telecom DLT (Distributed Ledger Technology) Registration (Mandatory in India)
As per TRAI (Telecom Regulatory Authority of India) regulations, all transactional and OTP SMS messages sent to Indian mobile numbers require DLT registration:

1. **Register Principal Entity (PE):**
   - Register on any telecom DLT portal (e.g. Jio DLT, Vilpower/Vodafone Idea DLT, Airtel DLT, BSNL DLT).
   - Submit Certificate of Incorporation / GSTIN and authorized signatory ID.
2. **Register Sender Header (Sender ID):**
   - Approved 6-character alphabetic header: e.g. `MAHAJB` or `MHAJOB`.
3. **Register Content Template:**
   - Template Type: `Service Implicit` (Transactional OTP).
   - Sample Approved Template Text:
     ```
     Your MahaJobs registration OTP is ##OTP##. This code is valid for 5 minutes. Do not share this OTP with anyone. - MahaJobs Govt of Maharashtra Initiative
     ```
   - Template ID: Once approved, copy the 19-digit numerical DLT Template ID.
4. **Map DLT Template in MSG91:**
   - In MSG91 Dashboard, open **OTP** → **Templates**.
   - Create an OTP template matching your approved DLT text.
   - Enter your DLT Header (`MAHAJB`) and DLT Template ID.
   - Copy the MSG91 Template ID string (e.g., `64f128ab34cd991283e74102`) into `MSG91_OTP_TEMPLATE_ID`.

---

## 3. Configure Supabase Edge Function Secrets
Never put MSG91 credentials in frontend `.env` or client repositories.
Store them as encrypted Supabase secrets:

```bash
# Using Supabase CLI:
supabase secrets set MSG91_AUTH_KEY="your_msg91_auth_key_here"
supabase secrets set MSG91_OTP_TEMPLATE_ID="your_msg91_otp_template_id_here"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"
supabase secrets set SUPABASE_URL="https://your-project.supabase.co"

# Verify secrets list:
supabase secrets list
```

---

## 4. API Endpoints Referenced by MahaJobs
- **Send OTP Endpoint:**
  - `POST https://control.msg91.com/api/v5/otp`
  - Headers: `authkey: <MSG91_AUTH_KEY>`, `Content-Type: application/json`
  - Body:
    ```json
    {
      "template_id": "YOUR_TEMPLATE_ID",
      "mobile": "919822012345",
      "otp_length": 6,
      "otp_expiry": 5
    }
    ```

- **Verify OTP Endpoint:**
  - `GET https://control.msg91.com/api/v5/otp/verify?mobile=919822012345&otp=123456`
  - Headers: `authkey: <MSG91_AUTH_KEY>`
  - Response evaluation:
    MahaJobs strictly validates `response.type === "success"`. HTTP 200 with `type: "error"` is treated as a failed attempt.

- **Resend OTP Endpoint:**
  - `GET https://control.msg91.com/api/v5/otp/retry?mobile=919822012345&retrytype=text`
  - Headers: `authkey: <MSG91_AUTH_KEY>`
