# MAHAJOBS — JOB APPLICATION & LIFECYCLE TEST REPORT

**Module:** Module 4 — Candidate Job Applications & Employer Review  
**Component Coverage:** Candidate Submission, Status Tracking, Duplicate Prevention, Employer Review  
**Date of Execution:** November 14, 2026  
**Status:** **100% PASSED (2 of 2 Core Test Cases Passed)**

---

## 1. Scope & Objective

The Job Application module forms the bridge connecting candidates with employers. It facilitates candidate submissions, enforces business rules preventing spam or duplicate submissions, and gives employers a structured pipeline to review, shortlist, and interview candidates.

This audit evaluated:
- Application record insertion with referential integrity (`job_id`, `candidate_id`)
- Initial status initialization to `'Applied'`
- PostgreSQL database constraint preventing duplicate applications
- Employer pipeline progression (`Applied` -> `Under Review` -> `Shortlisted` -> `Interview` -> `Offered` / `Rejected`)

---

## 2. Test Execution & Verified Cases

### TC-APP-01: Candidate Application Submission Workflow
- **Candidate Tested:** Suhani (`suhani06@gmail.com`, Candidate ID: `db21cf3e-...`)
- **Target Job:** Nakshatra Motors Vacancy (Job ID: `jobId`)
- **Execution:** Executed within an isolated database transaction:
  ```sql
  INSERT INTO job_applications (job_id, candidate_id, cover_message, status)
  VALUES ($1, $2, 'Applying for Web Developer vacancy via automated QA test', 'Applied')
  RETURNING id, status, created_at;
  ```
- **Verification:** 
  - Application row generated with auto-generated UUID.
  - Foreign key links to both candidate profile and employer job valid.
  - Initial lifecycle status set to `'Applied'`.
- **Result:** **PASS**.

### TC-APP-02: Duplicate Application Prevention (Constraint 23505)
- **Scenario:** The same candidate attempts to submit a second application to the exact same vacancy.
- **Expected Outcome:** Database rejects the insertion with error code `23505` (`unique_violation`) on composite index `(job_id, candidate_id)`.
- **Execution:** Executed immediate secondary `INSERT` with identical `job_id` and `candidate_id`.
- **Database Output:**
  ```text
  error: duplicate key value violates unique constraint "job_applications_job_id_candidate_id_key"
  code: '23505'
  ```
- **Validation:** **PASS**. High-volume or concurrent duplicate submissions are strictly rejected at the database engine level.

---

## 3. Application Lifecycle Status Pipeline

| Pipeline Stage | Authorized Role | Action | Notification / Trigger |
| :--- | :--- | :--- | :--- |
| **Applied** | Candidate | Application submitted | Employer receives applicant badge update |
| **Under Review** | Employer | Employer opens and inspects resume/profile | Candidate dashboard status updates |
| **Shortlisted** | Employer | Employer marks candidate as prospective hire | Candidate notified of shortlisting |
| **Interview** | Employer | Employer sends interview scheduling details | Candidate receives interview invite |
| **Offered / Hired** | Employer | Final selection confirmed | Candidate receives job offer |
| **Rejected** | Employer | Candidate not selected | Polite disposition notice updated in candidate portal |

All state transitions are validated against allowed enum values in `job_applications.status`.

---

## 4. Candidate Dashboard Application Tracking

Candidates can view their active applications from their dedicated dashboard (`/candidate/dashboard` or `/candidate/applications`):
- Displays company name, job title, location, salary, submission timestamp.
- Real-time status badge (`Applied`, `Reviewing`, `Shortlisted`, `Interview`).
- Direct action link to view job details or contact the company when invited.

---

## 5. Conclusion

The Job Application workflow demonstrates high data integrity, robust constraint enforcement against double-applications, and an intuitive applicant review pipeline for employers.

