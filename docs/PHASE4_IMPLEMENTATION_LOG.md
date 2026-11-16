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
