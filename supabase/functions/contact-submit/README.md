# contact-submit

Supabase Edge Function that receives the contact form and stores it in
`public.contact_messages` (see `supabase/migrations/`).

## Request

`POST /functions/v1/contact-submit` with `Content-Type: application/json`:

```json
{ "name": "…", "email": "…", "subject": "…", "message": "…", "locale": "ar", "honeypot": "" }
```

## Processing order

1. **CORS:** the `Origin` header must equal `ALLOWED_ORIGIN` exactly, otherwise `403`.
2. **Body:** JSON only (`415`), at most 16 KB (`413`), must be an object (`400`).
3. **Honeypot:** a non-empty `honeypot` returns a fake `200` and stores nothing.
4. **Validation and sanitization:** HTML tags and control characters are removed;
   lengths and the email pattern match the SQL constraints. Failure returns `400`
   with per-field error codes.
5. **Rate limit:** at most 3 messages per IP hash in 10 minutes, otherwise `429`.
   The IP hash is `SHA-256(ip + IP_HASH_SALT)`; the raw IP is never stored.
6. **Insert** with the service role (RLS denies all public access).
7. `200 { "ok": true }`.

## Environment

| Variable                    | Source                 |
| --------------------------- | ---------------------- |
| `SUPABASE_URL`              | provided by Supabase   |
| `SUPABASE_SERVICE_ROLE_KEY` | provided by Supabase   |
| `IP_HASH_SALT`              | `supabase secrets set` |
| `ALLOWED_ORIGIN`            | `supabase secrets set` |

Secrets are never committed. `verify_jwt` is disabled in `supabase/config.toml`
because the public form sends no Supabase token.

## Deploy (from the project owner's machine)

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
npx supabase secrets set IP_HASH_SALT=$(openssl rand -hex 32) ALLOWED_ORIGIN=https://<username>.github.io
npx supabase functions deploy contact-submit
```

Then set `PUBLIC_CONTACT_FUNCTION_URL` (GitHub secret and local `.env`) to
`https://<project-ref>.supabase.co/functions/v1/contact-submit`.
