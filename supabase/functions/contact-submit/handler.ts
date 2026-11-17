/**
 * contact-submit request handling (PHASE3_ARCH section 5.2), written with
 * web-standard APIs only so it can be tested outside Deno. Order:
 * method/CORS → body → honeypot → validation → rate limit → insert.
 */
import { validate, type CleanMessage, type Locale } from './validation.ts';

export const RATE_LIMIT = { max: 3, windowMinutes: 10 } as const;
const MAX_BODY_BYTES = 16 * 1024;

export interface Store {
  /** Messages stored for this IP hash since the given time. */
  countSince(ipHash: string, sinceIso: string): Promise<number>;
  insert(row: CleanMessage & { ip_hash: string; user_agent: string | null }): Promise<void>;
}

export interface Config {
  allowedOrigin: string;
  ipHashSalt: string;
  store: Store;
  now?: () => Date;
}

const MESSAGES: Record<string, Record<Locale, string>> = {
  ok: { ar: 'أُرسلت رسالتك.', en: 'Your message was sent.' },
  invalid: { ar: 'راجع الحقول ثم أعد الإرسال.', en: 'Check the fields and send again.' },
  rateLimited: {
    ar: 'أرسلت عدة رسائل خلال وقت قصير. حاول مجدداً بعد 10 دقائق.',
    en: 'Too many messages in a short time. Try again in 10 minutes.',
  },
  failed: { ar: 'تعذّر حفظ الرسالة.', en: 'The message could not be saved.' },
};

function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });
}

/** First address in X-Forwarded-For, as set by the Supabase edge. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

export async function hashIp(ip: string, salt: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${ip}${salt}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function handle(request: Request, config: Config): Promise<Response> {
  const origin = request.headers.get('origin');

  // 1. CORS: exactly one allowed origin, no wildcards.
  if (!config.allowedOrigin || origin !== config.allowedOrigin) {
    return json(403, { ok: false, error: 'forbidden_origin' });
  }
  const cors = corsHeaders(origin);
  // Fail closed if the salt is missing: never store unsalted IP hashes.
  if (!config.ipHashSalt) {
    console.error('contact-submit misconfigured: IP_HASH_SALT is not set');
    return json(500, { ok: false, error: 'misconfigured' }, cors);
  }
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (request.method !== 'POST') {
    return json(
      405,
      { ok: false, error: 'method_not_allowed' },
      { ...cors, Allow: 'POST, OPTIONS' },
    );
  }

  // 2. Body: JSON, bounded size.
  if (!(request.headers.get('content-type') ?? '').includes('application/json')) {
    return json(415, { ok: false, error: 'unsupported_media_type' }, cors);
  }
  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) {
    return json(413, { ok: false, error: 'payload_too_large' }, cors);
  }
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(text);
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
    body = parsed as Record<string, unknown>;
  } catch {
    return json(400, { ok: false, error: 'invalid_json' }, cors);
  }
  const locale: Locale = body.locale === 'en' ? 'en' : 'ar';

  // 3. Honeypot: pretend success, store nothing.
  if (typeof body.honeypot === 'string' && body.honeypot.trim() !== '') {
    return json(200, { ok: true, message: MESSAGES.ok[locale] }, cors);
  }

  // 4. Validation + sanitization.
  const result = validate(body);
  if (!result.ok) {
    return json(
      400,
      { ok: false, error: 'invalid', fields: result.errors, message: MESSAGES.invalid[locale] },
      cors,
    );
  }

  // 5. Rate limit: at most 3 messages per IP hash per 10 minutes.
  const ipHash = await hashIp(clientIp(request), config.ipHashSalt);
  const now = config.now?.() ?? new Date();
  const since = new Date(now.getTime() - RATE_LIMIT.windowMinutes * 60_000).toISOString();
  try {
    if ((await config.store.countSince(ipHash, since)) >= RATE_LIMIT.max) {
      return json(
        429,
        { ok: false, error: 'rate_limited', message: MESSAGES.rateLimited[locale] },
        { ...cors, 'Retry-After': '600' },
      );
    }

    // 6. Insert with the service role (RLS denies everyone else).
    const userAgent = request.headers.get('user-agent')?.slice(0, 512) ?? null;
    await config.store.insert({ ...result.data, ip_hash: ipHash, user_agent: userAgent });
  } catch (error) {
    // Log the failure without personal data.
    console.error(
      'contact-submit storage error',
      error instanceof Error ? error.message : 'unknown',
    );
    return json(
      500,
      { ok: false, error: 'storage_failed', message: MESSAGES.failed[locale] },
      cors,
    );
  }

  // 7. Success.
  return json(200, { ok: true, message: MESSAGES.ok[result.data.locale] }, cors);
}
