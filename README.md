# personal-website

Bilingual (Arabic / English) personal engineering portfolio, built as a static site.

## Stack

- [Astro 4](https://docs.astro.build/) with TypeScript (strict)
- Tailwind CSS 3
- Supabase (PostgreSQL + Edge Functions) for the contact form
- GitHub Pages hosting via GitHub Actions

## Requirements

- Node.js 20 LTS (see `.nvmrc`)
- npm

## Getting started

```bash
npm install
cp .env.example .env   # fill in local values; never commit .env
npm run dev
```

## Scripts

| Command                | Purpose                                         |
| ---------------------- | ----------------------------------------------- |
| `npm run dev`          | Start the local dev server                      |
| `npm run build`        | Type-check (`astro check`) and build to `dist/` |
| `npm run preview`      | Preview the production build locally            |
| `npm run check`        | Run Astro/TypeScript diagnostics only           |
| `npm run lint`         | Lint with ESLint                                |
| `npm run lint:fix`     | Lint and apply automatic fixes                  |
| `npm run format`       | Format with Prettier                            |
| `npm run format:check` | Verify formatting                               |

## Environment variables

All variables in `.env.example` are prefixed with `PUBLIC_` and are embedded in the
client bundle. Secrets (such as the Supabase service role key) are never stored in this
repository; they live only in the Supabase Edge Function environment.

## Project structure

See `docs/PHASE3_ARCH.md` § 8 for the full directory layout.
