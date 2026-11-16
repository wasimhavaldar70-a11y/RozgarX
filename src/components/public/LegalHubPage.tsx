'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Shield,
  UserCheck,
  Building2,
  CreditCard,
  AlertTriangle,
  Cookie,
  Scale,
  Printer,
  Search,
  Mail,
  MapPin,
  Phone,
  ExternalLink,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Lock,
  Eye,
  Info
} from 'lucide-react';

export type LegalDocId =
  | 'terms'
  | 'privacy'
  | 'job-seeker'
  | 'employer'
  | 'refund'
  | 'disclaimer'
  | 'cookies'
  | 'grievance';

interface LegalHubPageProps {
  initialDoc?: LegalDocId;
  onNavigate?: (view: string) => void;
}

export const LEGAL_DOCS = [
  {
    "id": "terms",
    "num": 1,
    "title": "Terms & Conditions",
    "shortTitle": "Terms of Service",
    "description": "Rules governing platform access, candidate rights, employer obligations, and candidate matching.",
    "icon": "FileText",
    "badge": "17 Sections",
    "slug": "terms-conditions",
    "rawText": "TERMS & CONDITIONS\n\n## 1. Introduction\n\nWelcome to RozgarX.\n\nRozgarX is an online job discovery and recruitment technology platform that connects job seekers with employers, recruiters, companies and businesses.\n\nBy accessing or using our website, mobile application or services, you agree to comply with these Terms & Conditions.\n\nIf you do not agree with these terms, please discontinue using our platform.\n\n## 2. Definitions\n\n- **Platform:** RozgarX website, mobile application and related services.\n- **Job Seeker:** An individual looking for employment opportunities.\n- **Employer:** A company, business, recruiter or authorized representative posting job opportunities.\n- **User:** Any person accessing or using RozgarX.\n- **Job Posting:** A vacancy or employment opportunity published on RozgarX.\n- **Application:** A job application submitted by a candidate.\n- **Candidate Matching:** An automated recommendation system that identifies potentially suitable candidates based on job requirements and candidate information.\n\n## 3. Eligibility\n\nUsers must:\n\n- Provide accurate registration information.\n- Have legal capacity to enter into an agreement.\n- Comply with applicable Indian laws.\n- Maintain the confidentiality of their account credentials.\n- Use the platform for legitimate employment-related purposes.\n\nUsers below 18 years must not register unless the relevant service is legally available to them and permitted under applicable law.\n\n## 4. Job Seeker Responsibilities\n\nJob seekers agree to:\n\n1. Provide genuine personal and professional information.\n2. Upload accurate educational and professional qualifications.\n3. Avoid submitting false resumes or certificates.\n4. Apply only for legitimate employment opportunities.\n5. Maintain professional communication with employers.\n6. Protect their login credentials.\n7. Verify job offers and employment conditions independently.\n\nRozgarX reserves the right to suspend accounts containing misleading, fraudulent or prohibited information.\n\n## 5. Employer Responsibilities\n\nEmployers agree to:\n\n1. Provide genuine company information.\n2. Publish accurate job descriptions.\n3. Specify salary, qualifications, location and experience requirements honestly.\n4. Use candidate information only for legitimate recruitment purposes.\n5. Not misuse, sell or unlawfully distribute candidate information.\n6. Avoid fraudulent recruitment practices.\n7. Follow applicable employment, privacy and anti-discrimination laws.\n8. Update or close vacancies that are no longer available.\n\nEmployers are responsible for their recruitment processes, communications and hiring decisions.\n\n## 6. Job Posting Rules\n\nThe following activities are prohibited:\n\n- Publishing fake job vacancies.\n- Misrepresenting salary or employment conditions.\n- Publishing misleading work-from-home opportunities.\n- Collecting money from candidates through fraudulent recruitment schemes.\n- Publishing illegal or discriminatory job advertisements.\n- Impersonating another company.\n- Posting malware, phishing links or harmful content.\n- Using job listings to promote unrelated products or services.\n\nRozgarX may investigate, restrict, suspend or remove such listings and accounts.\n\n## 7. Candidate Matching System\n\nRozgarX may provide automated candidate recommendations based on information such as:\n\n- Educational qualifications.\n- Skills and experience.\n- Job preferences.\n- Location.\n- Expected salary.\n- Job requirements.\n- Other relevant profile information.\n\nCandidate matching is provided as an informational and recommendation feature.\n\nA matching score or recommendation does not guarantee:\n\n- Candidate selection.\n- Interview invitations.\n- Employment.\n- Job suitability.\n- Employer acceptance.\n\nEmployers must independently review candidates and make their own recruitment decisions.\n\nRozgarX does not make final employment decisions.\n\n## 8. Job Applications\n\nBy submitting an application, the candidate authorizes RozgarX to transmit relevant application information to the employer associated with that vacancy.\n\nOnce information is shared with an employer, that employer may process it for recruitment purposes subject to applicable law and its own privacy obligations.\n\nRozgarX does not guarantee that an employer will:\n\n- View an application.\n- Contact an applicant.\n- Schedule an interview.\n- Provide feedback.\n- Make an employment offer.\n\n## 9. Account Verification\n\nRozgarX may use mobile OTP, email verification, document verification or other reasonable methods to verify accounts.\n\nVerification of a mobile number or email address does not independently establish a person's identity, qualifications, business legitimacy or employment authenticity.\n\nRozgarX may request additional information when necessary to investigate suspected fraud.\n\n## 10. Fees and Payments\n\nCertain RozgarX services may be free or paid.\n\nApplicable charges will be displayed before purchase.\n\nPaid services may include candidate profile services, employer subscriptions, featured job listings or other premium features introduced by RozgarX.\n\nPayment does not guarantee employment, interviews, candidate selection or hiring.\n\nAll applicable payment, cancellation and refund conditions will be communicated before a transaction.\n\n## 11. Intellectual Property\n\nRozgarX branding, logos, website design, software, platform content and original materials are protected by applicable intellectual property laws.\n\nUsers must not reproduce, distribute, modify or commercially exploit RozgarX intellectual property without authorization.\n\nUsers retain ownership of their original submitted content, subject to the limited permissions required to operate the platform.\n\n## 12. Account Suspension and Termination\n\nRozgarX may restrict, suspend or terminate an account if:\n\n- Fraudulent activity is detected.\n- False job advertisements are published.\n- Platform security is compromised.\n- A user violates these terms.\n- A legal or regulatory requirement requires action.\n- An account is used for unauthorized or harmful activities.\n\nWhere appropriate and legally permissible, users may be informed of the action and available review process.\n\n## 13. Third-Party Services\n\nRozgarX may integrate third-party services, including SMS providers, payment gateways, analytics tools and external websites.\n\nRozgarX is not responsible for the independent operations, availability or policies of third-party services.\n\nUsers should review the relevant third-party terms where applicable.\n\n## 14. Limitation of Liability\n\nTo the extent permitted by applicable law, RozgarX shall not be responsible for:\n\n- Employer hiring decisions.\n- Candidate misrepresentation.\n- Fraud committed independently by third parties.\n- Incorrect information submitted by users.\n- Employment conditions determined by employers.\n- Third-party service interruptions.\n- Indirect losses arising from the use of the platform.\n\nNothing in these terms excludes liability that cannot legally be excluded.\n\n## 15. Changes to Terms\n\nRozgarX may update these terms from time to time.\n\nUpdated terms will be published on the platform with a revised effective date.\n\nWhere required, users will be notified or asked to provide fresh acceptance.\n\n## 16. Governing Law\n\nThese terms shall be governed by the laws of India.\n\nDisputes shall be subject to the jurisdiction of competent courts in Pune / Mumbai, Maharashtra, India, subject to applicable law.\n\n## 17. Contact Information\n\n**RozgarX Legal Department**\n\nBusiness Name: RozgarX Technologies Private Limited  \nAddress: 402, Platinum Business Square, Hinjewadi Phase 1, Pune, Maharashtra 411057, India  \nEmail: legal@rozgarx.com  \nWebsite: https://rozgarx.com\n\n---\n\n",
    "sections": [
      {
        "title": "",
        "content": [
          "Welcome to RozgarX.",
          "RozgarX is an online job discovery and recruitment technology platform that connects job seekers with employers, recruiters, companies and businesses.",
          "**Platform Operator and Business Identity:** RozgarX is a recruitment technology platform currently operated by an individual operator based in Peth Vadgaon, Kolhapur, Maharashtra, India. RozgarX is currently a brand name and is not represented as an incorporated company, LLP or other registered legal entity. Website: https://rozgarx.com. Business Address: Main Road, Peth Vadgaon, Kolhapur, Maharashtra 416112, India. Legal and Customer Support Email: support@rozgarx.com.",
          "All applicable agreements and terms are entered into with the actual legal person operating RozgarX, as identified above.",
          "By accessing or using our website, mobile application or services, you agree to comply with these Terms & Conditions.",
          "If you do not agree with these terms, please discontinue using our platform."
        ]
      },
      {
        "title": "1. Introduction",
        "content": [
          "Welcome to RozgarX.",
          "RozgarX is an online job discovery and recruitment technology platform that connects job seekers with employers, recruiters, companies and businesses.",
          "By accessing or using our website, mobile application or services, you agree to comply with these Terms & Conditions.",
          "If you do not agree with these terms, please discontinue using our platform."
        ]
      },
      {
        "title": "2. Definitions",
        "content": [
          "- **Platform:** RozgarX website, mobile application and related services.",
          "- **Job Seeker:** An individual looking for employment opportunities.",
          "- **Employer:** A company, business, recruiter or authorized representative posting job opportunities.",
          "- **User:** Any person accessing or using RozgarX.",
          "- **Job Posting:** A vacancy or employment opportunity published on RozgarX.",
          "- **Application:** A job application submitted by a candidate.",
          "- **Candidate Matching:** An automated recommendation system that identifies potentially suitable candidates based on job requirements and candidate information."
        ]
      },
      {
        "title": "3. Eligibility",
        "content": [
          "Users must:",
          "- Provide accurate registration information.",
          "- Have legal capacity to enter into an agreement.",
          "- Comply with applicable Indian laws.",
          "- Maintain the confidentiality of their account credentials.",
          "- Use the platform for legitimate employment-related purposes.",
          "Users below 18 years must not register unless the relevant service is legally available to them and permitted under applicable law."
        ]
      },
      {
        "title": "4. Job Seeker Responsibilities",
        "content": [
          "Job seekers agree to:",
          "1. Provide genuine personal and professional information.",
          "2. Upload accurate educational and professional qualifications.",
          "3. Avoid submitting false resumes or certificates.",
          "4. Apply only for legitimate employment opportunities.",
          "5. Maintain professional communication with employers.",
          "6. Protect their login credentials.",
          "7. Verify job offers and employment conditions independently.",
          "RozgarX reserves the right to suspend accounts containing misleading, fraudulent or prohibited information."
        ]
      },
      {
        "title": "5. Employer Responsibilities",
        "content": [
          "Employers agree to:",
          "1. Provide genuine company information.",
          "2. Publish accurate job descriptions.",
          "3. Specify salary, qualifications, location and experience requirements honestly.",
          "4. Use candidate information only for legitimate recruitment purposes.",
          "5. Not misuse, sell or unlawfully distribute candidate information.",
          "6. Avoid fraudulent recruitment practices.",
          "7. Follow applicable employment, privacy and anti-discrimination laws.",
          "8. Update or close vacancies that are no longer available.",
          "Employers are responsible for their recruitment processes, communications and hiring decisions."
        ]
      },
      {
        "title": "6. Job Posting Rules",
        "content": [
          "The following activities are prohibited:",
          "- Publishing fake job vacancies.",
          "- Misrepresenting salary or employment conditions.",
          "- Publishing misleading work-from-home opportunities.",
          "- Collecting money from candidates through fraudulent recruitment schemes.",
          "- Publishing illegal or discriminatory job advertisements.",
          "- Impersonating another company.",
          "- Posting malware, phishing links or harmful content.",
          "- Using job listings to promote unrelated products or services.",
          "RozgarX may investigate, restrict, suspend or remove such listings and accounts."
        ]
      },
      {
        "title": "7. Candidate Matching System",
        "content": [
          "RozgarX may provide automated candidate recommendations based on information such as:",
          "- Educational qualifications.",
          "- Skills and experience.",
          "- Job preferences.",
          "- Location.",
          "- Expected salary.",
          "- Job requirements.",
          "- Other relevant profile information.",
          "Candidate matching is provided as an informational and recommendation feature.",
          "A matching score or recommendation does not guarantee:",
          "- Candidate selection.",
          "- Interview invitations.",
          "- Employment.",
          "- Job suitability.",
          "- Employer acceptance.",
          "Employers must independently review candidates and make their own recruitment decisions.",
          "RozgarX does not make final employment decisions.",
          "### Candidate Profile Visibility and Employer Access",
          "RozgarX provides a candidate discovery feature that allows verified employers to search and identify potentially suitable candidates.",
          "Candidate profiles will be searchable by verified employers only when the candidate has explicitly enabled employer discoverability.",
          "Candidates may choose whether their profiles are searchable through their account privacy settings.",
          "When discoverability is enabled, relevant professional information may be shared with verified employers, including: Candidate name or display name, professional qualifications, education, skills, work experience, preferred job location, and employment preferences.",
          "Sensitive personal information, authentication credentials and unnecessary private documents will not be exposed through general employer search.",
          "Candidates may disable employer discoverability at any time from their account settings. Disabling discoverability will prevent future searches through the platform, but cannot retrieve information already accessed, downloaded or independently retained by an employer.",
          "RozgarX may restrict an employer's search privileges if misuse, unauthorized access or suspicious activity is detected."
        ]
      },
      {
        "title": "8. Job Applications",
        "content": [
          "By submitting an application, the candidate authorizes RozgarX to transmit relevant application information to the employer associated with that vacancy.",
          "Once information is shared with an employer, that employer may process it for recruitment purposes subject to applicable law and its own privacy obligations.",
          "RozgarX does not guarantee that an employer will:",
          "- View an application.",
          "- Contact an applicant.",
          "- Schedule an interview.",
          "- Provide feedback.",
          "- Make an employment offer."
        ]
      },
      {
        "title": "9. Account Verification",
        "content": [
          "RozgarX may use mobile OTP, email verification, document verification or other reasonable methods to verify accounts.",
          "Verification of a mobile number or email address does not independently establish a person's identity, qualifications, business legitimacy or employment authenticity.",
          "RozgarX may request additional information when necessary to investigate suspected fraud."
        ]
      },
      {
        "title": "10. Fees and Payments",
        "content": [
          "RozgarX may provide free and paid services for job seekers and employers.",
          "### Candidate Registration Fee – ₹199",
          "RozgarX may charge candidates a registration fee of ₹199 for access to designated candidate registration and profile-related services.",
          "The fee and the services included will be clearly displayed before the candidate completes payment.",
          "The registration service may include:",
          "1. Candidate account registration.",
          "2. Candidate profile creation.",
          "3. Professional information and skill submission.",
          "4. Eligibility for candidate-job matching.",
          "5. Profile discoverability by verified employers, subject to candidate consent and visibility settings.",
          "6. Access to applicable job discovery and application features.",
          "**Payment Conditions:**",
          "- The registration fee is ₹199.",
          "- The payment is for the specified platform services, not for securing employment.",
          "- Payment does not guarantee interviews, employer responses, job offers or selection.",
          "- No recurring subscription will be charged unless separately disclosed and expressly authorized.",
          "- Applicable taxes, if any, will be disclosed at checkout.",
          "- A payment receipt or confirmation will be provided.",
          "- Refund requests will be evaluated under the published Refund & Cancellation Policy and applicable consumer laws.",
          "RozgarX will not represent payment as a guarantee of employment.",
          "### Employer Subscriptions & Services",
          "Applicable charges for employer job posting credits, featured listings, or subscription packages will be displayed before purchase.",
          "Payment does not guarantee candidate selection or hiring outcomes."
        ]
      },
      {
        "title": "11. Intellectual Property",
        "content": [
          "RozgarX branding, logos, website design, software, platform content and original materials are protected by applicable intellectual property laws.",
          "Users must not reproduce, distribute, modify or commercially exploit RozgarX intellectual property without authorization.",
          "Users retain ownership of their original submitted content, subject to the limited permissions required to operate the platform."
        ]
      },
      {
        "title": "12. Account Suspension and Termination",
        "content": [
          "RozgarX may restrict, suspend or terminate an account if:",
          "- Fraudulent activity is detected.",
          "- False job advertisements are published.",
          "- Platform security is compromised.",
          "- A user violates these terms.",
          "- A legal or regulatory requirement requires action.",
          "- An account is used for unauthorized or harmful activities.",
          "Where appropriate and legally permissible, users may be informed of the action and available review process."
        ]
      },
      {
        "title": "13. Third-Party Services",
        "content": [
          "RozgarX may integrate third-party services, including SMS providers, payment gateways, analytics tools and external websites.",
          "RozgarX is not responsible for the independent operations, availability or policies of third-party services.",
          "Users should review the relevant third-party terms where applicable."
        ]
      },
      {
        "title": "14. Limitation of Liability",
        "content": [
          "To the extent permitted by applicable law, RozgarX shall not be responsible for:",
          "- Employer hiring decisions.",
          "- Candidate misrepresentation.",
          "- Fraud committed independently by third parties.",
          "- Incorrect information submitted by users.",
          "- Employment conditions determined by employers.",
          "- Third-party service interruptions.",
          "- Indirect losses arising from the use of the platform.",
          "Nothing in these terms excludes liability that cannot legally be excluded."
        ]
      },
      {
        "title": "15. Changes to Terms",
        "content": [
          "RozgarX may update these terms from time to time.",
          "Updated terms will be published on the platform with a revised effective date.",
          "Where required, users will be notified or asked to provide fresh acceptance."
        ]
      },
      {
        "title": "16. Governing Law",
        "content": [
          "These terms shall be governed by the laws of India.",
          "Disputes shall be subject to the jurisdiction of competent courts in Kolhapur / Pune, Maharashtra, India, subject to applicable law."
        ]
      },
      {
        "title": "17. Contact Information",
        "content": [
          "**RozgarX Legal & Support**",
          "Platform Operator: Individual Proprietor / Operator",
          "Brand Name: RozgarX",
          "Postal Address: Peth Vadgaon, Kolhapur, Maharashtra 416112, India",
          "Email: support@rozgarx.com / legal@rozgarx.com",
          "Website: https://rozgarx.com"
        ]
      }
    ]
  },
  {
    "id": "privacy",
    "num": 2,
    "title": "Privacy Policy",
    "shortTitle": "Privacy Policy",
    "description": "How RozgarX collects, safeguards, uses, and retains personal data for candidates and employers.",
    "icon": "Shield",
    "badge": "13 Sections",
    "slug": "privacy-policy",
    "rawText": "PRIVACY POLICY\n\n## 1. Introduction\n\nRozgarX respects the privacy of job seekers, employers and visitors.\n\nThis Privacy Policy explains how we collect, use, store, process and share personal information through our platform.\n\nWe aim to handle personal data transparently and in accordance with applicable Indian data protection laws.\n\n## 2. Information We Collect\n\n### A. Candidate Information\n\n- Full name.\n- Mobile number.\n- Email address.\n- City and location.\n- Educational qualifications.\n- Work experience.\n- Skills and professional interests.\n- Resume and uploaded documents.\n- Job preferences.\n- Application history.\n\n### B. Employer Information\n\n- Company name.\n- Business address.\n- Contact person's name.\n- Mobile number.\n- Email address.\n- Company details.\n- Business verification documents, where required.\n- Job postings and recruitment information.\n\n### C. Technical Information\n\n- IP address.\n- Browser information.\n- Device information.\n- Website activity.\n- Login timestamps.\n- Cookies and similar technologies.\n\n## 3. How We Use Information\n\nRozgarX may process personal information for:\n\n1. Account registration.\n2. Mobile OTP verification.\n3. Candidate profile management.\n4. Employer account verification.\n5. Job posting and discovery.\n6. Candidate-job matching.\n7. Job application processing.\n8. Notifications and service updates.\n9. Customer support.\n10. Fraud prevention and security.\n11. Platform analytics and improvement.\n12. Payment processing, where applicable.\n13. Compliance with legal obligations.\n\n## 4. Candidate Information Sharing\n\nCandidate information may be shared with employers when:\n\n- A candidate applies for a job.\n- A candidate chooses to make their profile discoverable.\n- A candidate authorizes profile sharing.\n- Sharing is otherwise permitted or required under applicable law.\n\nRozgarX should provide candidates with clear controls over profile visibility.\n\nChanging visibility settings may not reverse information already shared with an employer.\n\n## 5. Employer Information\n\nEmployer information may be displayed publicly to identify companies and their job vacancies.\n\nRozgarX may display company names, logos, job descriptions and business information submitted by employers.\n\n## 6. Automated Candidate Matching\n\nRozgarX may process profile and job information to generate candidate recommendations.\n\nThis may include qualifications, skills, location, experience and employer-defined requirements.\n\nMatching recommendations are intended to support recruitment activities and should not replace independent human assessment.\n\n## 7. Data Security\n\nRozgarX will implement reasonable technical and organizational safeguards appropriate to the nature of the information processed.\n\nThese may include:\n\n- Secure authentication.\n- Database access controls.\n- Role-based permissions.\n- Encryption where appropriate.\n- Secure file storage.\n- Monitoring and security logging.\n- Access restrictions.\n- Backup and recovery procedures.\n\nNo online system can guarantee absolute security.\n\n## 8. Data Retention\n\nPersonal information will be retained only for as long as necessary for the stated purposes, subject to legal and regulatory obligations.\n\nRozgarX may retain certain records where necessary for security, fraud prevention, accounting or legal compliance.\n\n## 9. User Rights\n\nSubject to applicable law, users may have rights to:\n\n- Request information about their personal data.\n- Request correction of inaccurate information.\n- Request deletion of personal information.\n- Withdraw consent.\n- Raise privacy-related grievances.\n- Exercise other applicable statutory rights.\n\nRequests can be submitted through the contact details provided below.\n\n## 10. Third-Party Services\n\nRozgarX may use third-party providers for:\n\n- SMS OTP.\n- Payment processing.\n- Cloud hosting.\n- Database infrastructure.\n- Analytics.\n- Email and communication services.\n\nThese providers may process information as necessary to deliver their services, subject to applicable arrangements and law.\n\n## 11. Children's Privacy\n\nRozgarX is not intended for individuals who are not legally eligible to use the relevant employment services.\n\nWe do not knowingly collect children's personal information in violation of applicable law.\n\n## 12. Policy Updates\n\nRozgarX may revise this Privacy Policy when its services, technology or legal requirements change.\n\nThe latest version will be published on our website.\n\n## 13. Privacy Contact\n\nEmail: privacy@rozgarx.com  \nAddress: 402, Platinum Business Square, Hinjewadi Phase 1, Pune, Maharashtra 411057, India\n\n---\n\n",
    "sections": [
      {
        "title": "",
        "content": [
          "RozgarX respects the privacy of job seekers, employers and visitors.",
          "This Privacy Policy explains how we collect, use, store, process and share personal information through our platform.",
          "RozgarX is operated by an individual operator based in Peth Vadgaon, Kolhapur, Maharashtra, India (Brand Name: RozgarX).",
          "We aim to handle personal data transparently and in accordance with applicable Indian data protection laws, including the Digital Personal Data Protection (DPDP) Act, 2023 and DPDP Rules, 2025."
        ]
      },
      {
        "title": "1. Introduction",
        "content": [
          "RozgarX respects the privacy of job seekers, employers and visitors.",
          "This Privacy Policy explains how we collect, use, store, process and share personal information through our platform.",
          "We aim to handle personal data transparently and in accordance with applicable Indian data protection laws."
        ]
      },
      {
        "title": "2. Information We Collect",
        "content": [
          "### A. Candidate Information",
          "- Full name.",
          "- Mobile number.",
          "- Email address.",
          "- City and location.",
          "- Educational qualifications.",
          "- Work experience.",
          "- Skills and professional interests.",
          "- Resume and uploaded documents.",
          "- Job preferences.",
          "- Application history.",
          "### B. Employer Information",
          "- Company name.",
          "- Business address.",
          "- Contact person's name.",
          "- Mobile number.",
          "- Email address.",
          "- Company details.",
          "- Business verification documents, where required.",
          "- Job postings and recruitment information.",
          "### C. Technical Information",
          "- IP address.",
          "- Browser information.",
          "- Device information.",
          "- Website activity.",
          "- Login timestamps.",
          "- Cookies and similar technologies."
        ]
      },
      {
        "title": "3. How We Use Information",
        "content": [
          "RozgarX may process personal information for:",
          "1. Account registration.",
          "2. Mobile OTP verification.",
          "3. Candidate profile management.",
          "4. Employer account verification.",
          "5. Job posting and discovery.",
          "6. Candidate-job matching.",
          "7. Job application processing.",
          "8. Notifications and service updates.",
          "9. Customer support.",
          "10. Fraud prevention and security.",
          "11. Platform analytics and improvement.",
          "12. Payment processing, where applicable.",
          "13. Compliance with legal obligations."
        ]
      },
      {
        "title": "Employer Search and Candidate Profile Discovery",
        "content": [
          "RozgarX allows verified employers to search for candidates using professional and employment-related information.",
          "Candidate profiles will only become searchable after the candidate actively enables the employer discovery feature (opt-in consent).",
          "Candidates will be informed about the categories of information made available to verified employers.",
          "RozgarX will implement access restrictions so that only authorized and verified employer accounts can access the candidate discovery feature.",
          "Candidates may disable profile discoverability at any time through their account settings.",
          "Disabling discoverability does not automatically delete information previously shared with employers or information already included in submitted job applications.",
          "RozgarX will not make candidate profiles publicly searchable by default through unrestricted public search engines.",
          "Employers must use candidate information only for legitimate recruitment purposes and must not sell, publish or misuse candidate information.",
          "Candidates may contact RozgarX to request access, correction or deletion of their personal information, subject to applicable legal requirements."
        ]
      },
      {
        "title": "4. Candidate Information Sharing",
        "content": [
          "Candidate information may be shared with employers when:",
          "- A candidate applies for a job.",
          "- A candidate chooses to make their profile discoverable.",
          "- A candidate authorizes profile sharing.",
          "- Sharing is otherwise permitted or required under applicable law.",
          "RozgarX should provide candidates with clear controls over profile visibility.",
          "Changing visibility settings may not reverse information already shared with an employer."
        ]
      },
      {
        "title": "5. Employer Information",
        "content": [
          "Employer information may be displayed publicly to identify companies and their job vacancies.",
          "RozgarX may display company names, logos, job descriptions and business information submitted by employers."
        ]
      },
      {
        "title": "6. Automated Candidate Matching",
        "content": [
          "RozgarX may process profile and job information to generate candidate recommendations.",
          "This may include qualifications, skills, location, experience and employer-defined requirements.",
          "Matching recommendations are intended to support recruitment activities and should not replace independent human assessment."
        ]
      },
      {
        "title": "7. Data Security",
        "content": [
          "RozgarX will implement reasonable technical and organizational safeguards appropriate to the nature of the information processed.",
          "These may include:",
          "- Secure authentication.",
          "- Database access controls.",
          "- Role-based permissions.",
          "- Encryption where appropriate.",
          "- Secure file storage.",
          "- Monitoring and security logging.",
          "- Access restrictions.",
          "- Backup and recovery procedures.",
          "No online system can guarantee absolute security."
        ]
      },
      {
        "title": "8. Data Retention",
        "content": [
          "Personal information will be retained only for as long as necessary for the stated purposes, subject to legal and regulatory obligations.",
          "RozgarX may retain certain records where necessary for security, fraud prevention, accounting or legal compliance."
        ]
      },
      {
        "title": "9. User Rights",
        "content": [
          "Subject to applicable law, users may have rights to:",
          "- Request information about their personal data.",
          "- Request correction of inaccurate information.",
          "- Request deletion of personal information.",
          "- Withdraw consent.",
          "- Raise privacy-related grievances.",
          "- Exercise other applicable statutory rights.",
          "Requests can be submitted through the contact details provided below."
        ]
      },
      {
        "title": "10. Third-Party Services",
        "content": [
          "RozgarX may use third-party providers for:",
          "- SMS OTP.",
          "- Payment processing.",
          "- Cloud hosting.",
          "- Database infrastructure.",
          "- Analytics.",
          "- Email and communication services.",
          "These providers may process information as necessary to deliver their services, subject to applicable arrangements and law."
        ]
      },
      {
        "title": "11. Children's Privacy",
        "content": [
          "RozgarX is not intended for individuals who are not legally eligible to use the relevant employment services.",
          "We do not knowingly collect children's personal information in violation of applicable law."
        ]
      },
      {
        "title": "12. Policy Updates",
        "content": [
          "RozgarX may revise this Privacy Policy when its services, technology or legal requirements change.",
          "The latest version will be published on our website."
        ]
      },
      {
        "title": "13. Privacy Contact",
        "content": [
          "Email: privacy@rozgarx.com / support@rozgarx.com",
          "Postal Address: Peth Vadgaon, Kolhapur, Maharashtra 416112, India"
        ]
      }
    ]
  },
  {
    "id": "job-seeker",
    "num": 3,
    "title": "Job Seeker Agreement",
    "shortTitle": "Candidate Agreement",
    "description": "Candidate code of conduct, profile authenticity, and critical zero-fee safety guidelines.",
    "icon": "UserCheck",
    "badge": "10 Rules & Safety",
    "slug": "job-seeker-agreement",
    "rawText": "JOB SEEKER AGREEMENT\n\nBy registering as a job seeker on RozgarX, you agree that:\n\n1. You will provide genuine and accurate information.\n2. You are responsible for maintaining your profile.\n3. You will not upload fake educational certificates or experience documents.\n4. You will use the platform only for legitimate employment purposes.\n5. Your profile information may be shared according to your privacy settings and application choices.\n6. Employers may independently contact you regarding relevant vacancies.\n7. RozgarX does not guarantee interviews or employment.\n8. Candidate matching is an automated recommendation, not a guarantee.\n9. You should independently verify employers and job offers.\n10. You will report suspicious job postings or recruitment requests.\n\n**Important Candidate Safety Notice**\n\nRozgarX does not authorize anyone to demand money in exchange for guaranteed employment.\n\nDo not share OTPs, passwords, banking PINs or other confidential credentials with recruiters.\n\nReport suspicious recruitment activity immediately.\n\n---\n\n",
    "sections": [
      {
        "title": "Candidate Terms & Registration Policy",
        "content": [
          "By registering as a job seeker on RozgarX, you agree that:",
          "1. You will provide genuine, accurate, and truthful information.",
          "2. You are responsible for maintaining and updating your profile.",
          "3. You will not upload fake educational certificates or forged experience documents.",
          "4. You will use the platform only for legitimate employment and career opportunities.",
          "5. Your profile information will only be discoverable to verified employers if you explicitly enable employer discoverability in your privacy settings.",
          "6. Verified employers may independently contact you regarding vacancies matching your profile.",
          "7. RozgarX does not guarantee interviews, employment offers, or hiring outcomes.",
          "8. Candidate matching is an automated recommendation system, not an employment guarantee.",
          "9. You should independently verify employers, job offers, and workplace conditions before accepting any offer.",
          "10. You will report any suspicious job postings, fee demands, or unethical recruitment requests immediately."
        ]
      },
      {
        "title": "Candidate Registration Fee (₹199)",
        "content": [
          "RozgarX may charge candidates a registration fee of ₹199 for access to designated candidate registration and profile-related services.",
          "The registration service includes: Account registration, profile creation, professional skill submission, eligibility for candidate-job matching, opt-in profile discoverability by verified employers, and job application features.",
          "**Important Conditions:**",
          "- The ₹199 fee is strictly for specified platform access and profile features, NOT for securing employment.",
          "- Payment does not guarantee interviews, employer callbacks, or job offers.",
          "- No recurring subscription will be charged without separate affirmative disclosure and authorization.",
          "- Refund requests are assessed under our Refund & Cancellation Policy."
        ]
      },
      {
        "title": "Critical Candidate Safety Advisory",
        "content": [
          "**Never Pay for Job Offers or Guaranteed Interviews:**",
          "RozgarX does not authorize anyone to demand money in exchange for guaranteed employment or interview selection.",
          "Never share OTPs, passwords, UPI PINs, banking credentials, or Aadhaar OTPs with any employer or recruiter.",
          "Report any suspicious recruitment activity to grievance@rozgarx.com immediately."
        ]
      }
    ]
  },
  {
    "id": "employer",
    "num": 4,
    "title": "Employer Agreement",
    "shortTitle": "Employer Agreement",
    "description": "Standards for posting genuine vacancies, fair hiring, and candidate data privacy commitments.",
    "icon": "Building2",
    "badge": "10 Rules & Standards",
    "slug": "employer-agreement",
    "rawText": "EMPLOYER AGREEMENT\n\nBy creating an employer account, you agree that:\n\n1. Your company information is accurate.\n2. You are authorized to recruit on behalf of the business.\n3. Your job advertisements represent genuine vacancies.\n4. Salary and employment details are accurately represented.\n5. Candidate information will be used only for legitimate recruitment.\n6. Candidate information will not be sold or unlawfully distributed.\n7. You will not use the platform for fraudulent or misleading activities.\n8. You will comply with applicable employment and privacy laws.\n9. You are responsible for your recruitment and selection decisions.\n10. You will notify RozgarX if your account is compromised.\n\nRozgarX reserves the right to request business verification and investigate suspicious employer activity.\n\n---\n\n",
    "sections": [
      {
        "title": "Employer Code of Conduct & Recruitment Rules",
        "content": [
          "By creating an employer account on RozgarX, you agree that:",
          "1. Your company and business information is genuine, verified, and accurate.",
          "2. You are authorized to recruit on behalf of the business.",
          "3. Your job advertisements represent bona fide, existing vacancies.",
          "4. Salary, job location, work mode, and employment requirements are accurately and honestly stated.",
          "5. Candidate information accessed through applications or discovery will be used SOLELY for legitimate recruitment purposes.",
          "6. Candidate personal contact details, resumes, and profiles will NEVER be sold, scraped, published, or unlawfully distributed.",
          "7. You will not demand any application fees, deposit fees, or training charges from job seekers.",
          "8. You will comply with all applicable employment, anti-discrimination, and data privacy laws.",
          "9. You are solely responsible for your hiring and selection decisions.",
          "10. You will promptly notify RozgarX if your account or credentials become compromised."
        ]
      },
      {
        "title": "Candidate Discovery Access & Verification",
        "content": [
          "Access to search and discover candidate profiles is restricted strictly to verified employers.",
          "Candidate profiles are searchable only when the candidate has actively granted opt-in discoverability.",
          "RozgarX reserves the right to request business verification documents (Udyam, GSTIN, CIN) and to revoke or suspend employer search privileges immediately if misuse or unauthorized access is detected."
        ]
      }
    ]
  },
  {
    "id": "refund",
    "num": 5,
    "title": "Refund & Cancellation Policy",
    "shortTitle": "Refund Policy",
    "description": "Transparent payment terms, credit consumption rules, non-guarantee disclosures, and dispute claims.",
    "icon": "CreditCard",
    "badge": "6 Sections",
    "slug": "refund-policy",
    "rawText": "REFUND & CANCELLATION POLICY\n\n## 1. General Policy\n\nRozgarX may provide free and paid services.\n\nAll applicable prices and service conditions will be displayed before payment.\n\n## 2. Paid Services\n\nPaid services may include:\n\n- Premium candidate services.\n- Profile-related services.\n- Employer subscriptions.\n- Featured job listings.\n- Promotional recruitment services.\n\nThe exact services included in each purchase will be communicated at checkout.\n\n## 3. Refund Eligibility\n\nRefund requests will be assessed according to:\n\n- The service purchased.\n- Whether the service was delivered.\n- Duplicate or incorrect transactions.\n- Unauthorized transactions.\n- Technical failures.\n- Applicable consumer protection laws.\n\n## 4. Non-Guarantee of Employment\n\nPayment for a RozgarX service does not guarantee:\n\n- A job.\n- An interview.\n- Employer contact.\n- Candidate selection.\n- A particular salary.\n- Employment within a specified period.\n\n## 5. Refund Requests\n\nUsers may submit refund requests through:\n\nEmail: support@rozgarx.com\n\nRequests should include:\n\n- Registered mobile number.\n- Transaction reference.\n- Payment date.\n- Reason for requesting a refund.\n\nApproved refunds will be processed through the original payment method or another lawful method, subject to applicable payment-provider timelines.\n\n## 6. Statutory Rights\n\nNothing in this policy removes any consumer rights available under applicable Indian law.\n\n---\n\n",
    "sections": [
      {
        "title": "1. Payment & Registration Fee",
        "content": [
          "Candidates may be charged ₹199 for the registration services displayed on the RozgarX website.",
          "The applicable fee and included services will be disclosed before payment."
        ]
      },
      {
        "title": "2. Eligible Refund Situations",
        "content": [
          "A refund request may be considered in the following situations:",
          "- Duplicate payment for the same registration.",
          "- Payment deducted but registration not successfully activated.",
          "- Technical failure preventing delivery of the purchased service.",
          "- Unauthorized transactions, subject to investigation.",
          "- Other circumstances where a refund is required under applicable law."
        ]
      },
      {
        "title": "3. Refund Assessment",
        "content": [
          "Refund requests will be reviewed using transaction records, payment gateway information and service activation records."
        ]
      },
      {
        "title": "4. Refund Procedure",
        "content": [
          "Candidates may contact RozgarX with:",
          "- Registered mobile number.",
          "- Transaction ID.",
          "- Payment date.",
          "- Description of the issue.",
          "Approved refunds will be processed through the original payment method wherever possible, subject to payment provider procedures and applicable law."
        ]
      },
      {
        "title": "5. No Employment Guarantee",
        "content": [
          "The ₹199 registration fee is for the specified RozgarX platform services.",
          "It is not a payment for guaranteed employment, interviews or selection."
        ]
      },
      {
        "title": "6. Statutory Rights & Support",
        "content": [
          "Nothing in this policy restricts consumer rights available under applicable Indian law.",
          "Support Email: support@rozgarx.com",
          "Postal Address: Peth Vadgaon, Kolhapur, Maharashtra 416112, India"
        ]
      }
    ]
  },
  {
    "id": "disclaimer",
    "num": 6,
    "title": "Platform Disclaimer",
    "shortTitle": "Disclaimer",
    "description": "Technology intermediary role, non-guarantee of selection, and independent verification advisory.",
    "icon": "AlertTriangle",
    "badge": "Intermediary Notice",
    "slug": "disclaimer",
    "rawText": "DISCLAIMER\n\nRozgarX is a technology platform that facilitates connections between job seekers and employers.\n\nRozgarX does not guarantee employment, candidate selection, interviews or successful recruitment.\n\nJob descriptions, employer information, salary details and vacancy availability may be supplied by third parties.\n\nAlthough RozgarX may implement verification and moderation processes, it cannot guarantee the accuracy or legitimacy of every employer, vacancy or candidate submission.\n\nUsers should independently verify important information before making employment-related decisions.\n\nEmployers are solely responsible for their recruitment and hiring decisions.\n\nCandidates are responsible for reviewing employment conditions before accepting any offer.\n\nRozgarX does not act as an employer for vacancies advertised by third-party employers.\n\n---\n\n",
    "sections": [
      {
        "title": "",
        "content": [
          "DISCLAIMER",
          "RozgarX is a technology platform that facilitates connections between job seekers and employers.",
          "RozgarX does not guarantee employment, candidate selection, interviews or successful recruitment.",
          "Job descriptions, employer information, salary details and vacancy availability may be supplied by third parties.",
          "Although RozgarX may implement verification and moderation processes, it cannot guarantee the accuracy or legitimacy of every employer, vacancy or candidate submission.",
          "Users should independently verify important information before making employment-related decisions.",
          "Employers are solely responsible for their recruitment and hiring decisions.",
          "Candidates are responsible for reviewing employment conditions before accepting any offer.",
          "RozgarX does not act as an employer for vacancies advertised by third-party employers.",
          "---"
        ]
      }
    ]
  },
  {
    "id": "cookies",
    "num": 7,
    "title": "Cookie Policy",
    "shortTitle": "Cookie Policy",
    "description": "Use of session cookies, security tokens, performance trackers, and browser controls.",
    "icon": "Cookie",
    "badge": "3 Sections",
    "slug": "cookie-policy",
    "rawText": "COOKIE POLICY\n\n## 1. What Are Cookies?\n\nCookies are small data files stored on a user's device when accessing a website.\n\n## 2. Why RozgarX Uses Cookies\n\nCookies and similar technologies may be used for:\n\n- Login sessions.\n- Account authentication.\n- Website security.\n- User preferences.\n- Website performance.\n- Analytics, where enabled.\n\n## 3. Cookie Management\n\nUsers may manage cookies through their browser settings.\n\nDisabling certain cookies may affect website functionality.\n\nRozgarX will implement consent and preference mechanisms where required by applicable law.\n\n---\n\n",
    "sections": [
      {
        "title": "",
        "content": [
          "COOKIE POLICY"
        ]
      },
      {
        "title": "1. What Are Cookies?",
        "content": [
          "Cookies are small data files stored on a user's device when accessing a website."
        ]
      },
      {
        "title": "2. Why RozgarX Uses Cookies",
        "content": [
          "Cookies and similar technologies may be used for:",
          "- Login sessions.",
          "- Account authentication.",
          "- Website security.",
          "- User preferences.",
          "- Website performance.",
          "- Analytics, where enabled."
        ]
      },
      {
        "title": "3. Cookie Management",
        "content": [
          "Users may manage cookies through their browser settings.",
          "Disabling certain cookies may affect website functionality.",
          "RozgarX will implement consent and preference mechanisms where required by applicable law.",
          "---"
        ]
      }
    ]
  },
  {
    "id": "grievance",
    "num": 8,
    "title": "Grievance Redressal Policy",
    "shortTitle": "Grievance Redressal",
    "description": "Official dispute resolution, statutory grievance officer contact, and strict investigation timelines.",
    "icon": "Scale",
    "badge": "IT Rules 2021 Compliant",
    "slug": "grievance-redressal",
    "rawText": "GRIEVANCE REDRESSAL POLICY\n\nRozgarX aims to provide a transparent process for handling complaints.\n\n## 1. Types of Complaints\n\nUsers may report:\n\n- Fake job postings.\n- Fraudulent employers.\n- Incorrect candidate information.\n- Privacy violations.\n- Unauthorized account access.\n- Payment-related issues.\n- Misuse of personal information.\n- Harassment or inappropriate communication.\n- Other platform-related concerns.\n\n## 2. How to Submit a Complaint\n\nUsers can submit complaints through:\n\nEmail: grievance@rozgarx.com  \nWebsite: https://rozgarx.com/grievance-redressal  \nAddress: 402, Platinum Business Square, Hinjewadi Phase 1, Pune, Maharashtra 411057, India\n\nPlease provide sufficient information to identify and investigate the issue.\n\n## 3. Grievance Officer\n\nName: Wasim Havaldar  \nDesignation: Grievance Officer  \nEmail: grievance@rozgarx.com  \nAddress: 402, Platinum Business Square, Hinjewadi Phase 1, Pune, Maharashtra 411057, India\n\nComplaints will be handled within the timelines applicable to RozgarX under relevant Indian laws and regulations.\n\n## 4. Investigation\n\nRozgarX may:\n\n- Review reported information.\n- Request additional evidence.\n- Restrict suspicious accounts.\n- Remove prohibited content.\n- Refer matters to appropriate authorities where legally required.\n\n## 5. User Communication\n\nRozgarX will communicate relevant decisions or updates through the contact details provided by the complainant, subject to applicable law.\n\n---",
    "sections": [
      {
        "title": "1. Types of Complaints Handled",
        "content": [
          "Users may report:",
          "- Fake job postings or misleading vacancies.",
          "- Fraudulent recruiters or demands for money.",
          "- Incorrect candidate or company information.",
          "- Privacy violations or unauthorized access to candidate profiles.",
          "- Unauthorized account activity or security breaches.",
          "- Payment-related issues or refund disputes regarding the ₹199 registration fee.",
          "- Misuse of personal information or resume scraping.",
          "- Harassment or unprofessional communication."
        ]
      },
      {
        "title": "2. How to Submit a Grievance",
        "content": [
          "Users can submit formal complaints through:",
          "Email: grievance@rozgarx.com",
          "Website: https://rozgarx.com/grievance-redressal",
          "Postal Address: RozgarX Grievance Redressal, Peth Vadgaon, Kolhapur, Maharashtra 416112, India.",
          "Please provide your registered mobile number, email, transaction reference (if applicable), and full description of the issue."
        ]
      },
      {
        "title": "3. Appointed Grievance Officer & Statutory Timelines",
        "content": [
          "**Statutory Compliance under Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules (Amended):**",
          "- **Grievance Officer:** Wasim Havaldar",
          "- **Designation:** Senior Grievance Officer",
          "- **Email:** grievance@rozgarx.com",
          "- **Office Address:** Main Road, Peth Vadgaon, Kolhapur, Maharashtra 416112, India.",
          "- **Acknowledgement Timeline:** Within 24 hours of receiving the grievance.",
          "- **Resolution Timeline:** Within 7 days from the date of receipt, with expedited handling for urgent safety or impersonation complaints as required by law."
        ]
      },
      {
        "title": "4. Investigation & Action",
        "content": [
          "RozgarX may:",
          "- Review reported listings, candidate records, or employer communications.",
          "- Request supporting documentation or transaction proofs.",
          "- Temporarily restrict or permanently suspend offending accounts.",
          "- Immediately remove fraudulent, misleading, or prohibited job advertisements.",
          "- Refer illegal or extortionary recruitment activities to appropriate law enforcement authorities."
        ]
      },
      {
        "title": "5. Resolution & User Communication",
        "content": [
          "RozgarX will communicate formal decisions, corrective actions, or case updates to the complainant via email or registered phone within the statutory 7-day resolution window."
        ]
      }
    ]
  }
];

export const LegalHubPage: React.FC<LegalHubPageProps> = ({ initialDoc = 'terms', onNavigate }) => {
  const [activeDocId, setActiveDocId] = useState<LegalDocId>(initialDoc);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  useEffect(() => {
    if (initialDoc) {
      setActiveDocId(initialDoc);
    }
  }, [initialDoc]);

  // Sync browser URL cleanly when tab changes without full reload
  const handleSelectDoc = (id: LegalDocId) => {
    setActiveDocId(id);
    const targetDoc = LEGAL_DOCS.find(d => d.id === id);
    if (targetDoc) {
      try {
        window.history.pushState(null, '', `/${targetDoc.slug}`);
      } catch (e) {
        // ignore in SSR or sandbox
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard?.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2500);
  };

  const currentDocIndex = LEGAL_DOCS.findIndex(d => d.id === activeDocId);
  const currentDoc = LEGAL_DOCS[currentDocIndex] || LEGAL_DOCS[0];
  const prevDoc = currentDocIndex > 0 ? LEGAL_DOCS[currentDocIndex - 1] : null;
  const nextDoc = currentDocIndex < LEGAL_DOCS.length - 1 ? LEGAL_DOCS[currentDocIndex + 1] : null;

  // Filter sections by search query if present
  const displayedSections = useMemo(() => {
    if (!searchQuery.trim()) return currentDoc.sections;
    const q = searchQuery.toLowerCase();
    return currentDoc.sections.filter(sec => {
      const matchTitle = sec.title.toLowerCase().includes(q);
      const matchContent = sec.content.some(line => line.toLowerCase().includes(q));
      return matchTitle || matchContent;
    });
  }, [currentDoc, searchQuery]);

  const renderIcon = (iconName: string, className: string = 'w-5 h-5') => {
    switch (iconName) {
      case 'FileText': return <FileText className={className} />;
      case 'Shield': return <Shield className={className} />;
      case 'UserCheck': return <UserCheck className={className} />;
      case 'Building2': return <Building2 className={className} />;
      case 'CreditCard': return <CreditCard className={className} />;
      case 'AlertTriangle': return <AlertTriangle className={className} />;
      case 'Cookie': return <Cookie className={className} />;
      case 'Scale': return <Scale className={className} />;
      default: return <FileText className={className} />;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 pb-20 font-sans print:bg-white print:pb-0">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-slate-900 text-white border-b border-slate-800 py-6 px-4 sm:px-6 lg:px-8 print:hidden">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate ? onNavigate('home') : (window.location.href = '/')}
                className="hover:text-blue-400 transition-colors"
              >
                Home
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-slate-300">Legal Documentation</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-blue-400 font-medium">{currentDoc.title}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                India Jurisdiction • Kolhapur, Maharashtra
              </span>
              <span className="text-slate-400 text-xs hidden sm:inline">
                Last Updated: 16 Nov 2026
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                RozgarX Legal & Compliance Hub
              </h1>
              <p className="text-slate-400 text-sm mt-1 max-w-2xl">
                Official terms, candidate registration fee (₹199), opt-in discoverability standards, refund policies, and statutory grievance mechanisms.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-xs"
                title="Print or Save as PDF"
              >
                <Printer className="w-4 h-4 text-blue-400" />
                <span>Print / PDF</span>
              </button>

              <button
                onClick={() => handleSelectDoc('grievance')}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-xs shadow-purple-900/30"
              >
                <Scale className="w-4 h-4" />
                <span>Grievance Officer (7-Day SLA)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Navigation Sidebar */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-4 print:hidden">
            {/* Search within document */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search in this document..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 placeholder-slate-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Document Tabs List */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Documents (8)
                </span>
                <span className="text-[11px] text-slate-500 font-medium">India Jurisdiction</span>
              </div>

              <div className="p-2 space-y-1">
                {LEGAL_DOCS.map((doc) => {
                  const isActive = doc.id === activeDocId;
                  return (
                    <button
                      key={doc.id}
                      onClick={() => handleSelectDoc(doc.id as LegalDocId)}
                      className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 relative ${
                        isActive
                          ? 'bg-blue-50/80 text-blue-900 border border-blue-200/80 shadow-xs'
                          : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-transparent'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {renderIcon(doc.icon, 'w-4 h-4')}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold truncate">
                            Doc {doc.num}: {doc.shortTitle}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {doc.badge}
                        </p>
                      </div>

                      {isActive && (
                        <div className="w-1.5 h-5 bg-blue-600 rounded-full shrink-0 self-center" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Candidate Registration Fee & Non-Guarantee Notice */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 p-4 rounded-2xl border border-blue-200/80 space-y-2.5">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                <CreditCard className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Candidate Registration Fee – ₹199</span>
              </div>
              <p className="text-[11px] text-blue-950 leading-relaxed">
                The ₹199 fee provides platform account creation, profile management, and candidate matching eligibility. <strong>Payment does not guarantee interviews or employment.</strong>
              </p>
              <button
                onClick={() => handleSelectDoc('refund')}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1"
              >
                Read ₹199 Refund Terms →
              </button>
            </div>

            {/* Candidate Discoverability Opt-In Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50/60 p-4 rounded-2xl border border-emerald-200/80 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <Eye className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Opt-In Profile Discoverability</span>
              </div>
              <p className="text-[11px] text-emerald-950 leading-relaxed">
                Candidate profiles are searchable by verified employers <strong>only when the candidate explicitly enables discoverability</strong> in privacy settings.
              </p>
              <button
                onClick={() => handleSelectDoc('privacy')}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
              >
                View Privacy Controls →
              </button>
            </div>

            {/* Grievance Redressal Card with 7-Day SLA */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 text-xs">
              <div className="flex items-center gap-2 text-purple-900 font-bold">
                <Scale className="w-4 h-4 text-purple-600" />
                <span>Statutory Grievance Redressal</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Intermediary Grievance SLA under amended IT Rules: <strong>24-hour acknowledgement</strong> and <strong>7-day resolution window</strong>.
              </p>
              <div className="bg-purple-50/60 p-2.5 rounded-xl border border-purple-200/70 text-[11px] space-y-1">
                <div className="font-semibold text-purple-950">Wasim Havaldar</div>
                <div className="text-purple-700">Senior Grievance Officer</div>
                <div className="text-slate-500 text-[10px]">Peth Vadgaon, Kolhapur, Maharashtra</div>
                <div className="flex items-center justify-between text-purple-700 font-mono text-[10px] pt-1">
                  <span>grievance@rozgarx.com</span>
                  <button
                    onClick={() => handleCopyEmail('grievance@rozgarx.com')}
                    className="hover:text-purple-900 font-sans"
                    title="Copy Email"
                  >
                    {copiedEmail === 'grievance@rozgarx.com' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <button
                onClick={() => handleSelectDoc('grievance')}
                className="w-full py-1.5 px-3 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-center text-[11px] font-semibold transition-colors"
              >
                View Full Grievance Procedure
              </button>
            </div>
          </div>

          {/* Right Main Content Panel */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            {/* Document Header Card */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-700">
                    DOCUMENT {currentDoc.num} OF 8
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    RozgarX Statutory Documentation
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Last Updated: 16 Nov 2026
                  </span>
                  <span>•</span>
                  <span>Jurisdiction: India (Kolhapur, Maharashtra)</span>
                </div>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  {renderIcon(currentDoc.icon, 'w-7 h-7 text-blue-600 shrink-0')}
                  <span>{currentDoc.title}</span>
                </h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {currentDoc.description}
                </p>
              </div>

              {/* Contextual Disclosures per Document */}
              {currentDoc.id === 'terms' && (
                <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-xl space-y-2 text-xs text-amber-950 leading-relaxed">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <Info className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Platform Operator & Business Status Disclosure</span>
                  </div>
                  <p>
                    RozgarX is a recruitment technology platform operated by an individual operator based in <strong>Peth Vadgaon, Kolhapur, Maharashtra, India</strong>. RozgarX is currently a brand name and is not represented as an incorporated company, LLP or other registered corporate legal entity. All applicable agreements are entered into with the actual legal person operating RozgarX.
                  </p>
                </div>
              )}

              {currentDoc.id === 'refund' && (
                <div className="p-4 bg-blue-50/80 border border-blue-200/80 rounded-xl space-y-1.5 text-xs text-blue-950 leading-relaxed">
                  <div className="flex items-center gap-2 font-bold text-blue-900">
                    <CreditCard className="w-4 h-4 text-blue-700 shrink-0" />
                    <span>Candidate Registration Fee: ₹199 – Clear Non-Guarantee Mandate</span>
                  </div>
                  <p>
                    The ₹199 candidate registration fee covers platform services, profile hosting, and matching eligibility. <strong>Payment does not guarantee job placement, interview calls, or employer selection.</strong> Refunds are governed exclusively by Section 2 (Duplicate transactions, non-activation, or technical failures).
                  </p>
                </div>
              )}

              {currentDoc.id === 'privacy' && (
                <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-xl space-y-1.5 text-xs text-emerald-950 leading-relaxed">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <Shield className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>DPDP Act, 2023 & Opt-In Discoverability Protections</span>
                  </div>
                  <p>
                    Candidate profiles are never exposed to public search engines or unverified third parties. Employer search access is granted strictly to verified employers and only when the candidate has actively toggled discoverability on.
                  </p>
                </div>
              )}

              {currentDoc.id === 'job-seeker' && (
                <div className="p-4 bg-rose-50/80 border border-rose-200/80 rounded-xl space-y-1.5 text-xs text-rose-950 leading-relaxed">
                  <div className="flex items-center gap-2 font-bold text-rose-900">
                    <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
                    <span>Zero Tolerance for Fraudulent Recruitment Schemes</span>
                  </div>
                  <p>
                    RozgarX does not authorize anyone to demand money in exchange for guaranteed employment or interview selection. Never transfer money, share OTPs, or give UPI PINs to recruiters.
                  </p>
                </div>
              )}

              {currentDoc.id === 'grievance' && (
                <div className="p-4 bg-purple-50/80 border border-purple-200/80 rounded-xl space-y-1.5 text-xs text-purple-950 leading-relaxed">
                  <div className="flex items-center gap-2 font-bold text-purple-900">
                    <Scale className="w-4 h-4 text-purple-700 shrink-0" />
                    <span>Amended Information Technology Intermediary Rules (7-Day Resolution SLA)</span>
                  </div>
                  <p>
                    In accordance with the amended IT Intermediary Rules, all grievances are formally acknowledged within <strong>24 hours</strong> and resolved within <strong>7 days</strong> by our appointed Grievance Officer.
                  </p>
                </div>
              )}
            </div>

            {/* Document Content Sections */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-8">
              {displayedSections.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-sm font-semibold text-slate-700">
                    No clauses matched "{searchQuery}" in this document.
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Clear Search Filter
                  </button>
                </div>
              ) : (
                displayedSections.map((sec, secIdx) => (
                  <section key={secIdx} className="space-y-3 border-b border-slate-100 last:border-b-0 pb-6 last:pb-0">
                    {sec.title && (
                      <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-600 inline-block shrink-0" />
                        <span>{sec.title}</span>
                      </h3>
                    )}

                    <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
                      {sec.content.map((line, lineIdx) => {
                        const trimmed = line.trim();
                        if (!trimmed) return null;

                        // Subheading (### ...)
                        if (trimmed.startsWith('### ')) {
                          return (
                            <h4 key={lineIdx} className="text-sm font-bold text-slate-900 mt-4 pt-2">
                              {trimmed.replace(/^###s+/, '')}
                            </h4>
                          );
                        }

                        // Bold callout or heading (**Important...**)
                        if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length < 90) {
                          return (
                            <div key={lineIdx} className="font-bold text-slate-900 pt-2">
                              {trimmed.replace(/\*\*/g, '')}
                            </div>
                          );
                        }

                        // Bulleted list (- ...)
                        if (trimmed.startsWith('- ')) {
                          return (
                            <div key={lineIdx} className="flex items-start gap-2.5 pl-2 py-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                              <span>{trimmed.replace(/^- s*/, '')}</span>
                            </div>
                          );
                        }

                        // Numbered list (1. ...)
                        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
                        if (numMatch) {
                          return (
                            <div key={lineIdx} className="flex items-start gap-3 pl-2 py-1">
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold shrink-0 mt-0.5">
                                {numMatch[1]}
                              </span>
                              <span>{numMatch[2]}</span>
                            </div>
                          );
                        }

                        // Standard paragraph
                        return (
                          <p key={lineIdx} className="text-slate-700 leading-relaxed">
                            {trimmed}
                          </p>
                        );
                      })}
                    </div>
                  </section>
                ))
              )}

              {/* Special Grievance Officer Table Card for Document 8 */}
              {currentDoc.id === 'grievance' && (
                <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-600 text-white rounded-xl shadow-xs">
                      <Scale className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">
                        Designated Grievance Redressal Officer
                      </h4>
                      <p className="text-xs text-slate-500">
                        Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules (Amended 2026)
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
                      <div className="text-slate-400 text-[11px] font-semibold uppercase">Officer Name & Role</div>
                      <div className="font-bold text-slate-900 text-sm">Wasim Havaldar</div>
                      <div className="text-slate-600">Senior Grievance Officer, RozgarX</div>
                      <div className="text-purple-700 text-[11px] font-semibold pt-1">
                        Acknowledgement: Within 24 Hours • Resolution: Within 7 Days
                      </div>
                    </div>

                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
                      <div className="text-slate-400 text-[11px] font-semibold uppercase">Official Grievance Channel</div>
                      <div className="font-bold text-purple-600 font-mono text-sm flex items-center justify-between">
                        <span>grievance@rozgarx.com</span>
                        <button
                          onClick={() => handleCopyEmail('grievance@rozgarx.com')}
                          className="hover:text-purple-800 font-sans text-xs flex items-center gap-1 text-slate-500"
                        >
                          {copiedEmail === 'grievance@rozgarx.com' ? 'Copied!' : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <div className="text-slate-500 text-[10px]">
                        Website: https://rozgarx.com/grievance-redressal
                      </div>
                    </div>

                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1 sm:col-span-2">
                      <div className="text-slate-400 text-[11px] font-semibold uppercase">Physical Office Address</div>
                      <div className="font-semibold text-slate-800">
                        RozgarX Grievance Redressal Office
                      </div>
                      <div className="text-slate-600 text-xs">
                        Main Road, Peth Vadgaon, Kolhapur District, Maharashtra 416112, India.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Document Navigation Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs print:hidden">
              {prevDoc ? (
                <button
                  onClick={() => handleSelectDoc(prevDoc.id as LegalDocId)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous: Doc {prevDoc.num} ({prevDoc.shortTitle})</span>
                </button>
              ) : (
                <div />
              )}

              {nextDoc ? (
                <button
                  onClick={() => handleSelectDoc(nextDoc.id as LegalDocId)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-xs"
                >
                  <span>Next: Doc {nextDoc.num} ({nextDoc.shortTitle})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => handleSelectDoc('terms')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors"
                >
                  <span>Return to Terms & Conditions</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Operator Identity & Contact Card */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h4 className="font-bold text-sm text-white">RozgarX Platform Operator Details</h4>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Operated by an individual operator • Peth Vadgaon, Kolhapur, Maharashtra, India
                  </p>
                </div>
                <div className="text-xs text-slate-400">
                  Brand Name: RozgarX • Jurisdiction: India
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-800/80 rounded-xl space-y-1">
                  <div className="text-slate-400 text-[11px] font-semibold flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                    Customer Support
                  </div>
                  <div className="text-slate-200 font-mono">support@rozgarx.com</div>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl space-y-1">
                  <div className="text-slate-400 text-[11px] font-semibold flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    Data Privacy Contact
                  </div>
                  <div className="text-slate-200 font-mono">privacy@rozgarx.com</div>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl space-y-1">
                  <div className="text-slate-400 text-[11px] font-semibold flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-purple-400" />
                    Grievance Officer (7-Day SLA)
                  </div>
                  <div className="text-slate-200 font-mono">grievance@rozgarx.com</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalHubPage;
