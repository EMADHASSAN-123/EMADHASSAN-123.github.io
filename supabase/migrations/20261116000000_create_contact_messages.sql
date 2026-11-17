-- Contact form messages (PHASE3_ARCH section 4.1).
-- Rows are written only by the contact-submit Edge Function using the
-- service role. Public roles have no access at all (RLS deny-all).

create table public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 2 and 100),
  email       text not null check (char_length(email) <= 254 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  subject     text not null check (char_length(subject) between 3 and 150),
  message     text not null check (char_length(message) between 10 and 5000),
  locale      text not null default 'ar' check (locale in ('ar', 'en')),
  ip_hash     text check (ip_hash is null or ip_hash ~ '^[0-9a-f]{64}$'),
  user_agent  text check (user_agent is null or char_length(user_agent) <= 512),
  is_read     boolean not null default false,
  is_spam     boolean not null default false,
  created_at  timestamptz not null default now()
);

comment on table public.contact_messages is
  'Contact form submissions. Insert only via the contact-submit Edge Function.';
comment on column public.contact_messages.ip_hash is
  'SHA-256 of the client IP plus a secret salt; used only for rate limiting.';

create index idx_contact_messages_created_at
  on public.contact_messages (created_at desc);

create index idx_contact_messages_ip_hash_time
  on public.contact_messages (ip_hash, created_at);

-- Row Level Security: deny everything to anon and authenticated.
alter table public.contact_messages enable row level security;

create policy "Deny all public access"
  on public.contact_messages
  for all
  to anon, authenticated
  using (false)
  with check (false);

-- Defence in depth: remove table privileges from the public API roles too.
revoke all on table public.contact_messages from anon, authenticated;

-- The project owner reads messages in the Supabase Dashboard (owner role
-- bypasses RLS). The service role used by the Edge Function bypasses RLS.
