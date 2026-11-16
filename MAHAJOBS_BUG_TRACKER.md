# MAHAJOBS — ENTERPRISE BUG TRACKER & DEFECT LOG

**Project:** MahaJobs (Maharashtra State Recruitment Platform)  
**QA Assessment Date:** November 14, 2026  
**Defect Management Status:** **ZERO OPEN BLOCKERS (0 Critical, 0 High, 0 Medium Open Defects)**

---

## 1. Defect Summary by Severity

| Severity Level | Total Logged | Resolved / Verified | Open Defects | Status |
| :--- | :---: | :---: | :---: | :---: |
| **Critical (P0)** | 2 | 2 | 0 | **CLEARED** |
| **High (P1)** | 3 | 3 | 0 | **CLEARED** |
| **Medium (P2)** | 2 | 2 | 0 | **CLEARED** |
| **Low / Cosmetic (P3)** | 1 | 1 | 0 | **CLEARED** |
| **TOTAL** | **8** | **8** | **0** | **100% RESOLVED** |

---

## 2. Resolved Defect Register

### BUG-001 [CRITICAL - RESOLVED]: Dashboard Sign-out Did Not Redirect to Homepage
- **Module:** Authentication & Navigation
- **Reported Behavior:** When a candidate, employer, or administrator clicked "Sign Out" from within their respective dashboard or sidebar, the session was signed out in Supabase but the browser remained on the dashboard URL or showed an empty/partially hydrated dashboard view.
- **Root Cause:** Next.js client component state was calling `supabase.auth.signOut()` without triggering an immediate hard or authoritative route redirection to the root home page (`/`).
- **Fix Implemented:** Updated [src/components/layout/Navbar.tsx](file:///d:/Projects/mahajobs---maharashtra-job-portal/src/components/layout/Navbar.tsx) and all dashboard sign-out handlers to perform a synchronous session flush followed by `window.location.href = '/'` or `router.push('/')` with history clearing.
- **Verification:** Verified in Next.js 16 build; sign-out from Candidate, Employer, and Admin dashboards immediately brings user to `/`.

---

### BUG-002 [CRITICAL - RESOLVED]: Candidate Personal Contact Details Exposed to Unauthenticated/Unverified Employers
- **Module:** Smart Talent Pool & Candidate Matching
- **Reported Behavior:** Candidate phone numbers, email addresses, and residential addresses were vulnerable to premature scraping or viewing by employers prior to candidate application or subscription unlock.
- **Root Cause:** Matching API returned candidate records without field-level data masking.
- **Fix Implemented:** Enhanced [src/services/matchingService.ts](file:///d:/Projects/mahajobs---maharashtra-job-portal/src/services/matchingService.ts) to enforce privacy masking on all candidate discovery queries:
  - Phone numbers converted to `+91 98XXX XXXXX (Protected)`
  - Emails masked to `name***@candidate.mahajobs`
  - Addresses masked to city/district level with street details omitted
  - `rawMobileExposed` and `rawEmailExposed` set strictly to `false`
- **Verification:** Passed test `TC-MATCH-07` with 100% compliance across all matching candidates.

---

### BUG-003 [HIGH - RESOLVED]: Duplicate Job Application Submissions
- **Module:** Job Applications
- **Reported Behavior:** Rapid clicking or concurrent submissions could create multiple application entries for the same candidate on the same job posting.
- **Root Cause:** Application creation did not have an enforced database-level uniqueness constraint.
- **Fix Implemented:** Added composite UNIQUE constraint in PostgreSQL:
  ```sql
  ALTER TABLE job_applications ADD CONSTRAINT job_applications_job_id_candidate_id_key UNIQUE (job_id, candidate_id);
  ```
- **Verification:** Verified via test `TC-APP-02`; second insertion attempt throws PostgreSQL error `23505` (`unique_violation`) and is rejected.

---

### BUG-004 [HIGH - RESOLVED]: Job Posting Form Lacked Auto-Populated Company Name & District Defaults
- **Module:** Job Posting
- **Reported Behavior:** Employers were required to manually re-type their company name or faced ambiguity regarding which company entity was posting the vacancy.
- **Root Cause:** Form component did not bind company name from the logged-in employer's linked company profile.
- **Fix Implemented:** Integrated automatic company linkage in job creation handlers; `company_id` and company display name are populated from the verified employer record.
- **Verification:** Verified via test `TC-JOB-01` and `TC-JOB-02`.

---

### BUG-005 [HIGH - RESOLVED]: Unapproved / Pending Moderation Jobs Visible in Public Search
- **Module:** Job Search & Moderation
- **Reported Behavior:** Jobs with status `pending` or `draft` were returned in broad public queries if filters were omitted.
- **Root Cause:** Search route handlers lacked default `status = 'approved'` predicate.
- **Fix Implemented:** Injected mandatory `status = 'approved'` filter in all public candidate-facing job search queries.
- **Verification:** Verified via test `TC-SRCH-03`.

---

### BUG-006 [MEDIUM - RESOLVED]: Inconsistent Candidate Matching Scores for Unrelated Professions
- **Module:** Candidate Matching Engine
- **Reported Behavior:** Candidates with completely unrelated skills (e.g., Accountant applying for Graphic Design) previously received inflated scores due to generic location and education defaults.
- **Root Cause:** Skills scoring weight was insufficient to differentiate domain suitability.
- **Fix Implemented:** Re-calibrated matching weights to:
  - Skills: 40 Points (Strict containment & token matching)
  - Location: 25 Points
  - Experience: 20 Points
  - Education: 15 Points
- **Verification:** Verified via tests `TC-MATCH-01` through `TC-MATCH-06`. Candidate C (Accountant) receives 0/40 on skills for Graphic Designer and scores below threshold (39%), while Candidate A scores 100%.

---

### BUG-007 [MEDIUM - RESOLVED]: Negative or Inverted Salary Range Inputs
- **Module:** Job Posting Validation
- **Reported Behavior:** Employers could enter `salary_min` greater than `salary_max`.
- **Root Cause:** Missing cross-field validation rule in Zod schema.
- **Fix Implemented:** Added `.refine(data => data.salaryMin <= data.salaryMax)` constraint with clear error messaging.
- **Verification:** Verified via test `TC-JOB-03`.

---

### BUG-008 [LOW - RESOLVED]: Empty Search Results Did Not Provide Helpful Guidance
- **Module:** Candidate Job Search UI
- **Reported Behavior:** Zero-match searches displayed a blank container without feedback.
- **Root Cause:** Missing empty state UI component in job list view.
- **Fix Implemented:** Added rich empty-state illustration with "Reset Filters" action button.
- **Verification:** Verified in UI component inspection.

---

## 3. Final Defect Disposition

There are currently **zero (0) open Critical or High defects** across the MahaJobs platform. All identified issues have been resolved, regression-tested, and verified against the live PostgreSQL database.

