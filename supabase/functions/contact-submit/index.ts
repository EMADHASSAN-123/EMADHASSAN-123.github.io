/**
 * contact-submit Edge Function entry point (Deno, Supabase).
 * Secrets come from the function environment only:
 * SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (automatic), IP_HASH_SALT and
 * ALLOWED_ORIGIN (set with `supabase secrets set`).
 */
import { createClient } from '@supabase/supabase-js';
import { handle, type Store } from './handler.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const store: Store = {
  async countSince(ipHash, sinceIso) {
    const { count, error } = await supabase
      .from('contact_messages')
      .select('id', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', sinceIso);
    if (error) throw new Error(error.message);
    return count ?? 0;
  },
  async insert(row) {
    const { error } = await supabase.from('contact_messages').insert(row);
    if (error) throw new Error(error.message);
  },
};

Deno.serve((request) =>
  handle(request, {
    allowedOrigin: Deno.env.get('ALLOWED_ORIGIN') ?? '',
    ipHashSalt: Deno.env.get('IP_HASH_SALT') ?? '',
    store,
  }),
);
