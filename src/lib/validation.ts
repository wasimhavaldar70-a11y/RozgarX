/**
 * MAHAJOBS: Centralized Server-Side Input Validation Schemas
 * Powered by Zod (v3).
 * Enforces strict types, bounds, regexes, and rejects unauthorized extra fields (.strict()).
 */

import { z } from 'zod';
import { NextResponse } from 'next/server';

// ----------------------------------------------------------------------
// Reusable Indian Mobile Regex (Accepts 10 digits starting with 6-9,
// with optional +91, 91, or 0 prefix)
// ----------------------------------------------------------------------
const INDIAN_MOBILE_REGEX = /^(\+91[\-\s]?)?[0]?[6-9]\d{9}$/;

// ----------------------------------------------------------------------
// 1. Send OTP Schema (POST /api/otp/send)
// ----------------------------------------------------------------------
export const SendOtpSchema = z
  .object({
    mobile: z
      .string({ required_error: 'Mobile number is required' })
      .trim()
      .min(10, 'Mobile number must be at least 10 digits')
      .max(16, 'Mobile number is too long')
      .regex(INDIAN_MOBILE_REGEX, 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9'),
    role: z.enum(['candidate', 'employer'], {
      required_error: 'Registration role is required',
      invalid_type_error: 'Role must be either candidate or employer'
    })
  })
  .strict();

export type SendOtpInput = z.infer<typeof SendOtpSchema>;

// ----------------------------------------------------------------------
// 2. Verify OTP Schema (POST /api/otp/verify)
// ----------------------------------------------------------------------
export const VerifyOtpSchema = z
  .object({
    challengeId: z
      .string({ required_error: 'Challenge session ID is required' })
      .uuid('Challenge session ID must be a valid UUID format'),
    mobile: z
      .string({ required_error: 'Mobile number is required' })
      .trim()
      .regex(INDIAN_MOBILE_REGEX, 'Please enter a valid 10-digit Indian mobile number'),
    otp: z
      .string({ required_error: 'OTP code is required' })
      .trim()
      .regex(/^\d{6}$/, 'Please enter a valid 6-digit numeric OTP'),
    role: z.enum(['candidate', 'employer'], {
      required_error: 'Registration role is required',
      invalid_type_error: 'Role must be either candidate or employer'
    })
  })
  .strict();

export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;

// ----------------------------------------------------------------------
// 3. Resend OTP Schema (POST /api/otp/resend)
// ----------------------------------------------------------------------
export const ResendOtpSchema = z
  .object({
    mobile: z
      .string({ required_error: 'Mobile number is required' })
      .trim()
      .regex(INDIAN_MOBILE_REGEX, 'Please enter a valid 10-digit Indian mobile number'),
    role: z.enum(['candidate', 'employer'], {
      required_error: 'Registration role is required',
      invalid_type_error: 'Role must be either candidate or employer'
    }),
    challengeId: z.string().uuid('Invalid challenge session ID format').optional()
  })
  .strict();

export type ResendOtpInput = z.infer<typeof ResendOtpSchema>;

// ----------------------------------------------------------------------
// 4. Complete Registration Schema (POST /api/otp/complete)
// ----------------------------------------------------------------------
export const CompleteRegistrationSchema = z
  .object({
    role: z.enum(['candidate', 'employer'], {
      required_error: 'Registration role is required',
      invalid_type_error: 'Role must be either candidate or employer'
    }),
    approvalToken: z
      .string({ required_error: 'Approval token is required' })
      .trim()
      .min(32, 'Approval token must be at least 32 characters')
      .max(128, 'Approval token is too long'),
    email: z
      .string({ required_error: 'Email address is required' })
      .trim()
      .email('Please enter a valid email address')
      .max(255, 'Email address cannot exceed 255 characters'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters long for security')
      .max(100, 'Password cannot exceed 100 characters'),
    mobile: z
      .string({ required_error: 'Mobile number is required' })
      .trim()
      .regex(INDIAN_MOBILE_REGEX, 'Please enter a valid 10-digit Indian mobile number'),
    district: z
      .string({ required_error: 'Maharashtra district selection is required' })
      .trim()
      .min(2, 'District name must be at least 2 characters')
      .max(100, 'District name cannot exceed 100 characters'),
    city: z.string().trim().max(100).optional().default(''),

    // Candidate Specific Profile Fields
    fullName: z.string().trim().max(100).optional(),
    education: z.string().trim().max(150).optional(),
    skills: z.union([z.array(z.string().max(50)).max(30), z.string().max(1000)]).optional(),
    experience: z.union([z.string().max(100), z.number().min(0).max(60)]).optional(),
    expectedSalary: z.number().min(0).max(100000000).optional(),

    // Employer Specific Profile Fields
    companyName: z.string().trim().max(150).optional(),
    contactPerson: z.string().trim().max(100).optional(),
    industry: z.string().trim().max(100).optional(),
    companySize: z.string().trim().max(50).optional(),
    website: z.string().trim().max(200).optional(),
    address: z.string().trim().max(300).optional(),

    // Consents
    termsConsent: z.boolean().optional(),
    ageConfirmed: z.boolean().optional()
  })
  .strict()
  .refine(
    (data) => {
      if (data.role === 'candidate') {
        return Boolean(data.fullName && data.fullName.trim().length >= 2);
      }
      return true;
    },
    {
      message: 'Full name is required for candidate registration (minimum 2 characters)',
      path: ['fullName']
    }
  )
  .refine(
    (data) => {
      if (data.role === 'employer') {
        return Boolean(
          data.companyName &&
            data.companyName.trim().length >= 2 &&
            data.contactPerson &&
            data.contactPerson.trim().length >= 2
        );
      }
      return true;
    },
    {
      message: 'Company name and contact person are required for employer registration (minimum 2 characters each)',
      path: ['companyName']
    }
  );

export type CompleteRegistrationInput = z.infer<typeof CompleteRegistrationSchema>;

// ----------------------------------------------------------------------
// 5. Create Job Vacancy Schema (POST /api/jobs/create)
// ----------------------------------------------------------------------
export const CreateJobSchema = z
  .object({
    title: z
      .string({ required_error: 'Job title is required' })
      .trim()
      .min(3, 'Job title must be at least 3 characters')
      .max(120, 'Job title cannot exceed 120 characters'),
    category: z
      .string({ required_error: 'Job category is required' })
      .trim()
      .min(2, 'Job category must be at least 2 characters')
      .max(80, 'Job category cannot exceed 80 characters'),
    description: z
      .string({ required_error: 'Job description is required' })
      .trim()
      .min(10, 'Job description must be at least 10 characters')
      .max(5000, 'Job description cannot exceed 5000 characters'),
    responsibilities: z
      .array(z.string().trim().max(300))
      .max(25, 'Maximum 25 responsibilities allowed')
      .optional()
      .default([]),
    requiredSkills: z
      .array(z.string().trim().max(50))
      .max(30, 'Maximum 30 skills allowed')
      .optional()
      .default([]),
    educationRequirement: z.string().trim().max(100).optional().default('Any Graduate'),
    experienceMinYears: z
      .number({ invalid_type_error: 'Minimum experience must be a number' })
      .min(0, 'Minimum experience cannot be negative')
      .max(50, 'Minimum experience cannot exceed 50 years')
      .optional()
      .default(0),
    experienceMaxYears: z
      .number({ invalid_type_error: 'Maximum experience must be a number' })
      .min(0, 'Maximum experience cannot be negative')
      .max(50, 'Maximum experience cannot exceed 50 years')
      .optional()
      .default(5),
    salaryMin: z
      .number({ invalid_type_error: 'Minimum salary must be a number' })
      .min(0, 'Minimum salary cannot be negative')
      .max(100000000, 'Minimum salary exceeds allowed ceiling')
      .optional()
      .default(0),
    salaryMax: z
      .number({ invalid_type_error: 'Maximum salary must be a number' })
      .min(0, 'Maximum salary cannot be negative')
      .max(100000000, 'Maximum salary exceeds allowed ceiling')
      .optional()
      .default(0),
    salaryType: z
      .enum(['Per Month', 'Per Annum', 'Negotiable', 'Per Year', 'Per Day'], {
        invalid_type_error: 'Invalid salary type'
      })
      .optional()
      .default('Per Month'),
    vacancies: z
      .number({ invalid_type_error: 'Vacancies must be a number' })
      .int('Vacancies must be an integer')
      .min(1, 'At least 1 vacancy is required')
      .max(10000, 'Vacancies cannot exceed 10000')
      .optional()
      .default(1),
    jobType: z
      .enum(['Full Time', 'Part Time', 'Contract', 'Internship', 'Temporary'], {
        invalid_type_error: 'Invalid job type'
      })
      .optional()
      .default('Full Time'),
    workMode: z
      .enum(['Office', 'Remote', 'Hybrid'], {
        invalid_type_error: 'Invalid work mode'
      })
      .optional()
      .default('Office'),
    district: z
      .string({ required_error: 'District is required' })
      .trim()
      .min(2, 'District name must be at least 2 characters')
      .max(80, 'District name cannot exceed 80 characters')
      .optional()
      .default('Pune'),
    city: z
      .string({ required_error: 'City is required' })
      .trim()
      .min(2, 'City name must be at least 2 characters')
      .max(80, 'City name cannot exceed 80 characters')
      .optional()
      .default('Pune'),
    address: z.string().trim().max(300).optional().default(''),
    companyName: z.string().trim().min(2).max(150).optional().default('Maharashtra Enterprise'),
    companyId: z.string().uuid('Company ID must be a valid UUID').optional(),
    employerId: z.string().uuid('Employer ID must be a valid UUID').optional(),
    contactEmail: z.string().trim().email('Invalid contact email format').optional(),
    contactPhone: z.string().trim().regex(INDIAN_MOBILE_REGEX, 'Invalid contact phone format').optional(),
    status: z.enum(['pending', 'approved', 'rejected', 'paused', 'closed']).optional()
  })
  .strict()
  .refine((data) => data.experienceMaxYears >= data.experienceMinYears, {
    message: 'Maximum experience must be greater than or equal to minimum experience',
    path: ['experienceMaxYears']
  })
  .refine((data) => data.salaryMax >= data.salaryMin, {
    message: 'Maximum salary must be greater than or equal to minimum salary',
    path: ['salaryMax']
  });

export type CreateJobInput = z.infer<typeof CreateJobSchema>;

// ----------------------------------------------------------------------
// Generic Validation Execution Helper
// ----------------------------------------------------------------------
export type ValidationResult<T> =
  | { success: true; data: T; response?: never }
  | { success: false; response: NextResponse; data?: never };

export function validatePayload<T>(
  schema: z.ZodType<T, any, any>,
  rawData: unknown
): ValidationResult<T> {
  const result = schema.safeParse(rawData);
  if (!result.success) {
    const details = result.error.issues.map((i) => ({
      field: i.path.join('.'),
      message: i.message
    }));
    const firstErrorMessage = details[0]?.message || 'Validation error';
    const fieldPrefix = details[0]?.field ? `[${details[0].field}]: ` : '';

    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: `Validation Error: ${fieldPrefix}${firstErrorMessage}`,
          details
        },
        { status: 400 }
      )
    };
  }
  return { success: true, data: result.data };
}
