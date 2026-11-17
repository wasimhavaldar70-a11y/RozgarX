# ROZGARX (MAHAJOBS) — DATA BREACH INCIDENT RESPONSE PLAN

> **Document Version:** 1.0.0 (Production Privacy & Legal Edition)  
> **Effective Date:** November 2026  
> **Regulatory Alignment:** 
> - Digital Personal Data Protection Act, 2023 (India DPDP Act - Section 8(6))
> - Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 (India IT Act)
> - General Data Protection Regulation (GDPR - Articles 33 & 34)
> - California Consumer Privacy Act (CCPA / CPRA)

---

## 1. PURPOSE & OBJECTIVE
This Data Breach Incident Response Plan establishes clear protocols for detecting, assessing, containing, reporting, and mitigating any unauthorized access, leak, loss, or destruction of personal data handled by the RozgarX (MahaJobs) employment platform.

---

## 2. INCIDENT CLASSIFICATION TIERS

| Severity Level | Definition | Response Time | Regulatory Notification |
|---|---|:---:|:---:|
| **SEV-1 (Critical)** | Mass leak of sensitive personal data (passwords, government KYC documents, unmasked resumes of >500 users) or active database compromise. | **Immediate (< 1 hour)** | Mandatory (DPBI & affected individuals within DPDP timeline / GDPR 72 hrs) |
| **SEV-2 (High)** | Compromise of an individual employer or candidate account with data exfiltration, or unauthorized API access to masked talent pool. | **< 4 hours** | Evaluated by Grievance Officer; notify affected parties if risk of harm |
| **SEV-3 (Medium)** | Intercepted rate-limit challenge, failed brute force attempt, or transient logging anomaly with zero data exfiltration. | **< 24 hours** | Internal logging & patch; no regulatory report required |
| **SEV-4 (Low)** | Accidental non-sensitive metadata exposure with no personal identifying info. | **< 48 hours** | Internal review & mitigation |

---

## 3. INCIDENT RESPONSE TEAM & RESPONSIBILITIES

1. **Incident Commander / Technical Lead:**
   - Immediately isolates affected servers, invalidates compromised API keys/JWTs, and initiates database connection locks.
2. **Data Protection / Grievance Officer:**
   - **Name:** Legal & Compliance Desk, RozgarX
   - **Email:** `grievance@rozgarx.com` / `legal@rozgarx.com`
   - **Responsibility:** Assesses breach impact, drafts formal notifications, and acts as point of contact for regulators and affected data principals.
3. **Database Administrator:**
   - Audits immutable `public.audit_logs`, verifies PostgreSQL point-in-time recovery (PITR), and revokes unauthorized database roles.

---

## 4. 5-PHASE BREACH RESPONSE WORKFLOW

### Phase 1: Identification & Escalation
- Any automated alert (e.g. Supabase suspicious access, Edge rate-limit alert, API error spike) or user report triggers an immediate ticket to the Incident Response Team.

### Phase 2: Containment & Evidence Preservation
- **Immediate Actions:**
  - Rotate all compromised environment secrets (`SUPABASE_SERVICE_ROLE_KEY`, `MSG91_AUTH_KEY`).
  - Terminate active compromised sessions via `supabase.auth.admin.signOut(userId, 'global')`.
  - Block attacking IP ranges at Edge middleware (`src/middleware.ts`).
  - Preserve server logs, audit tables, and network traffic captures for forensic examination.

### Phase 3: Forensic Assessment & Eradication
- Determine root cause (e.g. leaked secret, misconfigured RLS, IDOR vulnerability).
- Verify whether personal identifying data (names, phone numbers, emails, KYC IDs) was exfiltrated.
- Apply code patches and database migrations to seal the vulnerability.

### Phase 4: Mandatory Notifications
Under **Section 8(6) of the Digital Personal Data Protection Act 2023**:
- RozgarX **must intimate the Data Protection Board of India (DPBI)** and **each affected individual** in such form and manner as prescribed under the DPDP Rules.
- **GDPR Requirement:** Where European data principals are impacted, notify the relevant Data Protection Authority within **72 hours** of becoming aware of the breach.
- **Notification Contents:**
  1. Nature, date, and time of the personal data breach.
  2. Categories and approximate number of affected candidates and employers.
  3. Likely consequences and risks to affected individuals.
  4. Remedial actions already taken or proposed by RozgarX.
  5. Contact details of the Grievance Officer for inquiries.

### Phase 5: Post-Incident Review & Hardening
- Complete a Root Cause Analysis (RCA) within 7 business days.
- Update security regression tests (`scripts/security_pentest_suite.cjs`) to prevent future regressions.
- Archive the incident report in tamper-proof compliance documentation.

---

## 5. CONTACT & REPORTING CHANNELS

- **Grievance Redressal:** [grievance-redressal](https://rozgarx.com/grievance-redressal)
- **Legal Inquiries:** `legal@rozgarx.com`
- **Emergency Security Contact:** `support@rozgarx.com`
