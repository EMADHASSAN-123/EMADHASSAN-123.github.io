# HANDOFF_TO_CLAUDE_CODE.md

> **بروتوكول تسليم المرحلة 4 (التنفيذ البرمجي) إلى Claude Code**
> تاريخ التسليم: 16 نوفمبر 2026
> يُقرأ مرة واحدة في بداية **أول** جلسة Claude Code. بعدها، `CLAUDE.md` كافٍ كمرجع يومي.

---

## 1. الغرض من هذا الملف

- تلخيص حالة المشروع الحالية لأول جلسة Claude Code دون حاجة لقراءة كل الوثائق.
- توفير Prompt التشغيل الأول جاهزاً.
- توضيح بروتوكول التواصل والتحديثات بين Claude Code وصاحب المشروع.

---

## 2. حالة المشروع الحالية (Snapshot)

### 2.1 ما تم إنجازه (معتمد ومغلق)

| المرحلة | الحالة | المخرج |
|---------|--------|---------|
| 1 — تحليل المتطلبات | ✅ معتمدة | `docs/PROJECT_CONTEXT.md` |
| 2 — Information Architecture | ✅ معتمدة | `docs/PHASE2_IA.md` |
| 3 — Tech Stack & Architecture | ✅ معتمدة | `docs/PHASE3_ARCH.md` |
| 4 — **التنفيذ البرمجي** | 🟡 **جارية** | *يُنشَأ في هذه الجلسة* |
| 5 — الاختبار والنشر | ⏳ لاحقاً | — |

### 2.2 الـ Stack التقني المعتمد

- **Front-End:** Astro 4.x + TypeScript + Tailwind CSS 3.x.
- **i18n:** Custom lightweight (JSON + Dot notation + DOM toggle).
- **المخططات التفاعلية:** Pure SVG + Vanilla TypeScript.
- **Backend:** Supabase (PostgreSQL + Edge Functions) ضمن الخطة المجانية.
- **Analytics:** Umami Self-Hosted على Vercel + Postgres على Supabase (schema `umami`).
- **CI/CD:** GitHub Actions → GitHub Pages.
- **Lint & Format:** ESLint + Prettier.
- **Package Manager:** npm. **Node:** 20 LTS.

التفاصيل الكاملة في `docs/PHASE3_ARCH.md`.

### 2.3 أصول قيد الاستلام (لا تمنع البدء، تمنع النشر النهائي)

- روابط التواصل الفعلية (Facebook / LinkedIn / WhatsApp / Email).
- ملف CV بصيغة PDF.
- GitHub Username النهائي للنطاق.
- حساب Vercel (لـ Umami).
- مفاتيح Supabase (`URL`, `ANON_KEY`, `SERVICE_ROLE_KEY`).

**القاعدة:** عند غياب أي من هذه، استخدم placeholder صريح (مثل `TODO: facebook-url`) ولا تخترع بديلاً.

---

## 3. Prompt التشغيل الأول (نصاً كاملاً)

> نسخ ولصق هذا النص في أول رسالة بعد ربط المستودع:

```
اقرأ بالترتيب:
1. CLAUDE.md
2. docs/PROJECT_CONTEXT.md
3. docs/PHASE3_ARCH.md
4. docs/HANDOFF_TO_CLAUDE_CODE.md

المرحلة الحالية: 4 — التنفيذ البرمجي. المراحل 1-3 معتمدة ومغلقة.

ابدأ بـ Walking Skeleton. التنفيذ يتم على خطوات مرقَّمة، توقف بعد كل خطوة لإخباري بالنتيجة قبل الانتقال للتالية:

الخطوة 1 — Scaffolding أساسي:
- أنشئ هيكل مشروع Astro 4 مع TypeScript strict و Tailwind CSS 3.
- أضف @astrojs/sitemap.
- أنشئ package.json بالتبعيات المحددة في PHASE3_ARCH.md § 11.
- أعدّ ESLint + Prettier + prettier-plugin-astro + prettier-plugin-tailwindcss.
- أنشئ هيكل المجلدات كاملاً كما هو موثق في PHASE3_ARCH.md § 8 (مجلدات فارغة + .gitkeep عند الحاجة).
- أنشئ .env.example (بدون أي مفاتيح حقيقية).
- أنشئ .gitignore شامل.
- تحقق أن npm install و npm run build يعملان بدون أخطاء.
- Commit أولي بعنوان: chore: initial astro scaffolding with tailwind and lint tooling

قواعد إلزامية لهذه الخطوة ولكل خطوة قادمة:
- لا تذكر أي أداة AI في الكود، التعليقات، commit messages، README.
- لا Co-Author tags.
- لا أسرار في المستودع.
- Commit messages: Conventional Commits بالإنجليزية.
- عند أي قرار غير محسوم في الوثائق: توقف واسألني.

عند الانتهاء من الخطوة 1، أبلغني بـ:
- ملخص ما تم.
- أي قرار اتخذته باستقلالية والمبرر.
- أي عقبة أو ملاحظة.
- اقتراحك للخطوة 2.
```

---

## 4. خارطة طريق المرحلة 4 (مبدئية — تُنقَّح أثناء التنفيذ)

| الخطوة | المحتوى | التقدير |
|---------|----------|----------|
| 1 | Scaffolding أساسي + CI/CD skeleton | قصيرة |
| 2 | Design Tokens (CSS Variables) + Tailwind config + Dark/Light/Auto | قصيرة |
| 3 | BaseLayout + Header + Footer + i18n core | متوسطة |
| 4 | Theme Toggle + Language Toggle (Vanilla TS) | قصيرة |
| 5 | محطة Hero | متوسطة |
| 6 | محطة Methodology (Pipeline أفقي) | متوسطة |
| 7 | محطة Expertise | متوسطة |
| 8 | محطة Projects Preview | متوسطة |
| 9 | محطة Certifications | قصيرة |
| 10 | محطة Interests + Contact UI | متوسطة |
| 11 | صفحة مشروع واحد (المشروع 1 كنموذج) + Interactive SVG Diagram | طويلة |
| 12 | باقي صفحات المشاريع الثلاث | متوسطة |
| 13 | صفحة 404 + Privacy Policy | قصيرة |
| 14 | Supabase Setup (migration + RLS + Edge Function) | متوسطة |
| 15 | ربط Contact Form بـ Edge Function | قصيرة |
| 16 | GitHub Actions workflow كامل | قصيرة |
| 17 | SEO (meta, sitemap, robots, OG) | متوسطة |
| 18 | Umami Setup + Integration | قصيرة |

**هذا ترتيب مقترح وليس ملزماً.** Claude Code يستطيع اقتراح إعادة ترتيب مع المبرر.

---

## 5. قواعد التواصل بين Claude Code وصاحب المشروع

### 5.1 بعد كل خطوة

يُقدِّم Claude Code:
1. **ملخص ما تم** (بالعربية، 3–5 أسطر).
2. **ملفات تم إنشاؤها/تعديلها** (قائمة).
3. **قرارات مستقلة** (مع المبرر).
4. **عقبات أو ملاحظات**.
5. **اقتراح الخطوة التالية**.
6. ينتظر الموافقة قبل الاستمرار.

### 5.2 عند طلب الاعتماد الصريح

يستخدم Claude Code قائمة من قسم 7.2 من `CLAUDE.md`. أي بند منها = توقف وطلب موافقة.

### 5.3 عند التعارض مع الوثائق

- Claude Code يُشير صراحة إلى أن ما يُطلب يتعارض مع قرار معتمد (مع المرجع).
- يقترح إما: (أ) تعديل الوثيقة رسمياً، أو (ب) الالتزام بالوثيقة.
- لا يُنفَّذ التعارض دون قرار صريح.

---

## 6. بروتوكول تحديث الوثائق

### 6.1 داخل المستودع

- Claude Code يُحدّث `docs/*.md` مباشرة ضمن commits عادية.
- أي تعديل جوهري على `docs/PROJECT_CONTEXT.md` يكون في PR مستقل بعنوان: `docs: update PROJECT_CONTEXT - <reason>`.

### 6.2 خارج المستودع (claude.ai Project Knowledge)

- صاحب المشروع يُحدّث نسخة Project Knowledge يدوياً عند القرارات الجوهرية.
- هذا الـ Project (claude.ai) يبقى **المرجع الاستراتيجي** للمراجعة المعمارية الدورية.

### 6.3 ملف Log للمرحلة 4

- يُنشئ Claude Code في أول جلسة ملفاً جديداً: `docs/PHASE4_IMPLEMENTATION_LOG.md`.
- يسجل فيه بعد كل خطوة: التاريخ، الخطوة، القرارات المستقلة، العقبات، الروابط للـ commits.

---

## 7. المهارات (Skills) الموصى بها

تفاصيل في `CLAUDE.md` § 9. مختصراً:

- **قبل كل مكوّن UI:** `frontend-design:frontend-design`.
- **قبل كل commit رئيسي:** `engineering:code-review`.
- **قبل كل نشر:** `engineering:deploy-checklist` + `seo-audit:technical-seo-code-audit`.
- **عند أي bug غامض:** `engineering:debug`.
- **قبل Methodology Pipeline أو أي chart:** `dataviz`.
- **عند الحاجة لقراءة PDFs:** `anthropic-skills:pdf-reading`.
- **عند الحاجة لاختبار بصري:** `anthropic-skills:chrome-browser`.

---

## 8. محاذير يومية أساسية

1. **ممنوع ذكر أي أداة AI** في الكود المنشور، التعليقات، README، HTML Meta، commit messages.
2. **ممنوع نشر `SERVICE_ROLE_KEY`** أو أي سر في المستودع.
3. **ممنوع كسر Dark Mode كأساسي** أو إزالة Light Mode.
4. **ممنوع كسر دعم RTL** — Tailwind Logical Properties (`ms-*`, `me-*`, `ps-*`, `pe-*`).
5. **ممنوع استبدال SVG اليدوي** للمخططات بـ Mermaid عام أو مكتبة.
6. **ممنوع إضافة React/Vue/Svelte** كـ Framework رئيسي.
7. **ممنوع إنشاء مشاريع أو شهادات** غير موثقة في `PROJECT_CONTEXT.md`.
8. **ممنوع تحويل placeholder إلى محتوى افتراضي** — يبقى ظاهراً كـ TODO حتى يُقدَّم الأصل.

---

## 9. إشارة انتهاء المرحلة 4

المرحلة 4 تُعتبر مكتملة عند:
- كل الخطوات 1–18 في § 4 منفَّذة ومُعتمدة.
- `npm run build` ينتج `dist/` بدون أخطاء ولا تحذيرات رئيسية.
- الموقع يعمل محلياً على `npm run dev` بكامل وظائفه.
- Edge Function `contact-submit` منشورة وتستقبل.
- GitHub Actions ينجح على push إلى main.
- `docs/PHASE4_IMPLEMENTATION_LOG.md` مُحدَّث بكامل الخطوات.

بعد ذلك: ينتقل العمل إلى **المرحلة 5** (الاختبار الشامل، تحسين الأداء، SEO Audit، النشر النهائي).

---

## 10. نقطة التسليم الأخيرة

هذا الملف هو **عقد التسليم**. من هذه النقطة فصاعداً:
- Claude Code يملك صلاحية التنفيذ البرمجي داخل حدود الوثائق المعتمدة.
- صاحب المشروع يحتفظ بصلاحية الاعتماد النهائي وتعديل القرارات الاستراتيجية.
- هذا الـ Project (claude.ai) يبقى مرجعاً للمراجعة المعمارية عند الحاجة.

**بالتوفيق.**
