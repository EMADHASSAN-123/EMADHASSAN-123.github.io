/**
 * Server-side validation. Mirrors src/lib/contact.ts and the SQL
 * constraints in the contact_messages migration; keep the three in sync.
 */
export const LIMITS = {
  name: { min: 2, max: 100 },
  subject: { min: 3, max: 150 },
  message: { min: 10, max: 5000 },
  email: { max: 254 },
} as const;

export const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export type Field = 'name' | 'email' | 'subject' | 'message';
export type FieldError = 'required' | 'length' | 'email';
export type Locale = 'ar' | 'en';

export interface CleanMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
  locale: Locale;
}

/** Remove HTML tags and control characters (keeping newlines and tabs), then trim. */
export function sanitize(value: string): string {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim();
}

function check(field: Field, value: string): FieldError | null {
  if (value.length === 0) return 'required';
  if (field === 'email') {
    return value.length > LIMITS.email.max || !EMAIL_PATTERN.test(value) ? 'email' : null;
  }
  const { min, max } = LIMITS[field];
  return value.length < min || value.length > max ? 'length' : null;
}

export function validate(
  body: Record<string, unknown>,
): { ok: true; data: CleanMessage } | { ok: false; errors: Partial<Record<Field, FieldError>> } {
  const fields: Field[] = ['name', 'email', 'subject', 'message'];
  const data: Record<string, string> = {};
  const errors: Partial<Record<Field, FieldError>> = {};

  for (const field of fields) {
    const raw = body[field];
    const value = typeof raw === 'string' ? sanitize(raw) : '';
    const error = check(field, value);
    if (error) errors[field] = error;
    data[field] = value;
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  const locale: Locale = body.locale === 'en' ? 'en' : 'ar';
  return { ok: true, data: { ...(data as Omit<CleanMessage, 'locale'>), locale } };
}
