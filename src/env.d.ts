/// <reference path="../.astro/types.d.ts" />
interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_SUPABASE_URL?: string;
  readonly PUBLIC_SUPABASE_ANON_KEY?: string;
  readonly PUBLIC_CONTACT_FUNCTION_URL?: string;
  readonly PUBLIC_UMAMI_URL?: string;
  readonly PUBLIC_UMAMI_SITE_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
