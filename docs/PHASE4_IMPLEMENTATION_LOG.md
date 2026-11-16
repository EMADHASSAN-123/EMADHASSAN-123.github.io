# PHASE4_IMPLEMENTATION_LOG.md

> سجل تنفيذ المرحلة 4 — يُحدَّث بعد كل خطوة (HANDOFF § 6.3).

---

## الخطوة 1 — Scaffolding أساسي

- **التاريخ:** 16 نوفمبر 2026
- **Commit:** `e767c04` — `chore: initial astro scaffolding with tailwind and lint tooling`
- **الحالة:** منفذة — بانتظار الاعتماد.

### ما تم

- Astro `4.16.19` (`output: 'static'`) + TypeScript strict (`astro/tsconfigs/strict`) + Tailwind CSS `3.4.19` عبر `@astrojs/tailwind` 5.
- `@astrojs/sitemap` مثبَّت على `~3.2.1`.
- ESLint 10 (flat config) + `typescript-eslint` + `eslint-plugin-astro`.
- Prettier 3 + `prettier-plugin-astro` + `prettier-plugin-tailwindcss`.
- هيكل المجلدات وفق `PHASE3_ARCH.md` § 8 (مجلدات فارغة + `.gitkeep`).
- `.env.example` (متغيرات `PUBLIC_*` كـ placeholders فقط) + `.gitignore` شامل.
- `npm install` و `npm run lint` و `npm run format:check` و `npm run build` تعمل بنجاح (0 errors / 0 warnings / 0 hints).

### قرارات مستقلة

| القرار | المبرر |
|--------|--------|
| تثبيت `@astrojs/sitemap` على `~3.2.1` | الإصدارات 3.3+ تعتمد Hooks خاصة بـ Astro 5 وتنهار مع Astro 4 عند ضبط `site`. |
| `site` يُقرأ من `PUBLIC_SITE_URL` | لا يُكتب النطاق في الكود قبل حسم `username`. بدونه يتخطى sitemap التوليد بتحذير. |
| `build` = `astro check && astro build` | فحص الأنواع إلزامي قبل كل بناء. يتطلب `@astrojs/check` (devDependency). |
| تبعيات ESLint إضافية: `@eslint/js`, `typescript-eslint`, `eslint-plugin-astro`, `globals` | لازمة لتطبيق قرار "ESLint + Prettier" المعتمد؛ غير مذكورة صراحة في § 11. |
| `applyBaseStyles: false` + `src/styles/global.css` | تحكم صريح في ترتيب CSS تمهيداً لـ `tokens.css` في الخطوة 2. |
| Alias `@/*` → `src/*` | استيرادات أوضح. |
| `.nvmrc` = 20 و `engines.node >= 20.19.0` | Node 20 LTS المعتمد؛ ESLint 10 يتطلب 20.19+. |
| إضافة `public/certifications/` | معتمد في `PROJECT_CONTEXT.md` § 4.4.3 رغم غيابه عن شجرة § 8. |
| `src/pages/index.astro` مؤقت (`noindex`) | البناء يحتاج صفحة واحدة على الأقل؛ بلا أي محتوى شخصي. |
| هوية Git المحلية: GitHub noreply | بقرار صاحب المشروع — تمنع كشف البريد الشخصي في التاريخ العلني. |

### مؤجَّل عمداً

- `LICENSE` — قرار حقوق ملكية يتطلب اعتماد صاحب المشروع.
- `favicon.svg`، `robots.txt` — الخطوة 17 (SEO) وبعد حسم النطاق.
- `.github/workflows/deploy.yml` — الخطوة 16 (النشر يتطلب اعتماداً).
- `supabase/config.toml` — يُنشأ عبر Supabase CLI في الخطوة 14.

### عقبات وملاحظات

- `npm audit`: ثغرات معروفة في Astro 4 وتبعياته (vite/esbuild/sharp/zod). الإصلاح يتطلب ترقية Major (Astro 5+). معظمها يخص SSR/Dev Server؛ أثرها محدود على موقع ثابت بمحتوى يملكه صاحب المشروع. **بانتظار قرار.**
- رسالة esbuild `The build was canceled` تظهر أحياناً أثناء البناء — غير مؤثرة (exit code 0).

### قرارات لاحقة (بتوجيه صاحب المشروع: "التزم بما هو موثق")

- Astro يبقى على 4.x كما في المرحلة 3.
- `LICENSE` مؤجَّل حتى يُحدَّد نوع الرخصة (غير موثق).
- النطاق يبقى عبر `PUBLIC_SITE_URL` حتى حسم `username`.

---

## الخطوة 2 — Design Tokens + Tailwind + Dark/Light/Auto

- **التاريخ:** 16 نوفمبر 2026
- **Commit:** `7f9916d` — `feat: add design tokens and dark/light/auto theme foundation`
- **الحالة:** منفذة — بانتظار الاعتماد.

### ما تم

- `src/styles/tokens.css`: ألوان الوضعين (قنوات RGB لدعم الشفافية في Tailwind)، مكدسات الخطوط، ارتفاعات الأسطر، أبعاد التخطيط، ومدد الحركة.
- `src/styles/global.css`: أنماط أساسية من الـ Tokens، `:focus-visible`، Transition للتبديل (200ms عبر class مؤقت)، واحترام `prefers-reduced-motion`.
- `tailwind.config.mjs`: ربط كل الألوان بالـ Tokens، المقياس 1.25، `container` بعرض 1280px، `max-w-prose` = 70ch، و `darkMode` على `[data-theme="dark"]`.
- `src/lib/theme.ts`: الأنواع والثوابت ودالة `resolveTheme` وسكربت Bootstrap يطبَّق قبل أول رسم (لا وميض).
- تحقق في Chromium: الحالات السبع (Auto داكن/فاتح، تفضيل محفوظ يتغلب على النظام، وبدون JavaScript) تعطي الألوان الصحيحة.

### نسب التباين المقاسة (WCAG AA ≥ 4.5:1 للنص العادي)

| Token | Dark (bg-primary / bg-secondary / surface) | Light (bg-primary / bg-secondary / surface) |
|-------|-------|-------|
| text-primary | 16.55 / 16.90 / 14.61 | 17.23 / 16.30 / 17.85 |
| text-secondary | 7.07 / 7.22 / 6.24 | 7.31 / 6.92 / 7.58 |
| text-muted | 5.80 / 5.92 / 5.12 | 5.25 / 4.97 / 5.44 |
| accent-primary | 8.46 / 8.64 / 7.47 | 5.73 / 5.42 / 5.93 |
| accent-secondary | 12.51 / 12.77 / 11.04 | 5.17 / 4.89 / 5.36 |
| error | 6.55 / 6.69 / 5.79 | 6.24 / 5.91 / 6.47 |
| border-strong (≥ 3:1، UI) | 4.13 / 4.22 / 3.65 | 3.30 / 3.12 / 3.42 |

### قرارات مستقلة (ضمن حدود `PHASE2_IA` § 8 "معتمد كتوجه")

| القرار | المبرر |
|--------|--------|
| Dark `text-muted`: `#64748B` → `#8493A8` | الموثق يعطي 3.81:1 على bg-primary — يفشل AA الإلزامي. |
| Dark `error`: `#EF4444` → `#F87171` | الموثق يعطي 4.25:1 على surface (حقول النموذج). |
| Light `accent-primary`: `#0284C7` → `#0369A1` | الموثق يعطي 3.95:1 — نية الوثيقة صريحة "لضمان التباين". |
| Light `text-muted`: `#64748B` → `#5B6B80` | الموثق يعطي 4.34:1 على bg-secondary. |
| Light Mode: تحديد القيم غير الموثقة (surface، border، accent-secondary، status) | الوثيقة حددت 4 قيم فقط؛ اشتُقت البقية من نفس عائلة Slate/Sky مع تحقق AA. |
| Dark `accent-primary` = `#38BDF8` (من الخيارين الموثقين) | يميّزه بوضوح عن Cyan الثانوي `#67E8F9`؛ `#22D3EE` قريب جداً منه. |
| إضافة `border-strong` و `on-accent` | `border-strong` لحدود حقول النموذج (WCAG 1.4.11 ≥ 3:1)؛ `on-accent` للنص فوق الأزرار الملونة. |
| المقياس بدون `xs` (أصغر حجم 0.8rem = 12.8px) | الخطوة التالية في المقياس (10.24px) غير مقروءة، خاصة للعربية. |
| مكدسات خطوط النظام مؤقتاً | ملفات الخطوط المحلية تُضاف مع BaseLayout (preload). |

### ملاحظات

- **Auto مقابل "Dark افتراضي":** المتصفحات الحديثة تُبلغ `light` عندما لا يحدد المستخدم تفضيلاً. لذلك سيرى معظم زوار الأنظمة بالإعداد الافتراضي الوضع الفاتح، و Dark يبقى fallback فقط. هذا مطابق لترتيب الأولوية الموثق (`PHASE2_IA` § 7.3).
- **CSP:** سكربت Bootstrap مضمَّن (inline)، فيجب إضافة hash له في `script-src` عند تفعيل CSP لاحقاً.
