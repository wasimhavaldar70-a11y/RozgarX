/**
 * MAHAJOBS: Supabase Storage Service
 * Enterprise document and asset management with strict MIME validation,
 * file-size constraints, path traversal prevention, and signed URLs.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface StorageUploadResult {
  success: boolean;
  path?: string;
  url?: string;
  fileName?: string;
  error?: string;
}

const MAX_RESUME_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_DOC_SIZE = 10 * 1024 * 1024;    // 10 MB
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;   // 2 MB

const ALLOWED_RESUME_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const ALLOWED_DOC_MIME = [
  'application/pdf',
  'image/jpeg',
  'image/png'
];

const ALLOWED_IMAGE_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml'
];

/**
 * Sanitize filename to prevent directory traversal and malicious filenames
 */
function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .substring(0, 100);
}

/**
 * Checks an SVG file for malicious active content (Stored XSS defense)
 */
async function validateSvgContent(file: File): Promise<boolean> {
  const text = await file.text();
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /onload\s*=/i,
    /onerror\s*=/i,
    /onclick\s*=/i,
    /onmouseover\s*=/i,
    /<foreignObject/i,
    /<iframe/i,
    /<object/i,
    /<embed/i
  ];
  return !dangerousPatterns.some(pattern => pattern.test(text));
}

export const storageService = {
  /**
   * Upload candidate resume to private bucket: candidate-resumes
   */
  async uploadResume(userId: string, file: File): Promise<StorageUploadResult> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase storage is not configured' };
    }

    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    if (file.size > MAX_RESUME_SIZE) {
      return { success: false, error: 'Resume must be less than 10 MB' };
    }

    if (!ALLOWED_RESUME_MIME.includes(file.type)) {
      return { success: false, error: 'Invalid file format. Only PDF and Word documents are permitted.' };
    }

    const cleanName = sanitizeFileName(file.name);
    const filePath = `${userId}/${Date.now()}_${cleanName}`;

    try {
      const { data, error } = await supabase.storage
        .from('candidate-resumes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        path: data.path,
        fileName: cleanName
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to upload resume' };
    }
  },

  /**
   * Generates a secure, time-limited signed URL for a candidate resume
   */
  async getSignedResumeUrl(path: string, expiresInSeconds: number = 3600): Promise<string | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase.storage
        .from('candidate-resumes')
        .createSignedUrl(path, expiresInSeconds);

      if (error || !data) return null;
      return data.signedUrl;
    } catch {
      return null;
    }
  },

  /**
   * Upload employer verification/KYC document to private bucket: employer-documents
   */
  async uploadEmployerDocument(userId: string, file: File, docType: string): Promise<StorageUploadResult> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase storage is not configured' };
    }

    if (file.size > MAX_DOC_SIZE) {
      return { success: false, error: 'Document must be less than 10 MB' };
    }

    if (!ALLOWED_DOC_MIME.includes(file.type)) {
      return { success: false, error: 'Invalid document format. Only PDF, JPG, and PNG are allowed.' };
    }

    const cleanName = sanitizeFileName(file.name);
    const cleanDocType = sanitizeFileName(docType);
    const filePath = `${userId}/${cleanDocType}_${Date.now()}_${cleanName}`;

    try {
      const { data, error } = await supabase.storage
        .from('employer-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        path: data.path,
        fileName: cleanName
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to upload verification document' };
    }
  },

  /**
   * Generates a time-limited signed URL for employer KYC document
   */
  async getSignedEmployerDocumentUrl(path: string, expiresInSeconds: number = 3600): Promise<string | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase.storage
        .from('employer-documents')
        .createSignedUrl(path, expiresInSeconds);

      if (error || !data) return null;
      return data.signedUrl;
    } catch {
      return null;
    }
  },

  /**
   * Upload company logo to public bucket: company-logos
   */
  async uploadCompanyLogo(companyId: string, file: File): Promise<StorageUploadResult> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase storage is not configured' };
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return { success: false, error: 'Logo must be less than 2 MB' };
    }

    if (!ALLOWED_IMAGE_MIME.includes(file.type)) {
      return { success: false, error: 'Invalid logo format. Only PNG, JPG, WebP, and SVG are supported.' };
    }

    // SVG Stored XSS defense
    if (file.type === 'image/svg+xml') {
      const isSafe = await validateSvgContent(file);
      if (!isSafe) {
        return { success: false, error: 'Malicious content or scripts detected in SVG file.' };
      }
    }

    const cleanName = sanitizeFileName(file.name);
    const filePath = `${companyId}/${Date.now()}_${cleanName}`;

    try {
      const { data, error } = await supabase.storage
        .from('company-logos')
        .upload(filePath, file, {
          cacheControl: '86400',
          upsert: true
        });

      if (error) {
        return { success: false, error: error.message };
      }

      const { data: pubData } = supabase.storage
        .from('company-logos')
        .getPublicUrl(data.path);

      return {
        success: true,
        path: data.path,
        url: pubData.publicUrl,
        fileName: cleanName
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to upload logo' };
    }
  },

  /**
   * Upload user avatar to public bucket: avatars
   */
  async uploadAvatar(userId: string, file: File): Promise<StorageUploadResult> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase storage is not configured' };
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return { success: false, error: 'Avatar must be less than 2 MB' };
    }

    const cleanName = sanitizeFileName(file.name);
    const filePath = `${userId}/${Date.now()}_${cleanName}`;

    try {
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '86400',
          upsert: true
        });

      if (error) {
        return { success: false, error: error.message };
      }

      const { data: pubData } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

      return {
        success: true,
        path: data.path,
        url: pubData.publicUrl,
        fileName: cleanName
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to upload avatar' };
    }
  }
};

