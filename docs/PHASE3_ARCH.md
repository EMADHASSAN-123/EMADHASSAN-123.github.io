# PHASE3_ARCH.md — المعمارية التقنية واختيار التقنيات

> **المرحلة الثالثة — Tech Stack & Architecture**
> تاريخ الإصدار: 16 نوفمبر 2026
> يبني على: `PROJECT_CONTEXT.md` + `claude/PHASE2_IA.md` + `CLAUDE.md`.
> كل قرار جوهري يحمل `[مقترح للاعتماد]` إلى حين إقرارك، ثم يُحوَّل إلى `[معتمد]` ويُدمج في `PROJECT_CONTEXT.md`.

---

## 0. ملخص Stack التقني المقترح (نظرة سريعة)

| الطبقة | القرار | البديل المرفوض | المبرر المختصر |
|--------|--------|-----------------|-----------------|
| **Front-End Framework** | **Astro** 4.x | Next.js / Nuxt / SvelteKit / Vite raw | Islands Architecture + i18n مدمج + Zero JS by default + ممتاز لـ Hybrid |
| **لغة التطوير** | **TypeScript** | JavaScript عادي | سلامة النوع + دعم Astro ممتاز + تجربة تطوير أفضل |
| **CSS Framework** | **Tailwind CSS** 3.x | CSS vanilla / UnoCSS | معروف لصاحب المشروع + دعم RTL ممتاز + Design Tokens عبر CSS Variables |
| **i18n** | **Custom i18n** (JSON + Astro Content + Client Toggle) | astro-i18next / i18next | يسمح بـ URL language-agnostic بدون Reload (قرار المرحلة 2) |
| **SVG التفاعلي** | **Pure SVG + Vanilla TypeScript** | D3.js / React-svg / Svelte component | Bundle أدنى + تحكم كامل + لا framework overhead |
| **قاعدة البيانات** | **Supabase (PostgreSQL)** مع RLS | — | قرار مسبق معتمد |
| **Backend-less Functions** | **Supabase Edge Functions** (Deno) | — | قرار مسبق معتمد |
| **Analytics** | **Umami Self-Hosted على Vercel + Postgres على Supabase** | Plausible / Cloudflare Analytics / GoatCounter | أفضل توازن: مجاني كلياً + مفتوح المصدر + Privacy-first + قاعدة بياناته ضمن Supabase نفسه |
| **CI/CD** | **GitHub Actions** → GitHub Pages | Netlify / Vercel | قرار مسبق معتمد (GitHub Pages) |
| **Package Manager** | **npm** | pnpm / yarn | قياسي + متوافق تماماً مع GitHub Actions بلا إعدادات |
| **Node Version** | **Node 20 LTS** | — | ثابت وموثوق |

---

## 1. الـ Framework الأمامي — Astro `[مقترح للاعتماد]`

### 1.1 القرار

**Astro 4.x** كـ Meta-Framework أساسي للمشروع.

### 1.2 المبررات مقابل متطلبات المرحلة 2

| متطلب من المرحلة 2 | كيف يحققه Astro |
|---------------------|-------------------|
| Static Hosting (GitHub Pages) | Astro يبني HTML/CSS/JS ثابت افتراضياً (`output: 'static'`) |
| بنية Hybrid (One-Page + صفحات تفصيلية) | File-based routing: `src/pages/index.astro` + `src/pages/projects/*.astro` |
| i18n كامل (ع/إ) + RTL/LTR | مدمج + دعم ممتاز للترجمة عبر Content Collections أو JSON |
| مخططات SVG تفاعلية | Islands Architecture: SVG يُستدعى كـ Component مع JS محلي فقط |
| أداء عالٍ (Core Web Vitals) | Zero-JS by default — لا يُشحن JS إلا للمكونات التفاعلية فقط |
| Dark/Light Mode | يتوافق مع أي حل CSS Variables + Vanilla JS |
| Blog لاحقاً | Content Collections جاهزة، مع دعم Markdown/MDX |
| SEO (Meta, Sitemap, OG) | `@astrojs/sitemap` + Meta في Layout بسيط |

### 1.3 البدائل التي رُفضت ولماذا

| البديل | سبب الرفض |
|--------|-----------|
| **Next.js (static export)** | ثقيل لمشروع بهذا الحجم. Export الثابت فيه قيود. Bundle أكبر مما نحتاج. |
| **Nuxt 3 (static)** | ممتاز لكن مجتمع Vue أصغر، وصاحب المشروع يعمل بـ JavaScript عادي؛ React/Vanilla أقرب. |
| **SvelteKit (adapter-static)** | ممتاز تقنياً لكن مجتمع أصغر، ومنحنى تعلم مختلف. |
| **Vite + Vanilla TS فقط** | يتطلب بناء يدوي للـ Routing + i18n + SSG → ديون تقنية. |
| **HTML/CSS/JS نقي** | لا يتوسع مع 4+ صفحات مشاريع + مدونة مستقبلية + تكرار Layout. |

### 1.4 قرار موازي: مكتبات UI إضافية

**لا مكتبة UI عامة (Headless UI, Radix…).** `[مقترح للاعتماد]`

المبرر: المشروع لا يحتاج Modals ولا Dropdowns ولا Combobox معقدة. كل العناصر التفاعلية مكتوبة من الصفر بـ Vanilla TS — يحافظ على الحجم الأدنى.

---

## 2. استراتيجية i18n `[مقترح للاعتماد]`

### 2.1 القرار

**Custom i18n Lightweight** مبنية على:
- ملفات JSON لكل لغة في `src/locales/ar.json` و `src/locales/en.json`.
- دالة Helper `t(key)` تقرأ المفتاح من JSON المحمَّل مسبقاً.
- في Astro: الـ Templates تعرض **نصوص اللغتين معاً** مع `data-i18n` attributes.
- في الـ Client: زر التبديل يعدّل `document.documentElement.lang` و `dir`، ويُخزّن الاختيار في LocalStorage.
- CSS يُخفي النص غير النشط عبر Selectors مبنية على `html[lang="ar"] [data-lang="en"] { display: none }` ومثيلها.

### 2.2 لماذا هذا النهج (ليس astro-i18next)

- المكتبات الجاهزة تعتمد URL-based routing (`/ar/`, `/en/`) — قرار المرحلة 2 رفض ذلك.
- قرار المرحلة 2: **تبديل فوري بدون إعادة تحميل** — يستلزم DOM-based i18n.
- البساطة: ملفان JSON + 100 سطر TypeScript كافيان للمشروع كله.
- SEO: الـ Prerendering يُنتج HTML يحوي اللغتين، محركات البحث تقرأهما.

### 2.3 تعديل معتمد: رابط لكل لغة (17 نوفمبر 2026) `[معتمد]`

- **القرار الأصلي:** رابط واحد لكل صفحة باللغتين (URL language-agnostic)، والتبديل عبر DOM.
- **سبب التغيير:** مع رابط واحد يفهرس Google الصفحة كعربية فقط، ويرى النص الإنجليزي مخفياً بـ `display:none`، فيضعف الظهور في البحث الإنجليزي. اعتمد صاحب المشروع التغيير صراحة بعد فحص SEO (`PHASE4_SEO` § 4).
- **القرار الجديد:**
  - كل صفحة تُبنى مرتين: `/path/` بالعربية (الافتراضية) و`/en/path/` بالإنجليزية (`src/pages/[...lang]/`).
  - لغة الصفحة في HTML تحددها البادئة.
  - لكل صفحة `canonical` ذاتي، و`hreflang` للغتين، و`x-default` يشير للعربية.
  - خريطة الموقع تضم 12 رابطاً مع روابط بديلة.
- **ما لم يتغير:**
  - الصفحتان تحملان نصوص اللغتين.
  - زر التبديل فوري بلا إعادة تحميل، ويحدّث الآن عنوان الصفحة في المتصفح (`history.replaceState`) والروابط الداخلية إلى لغة الاختيار.
  - الاختيار يُحفظ في LocalStorage.
- **أولوية اللغة عند التحميل:**
  - الاختيار المحفوظ صراحة، إن وُجد، يُطبَّق ويُعدَّل العنوان إلى رابط لغته.
  - وإلا فلغة الرابط.
  - **أُزيل الاكتشاف التلقائي من لغة المتصفح:** زاحف Google يعمل بلغة إنجليزية، وكان سيحوّل الصفحة العربية إلى الإنجليزية ويغيّر عنوانها، فيُفهرس المحتوى الخطأ تحت الرابط الخطأ.
- **الأثر:**
  - تُفهرس كل لغة مستقلة بعنوانها ووصفها.
  - لا أثر على الأداء: الحجم نفسه لكل صفحة.

### 2.3 تدفق التبديل التفصيلي

```
1. التحميل الأول:
   - قراءة LocalStorage['lang']
   - إن غير موجود: قراءة navigator.language
   - الافتراضي: 'ar'
   - ضبط document.documentElement.lang + dir

2. عند التبديل:
   - LocalStorage['lang'] = الجديد
   - document.documentElement.lang = الجديد
   - document.documentElement.dir = ('ar' => 'rtl', 'en' => 'ltr')
   - CSS يتكفَّل بإخفاء/إظهار النصوص
   - لا Reload
```

### 2.4 استراتيجية RTL/LTR

- **Tailwind CSS** يدعم `dir` attribute ضمنياً.
- استخدام **Logical Properties** في Tailwind: `ms-4` (margin-start) بدل `ml-4`.
- الـ Flexbox يحترم `dir` تلقائياً بين `row` و `row-reverse`.
- المخططات التفاعلية: الـ SVG لا ينعكس تلقائياً — سيُصمَّم كل مخطط بشكل متناظر أو محايد الاتجاه.

---

## 3. المخططات المعمارية التفاعلية — التنفيذ `[مقترح للاعتماد]`

### 3.1 القرار

**Pure SVG + Vanilla TypeScript Component**، بدون مكتبة خارجية.

### 3.2 البنية التفصيلية

```
src/
├── assets/
│   └── diagrams/
│       ├── fuel-quality.svg          — SVG مرسوم يدوياً
│       ├── content-management.svg
│       ├── alshifa-website.svg
│       └── alshifa-mis.svg
├── components/
│   └── projects/
│       └── InteractiveDiagram.astro  — Wrapper + Panel جانبي
└── scripts/
    └── interactive-diagram.ts         — منطق التفاعل (مرة واحدة لكل المخططات)
```

### 3.3 كيف يعمل

**SVG File (مثال مبسَّط):**
```svg
<svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
  <g id="node-sensor" class="diagram-node"
     data-title-ar="مستشعر AS7265X"
     data-title-en="AS7265X Sensor"
     data-description-ar="يوفر 18 قناة طيفية..."
     data-description-en="Provides 18 spectral channels...">
    <!-- رسم العقدة -->
  </g>
  <!-- باقي العقد والخطوط -->
</svg>
```

**TypeScript Component:**
- IntersectionObserver يراقب دخول المخطط لـ Viewport.
- يُفعّل Progressive Reveal عبر إضافة `class="revealed"` إلى كل عقدة بتأخير متدرج (100ms × index).
- Click/Tap handler على `.diagram-node` يفتح Panel جانبي يعرض البيانات من `data-*` attributes.
- يحترم `window.matchMedia('(prefers-reduced-motion: reduce)')`: عندها يُظهر الكل دفعة واحدة.

### 3.4 التجاوب (Responsiveness)

- SVG يستخدم `viewBox` لا `width/height` ثابتة → يتجاوب تلقائياً.
- على شاشات أقل من 640px: يُستبدل Panel الجانبي بـ Modal من الأسفل.
- إن كان المخطط معقداً جداً: يُقدَّم زر "تكبير" يفتحه Full-Screen.

### 3.5 لماذا لا D3.js أو مكتبة أخرى

- D3 ضخم (~250KB) لتفاعل بسيط جداً.
- لا نرسم رسوم بيانية متحركة بالبيانات — نعرض مخططاً هندسياً ثابت الهيكل مع تفاعل محدود.
- Vanilla TS للمنطق + SVG نقي للرسم = تحكم كامل + وزن ≤ 5KB.

---

## 4. مخطط قاعدة البيانات Supabase `[مقترح للاعتماد]`

### 4.1 الجداول المطلوبة

#### جدول `contact_messages`

```sql
create table public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 2 and 100),
  email       text not null check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  subject     text not null check (char_length(subject) between 3 and 150),
  message     text not null check (char_length(message) between 10 and 5000),
  locale      text not null default 'ar' check (locale in ('ar', 'en')),
  ip_hash     text,
  user_agent  text,
  is_read     boolean not null default false,
  is_spam     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index idx_contact_messages_created_at
  on public.contact_messages (created_at desc);

create index idx_contact_messages_ip_hash_time
  on public.contact_messages (ip_hash, created_at);
```

**ملاحظات التصميم:**
- `ip_hash` هو SHA-256 لعنوان IP + Salt سري (ليس IP خاماً) — يحمي الخصوصية مع إتاحة Rate Limiting.
- `locale` يسجل لغة الإرسال لمساعدة الرد.
- `is_spam` للتصنيف اليدوي لاحقاً.

#### RLS Policies

```sql
alter table public.contact_messages enable row level security;

-- منع كل الوصول المباشر من anon أو authenticated
-- (الإدخال فقط عبر Edge Function بـ service_role)

create policy "Deny all public access"
  on public.contact_messages
  for all
  to anon, authenticated
  using (false)
  with check (false);

-- ملاحظة: صاحب المشروع يقرأ الرسائل عبر Supabase Dashboard
-- باستخدام حسابه كمالك للمشروع (يتجاوز RLS)
```

### 4.2 المدونة (Deferred Schema)

لا تُنشأ الآن. ستُضاف عند إطلاق المدونة في مرحلة لاحقة:
- خيار A: مقالات Markdown في المستودع (لا جدول).
- خيار B: جدول `blog_posts` في Supabase.

**القرار المبدئي:** خيار A (Markdown في المستودع) — أبسط، أسرع، أقل اعتمادية. يُؤجَّل الحسم الفعلي لمرحلة إطلاق المدونة.

### 4.3 جدول Umami

Umami ينشئ جداوله الخاصة تلقائياً عند أول تشغيل. تُخزَّن في نفس Supabase Project تحت schema منفصل `umami` لعزل البيانات.

---

## 5. Edge Functions — تصميم `contact-submit` `[مقترح للاعتماد]`

### 5.1 الهيكل

```
supabase/functions/contact-submit/
├── index.ts
├── deno.json
└── README.md
```

### 5.2 منطق Edge Function

**المسار:** `POST /functions/v1/contact-submit`

**Payload المتوقع:**
```json
{
  "name": "...",
  "email": "...",
  "subject": "...",
  "message": "...",
  "locale": "ar" | "en",
  "honeypot": "" 
}
```

**منطق المعالجة (مرتب):**

1. **CORS Check:**
   - `Origin` header يجب أن يطابق `https://<username>.github.io` بالضبط.
   - إن لم يطابق: رفض 403.

2. **Honeypot Check:**
   - إن كان `honeypot` غير فارغ: استجابة 200 كاذبة (لعدم إعلام البوت)، ولا إدخال.

3. **Validation:**
   - الأسماء، البريد، الموضوع، الرسالة: تحقق من الطول والأنماط.
   - إن فشل: 400 + رسالة مترجمة بحسب `locale`.

4. **Rate Limiting:**
   - حساب `ip_hash = SHA-256(ip + SALT)`.
   - استعلام: كم رسالة من نفس `ip_hash` خلال آخر 10 دقائق؟
   - إن ≥ 3: رفض 429.

5. **Sanitization:**
   - إزالة HTML tags (مثل DOMPurify على Deno أو regex بسيط).
   - Trim الحقول.

6. **Insert:**
   - استخدام `SUPABASE_SERVICE_ROLE_KEY` (موجود في env الـ Function، ليس في العميل).
   - إدخال الصف.

7. **Response:**
   - 200 مع `{ ok: true }` + رسالة نجاح.

### 5.3 متغيرات البيئة في Supabase

| اسم المتغير | المصدر | ملاحظة |
|--------------|---------|---------|
| `SUPABASE_URL` | تلقائي | لا يُضاف يدوياً |
| `SUPABASE_SERVICE_ROLE_KEY` | تلقائي | لا يُكشف أبداً للعميل |
| `IP_HASH_SALT` | يدوي | قيمة عشوائية 32-byte |
| `ALLOWED_ORIGIN` | يدوي | `https://<username>.github.io` |

---

## 6. أداة التحليلات (Analytics) `[مقترح للاعتماد]`

### 6.1 القرار

**Umami Self-Hosted** مع خيارين للاستضافة. التوصية:

**الخيار A (الموصى به):** Umami على **Vercel Hobby Plan** (مجاني) + قاعدة Postgres على **Supabase** (نفس المشروع، schema منفصل `umami`).

**الخيار B (بديل):** Umami على **Fly.io** (3 VMs مجانية) مع Postgres مضمَّنة.

### 6.2 لماذا Umami وليس غيره

| الأداة | التقييم | الحكم |
|---------|---------|--------|
| **Umami** | مفتوح المصدر، Privacy-first، لا Cookies، لا Banner مطلوب، Dashboard نظيف | ✅ الأفضل |
| **Plausible** | ممتاز، لكن self-host أثقل (Elixir runtime)، أصعب على Vercel | ❌ تعقيد أعلى |
| **Cloudflare Web Analytics** | مجاني، سهل، لكن مرتبط بـ Cloudflare | ⚠️ احتكار بيانات |
| **GoatCounter** | بسيط جداً، مجاني مُستضاف | ⚠️ إمكانيات أقل من Umami |
| **Simple Analytics / Fathom** | ممتازان، لكن مدفوعان | ❌ ضد "No Paid" |

### 6.3 التكامل مع الموقع

```html
<!-- في BaseLayout -->
<script
  defer
  src="https://umami.<username>.vercel.app/script.js"
  data-website-id="<site-id>">
</script>
```

- Script واحد، 2KB تقريباً.
- بيانات التحليلات تصل Umami → Supabase Postgres.
- Dashboard على `https://umami.<username>.vercel.app` (محمي بتسجيل دخول).

### 6.4 ما يتم تتبعه

- Page views + referrer + country + device + browser.
- لا Cookies، لا Fingerprinting، لا IP مُخزَّن.
- متوافق مع GDPR بدون Banner.

---

## 7. Build & Deploy Pipeline `[مقترح للاعتماد]`

### 7.1 Workflow: `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build site
        env:
          PUBLIC_SUPABASE_URL: ${{ secrets.PUBLIC_SUPABASE_URL }}
          PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.PUBLIC_SUPABASE_ANON_KEY }}
          PUBLIC_CONTACT_FUNCTION_URL: ${{ secrets.PUBLIC_CONTACT_FUNCTION_URL }}
          PUBLIC_UMAMI_URL: ${{ secrets.PUBLIC_UMAMI_URL }}
          PUBLIC_UMAMI_SITE_ID: ${{ secrets.PUBLIC_UMAMI_SITE_ID }}
          PUBLIC_SITE_URL: ${{ secrets.PUBLIC_SITE_URL }}
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 7.2 Edge Function Deployment (منفصل)

نشر `contact-submit` يتم يدوياً أو عبر Workflow منفصل عند تغيير الدالة فقط:

```yaml
# .github/workflows/deploy-functions.yml (اختياري)
# يُشغَّل يدوياً أو عند تغيير supabase/functions/**
```

**في البداية:** نشر يدوي عبر Supabase CLI على جهاز المطور. أتمتة لاحقاً إن لزم.

---

## 8. هيكل المجلدات `[مقترح للاعتماد]`

```
personal-website/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   ├── cv/
│   │   ├── emad-ali-cv-ar.pdf
│   │   └── emad-ali-cv-en.pdf
│   └── fonts/            — خطوط مستضافة محلياً
├── src/
│   ├── assets/
│   │   ├── images/
│   │   │   ├── profile.webp
│   │   │   └── og-image.png
│   │   ├── diagrams/
│   │   │   ├── fuel-quality.svg
│   │   │   ├── content-management.svg
│   │   │   ├── alshifa-website.svg
│   │   │   └── alshifa-mis.svg
│   │   └── icons/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.astro
│   │   │   ├── Footer.astro
│   │   │   ├── LanguageToggle.astro
│   │   │   └── ThemeToggle.astro
│   │   ├── sections/
│   │   │   ├── Hero.astro
│   │   │   ├── Methodology.astro
│   │   │   ├── Expertise.astro
│   │   │   ├── Projects.astro
│   │   │   ├── Certifications.astro
│   │   │   ├── Interests.astro
│   │   │   └── Contact.astro
│   │   ├── projects/
│   │   │   ├── ProjectCard.astro
│   │   │   ├── InteractiveDiagram.astro
│   │   │   └── TechStack.astro
│   │   └── ui/
│   │       ├── Button.astro
│   │       ├── Badge.astro
│   │       └── IconButton.astro
│   ├── content/
│   │   └── projects/
│   │       ├── fuel-quality-detection.json
│   │       ├── content-management-blog.json
│   │       ├── alshifa-quran-website.json
│   │       └── alshifa-management-system.json
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── ProjectLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── privacy.astro
│   │   ├── 404.astro
│   │   └── projects/
│   │       ├── fuel-quality-detection.astro
│   │       ├── content-management-blog.astro
│   │       ├── alshifa-quran-website.astro
│   │       └── alshifa-management-system.astro
│   ├── locales/
│   │   ├── ar.json
│   │   └── en.json
│   ├── lib/
│   │   ├── i18n.ts           — دوال الترجمة
│   │   ├── theme.ts          — إدارة الوضع الداكن/الفاتح
│   │   ├── supabase.ts       — Client مُهيَّأ
│   │   └── analytics.ts      — Helpers Umami
│   ├── scripts/              — Vanilla TS للـ Islands
│   │   ├── theme-toggle.ts
│   │   ├── language-toggle.ts
│   │   ├── interactive-diagram.ts
│   │   ├── contact-form.ts
│   │   └── progressive-reveal.ts
│   └── styles/
│       ├── global.css
│       └── tokens.css        — CSS Variables (Design Tokens)
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   └── 20261116000000_create_contact_messages.sql
│   └── functions/
│       └── contact-submit/
│           ├── index.ts
│           └── deno.json
├── .env.example
├── .gitignore
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── package.json
├── README.md
└── LICENSE
```

**ملاحظات على الهيكل:**
- `content/projects/*.json` يحتوي البيانات الوصفية (title, tech, slug, status) لعرضها بتجنب التكرار بين الصفحة الرئيسية وصفحة التفصيل.
- `scripts/` منفصلة عن `lib/` لأنها ملفات Vanilla تُستورد عبر `<script>` client-side، بينما `lib/` تُستورد في Astro (server-side).

---

## 9. استراتيجية الصور والأصول `[مقترح للاعتماد]`

### 9.1 الصور

| النوع | الصيغة | الموقع | ملاحظات |
|--------|--------|--------|---------|
| الصورة الشخصية | WebP + JPG fallback | `src/assets/images/` | عرضان: 400×600 للشاشات العادية، 800×1200 لشاشات Retina |
| OG Image للمشاركة | PNG 1200×630 | `src/assets/images/og-image.png` | واحدة أو واحدة لكل صفحة مشروع |
| أيقونات الجهات المانحة للشهادات | SVG أو WebP | `src/assets/images/certs/` | إن لم تتوفر: الحرف الأول من الاسم |
| لقطات شاشة المشاريع (إن توفرت) | WebP | `src/assets/images/projects/` | اختياري — إن لم تتوفر: رسم معماري مبسّط |

**قاعدة:** جميع الصور تمر بـ `@astrojs/image` أو Astro's built-in Image Component للتحسين التلقائي (resizing + lazy loading + WebP conversion).

### 9.2 الخطوط

- استضافة محلية في `public/fonts/` لتجنب اعتمادية Google Fonts.
- `@font-face` مع `font-display: swap`.
- Subset للغة العربية + الإنجليزية فقط (لتقليل الحجم).
- Preload للخطوط الرئيسية في `<head>`.

### 9.3 الـ PDFs

- CV: في `public/cv/` بصيغتي عربية وإنجليزية (ملفان).
- الشهادات: خياران:
  - **الخيار A:** رفع نسخ من ملفات الشهادات إلى `public/certifications/` لعرضها مباشرة من الموقع.
  - **الخيار B:** روابط خارجية إلى ملفات الشهادات على Google Drive / GitHub Raw.

**التوصية:** الخيار A — استقلالية كاملة، لا اعتمادية خارجية.

---

## 10. معمارية الأمان `[مقترح للاعتماد]`

### 10.1 إدارة المفاتيح والأسرار

| المفتاح | النوع | أين يُحفظ | أين يُستخدم |
|---------|-------|------------|---------------|
| `SUPABASE_URL` | عام | GitHub Secrets (prefix `PUBLIC_`) | Client Bundle |
| `SUPABASE_ANON_KEY` | عام (محمي بـ RLS) | GitHub Secrets | Client Bundle |
| `SUPABASE_SERVICE_ROLE_KEY` | **سري جداً** | Supabase Edge Function env فقط | Edge Function فقط |
| `IP_HASH_SALT` | سري | Supabase Edge Function env | Edge Function فقط |
| `ALLOWED_ORIGIN` | غير سري | Supabase Edge Function env | Edge Function فقط |
| `CONTACT_FUNCTION_URL` | عام | GitHub Secrets | Client Bundle |
| `UMAMI_URL` / `UMAMI_SITE_ID` | عام | GitHub Secrets | Client Bundle |

**قواعد حاسمة:**
- أي مفتاح يبدأ بـ `PUBLIC_` في Astro يظهر في Bundle العميل — لا تضع فيه سراً.
- `SUPABASE_SERVICE_ROLE_KEY` **لا يدخل إلى GitHub أبداً** ولا إلى `.env.example`.
- `.env` في `.gitignore`.

### 10.2 CSP Headers

نظراً لأن GitHub Pages لا يسمح بتعديل HTTP headers مباشرة، يُستخدم **Meta tag CSP** داخل `<head>`:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' https://umami.<username>.vercel.app;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self' https://<project>.supabase.co https://umami.<username>.vercel.app;
  frame-ancestors 'none';
">
```

### 10.3 Rate Limiting

- في Edge Function: استعلام SQL بسيط كما وُضح في § 5.
- لا نحتاج أدوات خارجية.
- Fallback: Supabase نفسه يحد الطلبات على مستوى Project.

### 10.4 حماية نموذج التواصل

- Honeypot (حقل مخفي يجب أن يبقى فارغاً).
- Validation مزدوجة: Client + Server.
- Rate Limiting عبر `ip_hash`.
- الطول الأقصى للحقول محدَّد في SQL constraints.

### 10.5 حماية ضد XSS

- Astro يُفلتر المخرجات افتراضياً.
- أي محتوى من قاعدة البيانات (مستقبلاً) يُعرض عبر `{text}` لا `{@html}`.
- تعقيم الإدخال في Edge Function قبل الحفظ.

### 10.6 CORS

- Edge Function تقبل Origin واحداً فقط: `https://<username>.github.io`.
- لا Wildcards.

---

## 11. قائمة التبعيات المقترحة (package.json)

### 11.1 Dependencies

```json
{
  "dependencies": {
    "astro": "^4.x",
    "@astrojs/tailwind": "^5.x",
    "@astrojs/sitemap": "^3.x",
    "@supabase/supabase-js": "^2.x",
    "tailwindcss": "^3.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/node": "^20.x",
    "prettier": "^3.x",
    "prettier-plugin-astro": "^0.x",
    "prettier-plugin-tailwindcss": "^0.x"
  }
}
```

**ملاحظات:**
- لا React، لا Vue، لا Svelte في الـ Dependencies.
- لا مكتبات حركة (Framer Motion, GSAP) — Vanilla CSS Transitions كافية.
- لا مكتبات أيقونات ضخمة — نستخدم SVG inline أو ملفاً بسيطاً من Lucide/Heroicons.

### 11.2 المكتبات التي **لن** نستخدمها (رفض صريح)

- React/Vue/Svelte كـ framework رئيسي.
- Framer Motion, GSAP, Lottie.
- D3.js, Three.js.
- i18next, react-intl.
- styled-components, emotion.
- Lodash, Moment.js (نكتب utilities بسيطة حسب الحاجة).

---

## 12. متغيرات البيئة — ملف `.env.example`

```bash
# ===== Public (client-exposed) =====
PUBLIC_SITE_URL=https://<username>.github.io
PUBLIC_SUPABASE_URL=https://<project>.supabase.co
PUBLIC_SUPABASE_ANON_KEY=<anon_key>
PUBLIC_CONTACT_FUNCTION_URL=https://<project>.supabase.co/functions/v1/contact-submit
PUBLIC_UMAMI_URL=https://umami.<username>.vercel.app
PUBLIC_UMAMI_SITE_ID=<site_id>
```

**ملاحظة:** هذا الملف يُدفع إلى المستودع كمرجع فارغ. الـ `.env` الحقيقي في `.gitignore`.

---

## 13. متطلبات تمنع بدء المرحلة 4

| # | المتطلب | المصدر | الحالة |
|---|---------|---------|---------|
| 1 | إنشاء مستودع GitHub + اختيار `username` | صاحب المشروع | ⏳ قيد الاستلام |
| 2 | إنشاء مشروع Supabase مجاني | صاحب المشروع | ⏳ يتم عند البدء |
| 3 | إنشاء حساب Vercel أو Fly.io (لـ Umami) | صاحب المشروع | ⏳ يتم عند البدء |
| 4 | روابط التواصل الفعلية (Facebook/LinkedIn/WhatsApp/Email) | صاحب المشروع | ⏳ قيد الاستلام |
| 5 | ملف CV بصيغة PDF (نسختان) | صاحب المشروع | ⏳ قيد الاستلام |
| 6 | روابط GitHub للمهارات النظرية (اختياري قبل المرحلة 4) | صاحب المشروع | ⏳ اختياري |

**ما يمكن البدء به فوراً عند اعتماد المرحلة 3:**
- إنشاء هيكل المشروع محلياً (بدون النشر).
- كتابة المكونات، التنسيقات، نظام الـ i18n.
- بناء المخططات التفاعلية.
- يُؤجَّل النشر الفعلي حتى استلام الأصول.

---

## 14. القرارات المفتوحة التي تحتاج حسمك

| # | البند | الخيارات | توصيتي |
|---|-------|-----------|---------|
| 1 | Umami على Vercel أم Fly.io؟ | Vercel أبسط / Fly.io أكثر استقلالية | **Vercel** — الأبسط والأسرع للإطلاق |
| 2 | نشر الشهادات محلياً أم روابط خارجية؟ | A (في `public/`) / B (روابط) | **A** — استقلالية كاملة |
| 3 | نسخ الـ CV: عربي + إنجليزي معاً، أم واحدة فقط البداية؟ | A / B | **B** — بدء بنسخة واحدة، إضافة الثانية لاحقاً |
| 4 | أداة Lint: ESLint + Prettier أم Prettier فقط؟ | A / B | **A** — ESLint يحمي من أخطاء شائعة |
| 5 | هل نضيف PWA (Progressive Web App) للموقع؟ | نعم / لا | **لا** — غير ضروري لـ Portfolio، تعقيد زائد |
| 6 | هل نضيف اختبارات (Vitest, Playwright)؟ | نعم / لا | **لا على الأقل للـ MVP** — اختبار يدوي كافٍ لموقع ثابت |
| 7 | i18n keys: هل نستخدم Dot notation (`hero.title`) أم Flat (`heroTitle`)؟ | A / B | **A** — أوضح وأقرب للمعيار |

---

## 15. الخطوة التالية — الانتقال إلى المرحلة 4

**المرحلة 4: التنفيذ البرمجي (Implementation)** تبدأ بـ:

1. إنشاء هيكل المشروع (scaffolding) بـ Astro.
2. إعداد Tailwind + Design Tokens.
3. إعداد i18n (ملفات locales + helper).
4. إعداد Theme System (CSS Variables + Toggle).
5. بناء BaseLayout + Header + Footer.
6. بناء الصفحة الرئيسية قسماً قسماً (Hero → Contact).
7. بناء صفحات المشاريع الأربع.
8. بناء المخططات التفاعلية SVG.
9. ربط Contact Form بـ Edge Function.
10. إعداد Supabase (SQL + Function + Umami).
11. GitHub Actions + النشر على GitHub Pages.

**ترتيب التنفيذ يتبع مبدأ Walking Skeleton:** هيكل عام يعمل من البداية → ملء المحتوى تدريجياً → تلميع.

---

*نهاية `PHASE3_ARCH.md` — الإصدار الأول للمرحلة الثالثة، في انتظار المراجعة والاعتماد.*
