import { z } from 'zod';

/**
 * Email domain whitelist - only allow emails from these domains
 */
const ALLOWED_EMAIL_DOMAINS = (process.env.ALLOWED_EMAIL_DOMAINS || 'omio.com')
  .split(',')
  .map(d => d.trim().toLowerCase());

/**
 * Validate email format and domain
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  // Domain whitelist check
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain || !ALLOWED_EMAIL_DOMAINS.includes(domain)) {
    return {
      valid: false,
      error: `Email domain must be one of: ${ALLOWED_EMAIL_DOMAINS.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Sanitize string to prevent XSS attacks
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  // Remove HTML tags and encode special characters
  // Simple but effective: remove all HTML tags and encode dangerous characters
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"]/g, (char) => {
      const map: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
      };
      return map[char] || char;
    })
    .trim();
}

/**
 * Sanitize email headers to prevent header injection
 */
export function sanitizeEmailHeader(header: string): string {
  if (typeof header !== 'string') {
    return '';
  }
  // Remove newlines and carriage returns (CRLF injection prevention)
  return header.replace(/[\r\n]/g, '').trim();
}

/**
 * Validate email array
 */
export function validateEmailArray(emails: any[]): { valid: boolean; error?: string; validEmails?: string[] } {
  if (!Array.isArray(emails) || emails.length === 0) {
    return { valid: false, error: 'Recipients array is required and must not be empty' };
  }

  const validEmails: string[] = [];
  for (const email of emails) {
    if (typeof email !== 'string') {
      return { valid: false, error: 'All recipients must be valid email addresses' };
    }

    const validation = validateEmail(email);
    if (!validation.valid) {
      return { valid: false, error: validation.error };
    }

    validEmails.push(email.toLowerCase().trim());
  }

  return { valid: true, validEmails };
}

/**
 * Validate file type for uploads
 */
export function validateFileType(filename: string, allowedTypes: string[]): boolean {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext ? allowedTypes.includes(ext) : false;
}

/**
 * Validate file size (in bytes)
 */
export function validateFileSize(size: number, maxSizeBytes: number): boolean {
  return size <= maxSizeBytes;
}

