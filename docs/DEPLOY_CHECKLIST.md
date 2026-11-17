# DEPLOY_CHECKLIST.md — قائمة فحص الإطلاق الأول

> الموقع: `https://emadhassan-123.github.io` — النشر: GitHub Actions (`.github/workflows/deploy.yml`) عند الدمج في `main`.
> **الدمج في `main` = إطلاق عام.** يتطلب اعتماد صاحب المشروع (`CLAUDE.md` § 7).

## قبل الدمج (صاحب المشروع)

- [ ] **GitHub ← Settings ← Pages ← Source = GitHub Actions** (وليس "Deploy from a branch"؛ وإلا يعود Jekyll ويفشل).
- [ ] **GitHub ← Settings ← Environments ← `github-pages`:** قاعدة الفروع تسمح بـ `main` (الإعداد الافتراضي).
- [ ] **Supabase Secrets:** `ALLOWED_ORIGIN` = `https://emadhassan-123.github.io`، و `IP_HASH_SALT` مضاف.
- [ ] **(اختياري الآن) GitHub ← Settings ← Secrets and variables ← Actions:** `PUBLIC_CONTACT_FUNCTION_URL`. بدونه يُنشر الموقع ويقول النموذج إنه غير متصل بعد (الخطوة 15).
- [ ] فتح Pull Request من فرع العمل إلى `main`، والتأكد أن فحص **build** على الـ PR أخضر (lint + format + type check + build).

## الإطلاق

- [ ] دمج الـ PR في `main`.
- [ ] **Actions ← Deploy to GitHub Pages:** نجاح `build` ثم `deploy` (عادة 1–3 دقائق).

## التحقق بعد الإطلاق (خلال 15 دقيقة)

- [ ] الصفحة الرئيسية تفتح على `https://emadhassan-123.github.io/` بالعربية، مع الصورة والخطوط.
- [ ] تبديل اللغة والوضع يعمل؛ القائمة على الجوال تعمل.
- [ ] صفحات المشاريع الأربع، وسياسة الخصوصية، وروابط الشهادات (PDF) تفتح.
- [ ] رابط غير موجود (مثل `/xyz/`) يعرض صفحة 404 الخاصة.
- [ ] `https://emadhassan-123.github.io/robots.txt` و `/sitemap-index.xml` يفتحان.
- [ ] مشاركة الرابط في WhatsApp أو LinkedIn تعرض صورة المشاركة والعنوان.
- [ ] Console المتصفح (F12) بلا أخطاء CSP.
- [ ] (إن ضُبط `PUBLIC_CONTACT_FUNCTION_URL`) رسالة تجريبية من النموذج تصل إلى جدول `contact_messages` في Supabase.

## بعد التحقق

- [ ] Google Search Console: إضافة الموقع وإرسال `sitemap-index.xml` (`docs/PHASE4_SEO.md` § 5).
- [ ] تشغيل Lighthouse من Chrome (F12 ← Lighthouse) وتسجيل النتائج.
- [ ] تحديث `docs/PHASE4_IMPLEMENTATION_LOG.md` بنتيجة الإطلاق.

## التراجع (Rollback)

**متى:** الصفحة الرئيسية لا تعمل، أو محتوى خاطئ/حساس ظهر للعامة، أو أخطاء CSP تعطل اللغة أو الوضع.

1. **إيقاف فوري:** GitHub ← Settings ← Pages ← **Unpublish site**.
2. **إصلاح وإعادة نشر:** إصلاح على فرع العمل ← PR جديد ← دمج (ينشر تلقائياً)؛ أو Actions ← تشغيل سابق ناجح ← **Re-run jobs** لإعادة نشر نسخة سابقة.
3. **ملاحظة:** "Revert" للدمج يحذف ملف الـ Workflow أيضاً، فلا يعيد النشر؛ استخدم الخطوة 1 للإيقاف.
