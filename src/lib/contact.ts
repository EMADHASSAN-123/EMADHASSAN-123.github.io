/**
 * Contact form validation rules. They mirror the SQL constraints on
 * public.contact_messages (PHASE3_ARCH section 4.1) and are repeated
 * server-side in the Edge Function.
 */
export const CONTACT_LIMITS = {
  name: { min: 2, max: 100 },
  subject: { min: 3, max: 150 },
  message: { min: 10, max: 5000 },
  email: { max: 254 },
} as const;

export const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export type ContactField = 'name' | 'email' | 'subject' | 'message';
export type ContactError = 'required' | 'length' | 'email';

export function validateContactField(field: ContactField, raw: string): ContactError | null {
  const value = raw.trim();
  if (value.length === 0) return 'required';
  if (field === 'email') {
    return value.length > CONTACT_LIMITS.email.max || !EMAIL_PATTERN.test(value) ? 'email' : null;
  }
  const { min, max } = CONTACT_LIMITS[field];
  return value.length < min || value.length > max ? 'length' : null;
}
