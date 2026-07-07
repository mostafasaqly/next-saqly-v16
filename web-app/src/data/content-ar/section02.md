# القسم 2: إعداد بيئة التطوير

> **كورس Next.js** — القسم 2 من 25 · الوقت المقدر: ~30 دقيقة · المستوى: مبتدئ

قبل كتابة أي كود للتطبيق، تحتاج إلى تثبيت Node.js وإنشاء مشروع Next.js. يستعرض هذا القسم عملية الإعداد من البداية للنهاية، بما في ذلك الأسئلة التي ستراها وأكثر المشاكل شيوعاً التي تعيق المبتدئين.

---

## جدول المحتويات

1. [تثبيت Node.js](#1-تثبيت-nodejs)
2. [إنشاء مشروع Next.js](#2-إنشاء-مشروع-nextjs)
3. [خيارات إعداد المشروع](#3-خيارات-إعداد-المشروع)
4. [فهم هيكل المشروع](#4-فهم-هيكل-المشروع)
5. [تشغيل خادم التطوير](#5-تشغيل-خادم-التطوير)
6. [إضافات VS Code الموصى بها](#6-إضافات-vs-code-الموصى-بها)
7. [مشاكل الإعداد الشائعة](#7-مشاكل-الإعداد-الشائعة)

---

## 1. تثبيت Node.js

### المشكلة

Next.js أداة مبنية على Node.js، لذا بدون تثبيت Node (أو مع إصدار قديم جداً)، فإن `create-next-app` وخادم التطوير ببساطة لن يعملا.

### الحل

قم بتثبيت Node.js **20.9 أو أحدث** (مطلوب من Next.js 16). أفضل طريقة هي عبر مدير إصدارات (version manager) حتى تتمكن من التبديل بين إصدارات Node لكل مشروع:

```bash
# install nvm (macOS/Linux) then:
nvm install 20
nvm use 20

# verify
node -v   # should print v20.9.0 or higher
npm -v
```

> 💡 **نصيحة:** على Windows، استخدم `nvm-windows` أو ثبّت Node مباشرة من nodejs.org — كلاهما يعمل بشكل جيد لهذا الكورس.

---

## 2. إنشاء مشروع Next.js

### المشكلة

إعداد مشروع Next.js يدوياً (إعداد TypeScript، ESLint، قواعد المجلدات) عملية مملة ومن السهل أن تخطئ فيها بشكل غير واضح.

### الحل

استخدم أداة الإنشاء الرسمية، التي تطرح عليك بعض الأسئلة وتُنشئ مشروعاً مُعدّاً بشكل صحيح:

```bash
npx create-next-app@latest my-app
cd my-app
npm run dev
```

---

## 3. خيارات إعداد المشروع

تطرح `create-next-app` عدة خيارات. لهذا الكورس، استخدم:

```text
✔ TypeScript?                 Yes
✔ ESLint?                     Yes
✔ Tailwind CSS?               Yes
✔ src/ directory?             Yes
✔ App Router?                 Yes  (this is the only option in current Next.js)
✔ Turbopack for next dev?     Yes  (default)
✔ Import alias (@/*)?         Yes
```

> ⚠️ **تحذير:** تذكر بعض الدروس القديمة الاختيار بين "App Router" و "Pages Router". النسخة الحالية من Next.js تُنشئ App Router فقط — لا يزال Pages Router موجوداً للمشاريع القديمة لكنه غير مُقدَّم للمشاريع الجديدة.

---

## 4. فهم هيكل المشروع

```text
my-app/
├── src/
│   └── app/
│       ├── layout.tsx     ← root layout (required)
│       ├── page.tsx       ← homepage ("/")
│       └── globals.css
├── public/                ← static files served as-is
├── next.config.ts
├── tsconfig.json
└── package.json
```

كل ما يوجد تحت `app/` يُترجم إلى مسارات وواجهاتها. `public/` يحتوي الأصول المُشار إليها عبر رابط (مثل `/logo.png`).

---

## 5. تشغيل خادم التطوير

```bash
npm run dev
```

هذا يشغّل خادم التطوير على `http://localhost:3000`، مدعوماً بـ **Turbopack** افتراضياً — أداة التجميع (bundler) الخاصة بـ Next.js المبنية بلغة Rust، والتي توفّر بدء تشغيل شبه فوري وتحديثاً سريعاً مقارنة بخادم التطوير القديم المبني على Webpack.

> 💡 **نصيحة:** يدعم Turbopack الآن أيضاً `next build`، وليس فقط `next dev` — عمليات بناء الإنتاج أصبحت أسرع بشكل ملحوظ أيضاً.

---

## 6. إضافات VS Code الموصى بها

- **ESLint** — يظهر أخطاء الفحص (lint) مباشرة في الكود
- **Prettier** — تنسيق كود متسق عند الحفظ
- **Tailwind CSS IntelliSense** — إكمال تلقائي لفئات (classes) Tailwind
- إضافة **Next.js snippets** الرسمية — قوالب سريعة لـ `page.tsx`، `layout.tsx`، وغيرها

---

## 7. مشاكل الإعداد الشائعة

| العرض | السبب المحتمل | الحل |
|---|---|---|
| فشل أو تجمّد `create-next-app` | إصدار Node قديم جداً | الترقية إلى Node 20.9 أو أحدث |
| `Error: Port 3000 is already in use` | خادم تطوير آخر يعمل | أوقفه، أو شغّل `next dev -p 3001` |
| واجهة قديمة/معطلة بعد سحب تغييرات | ذاكرة تخزين مؤقت `.next` تالفة | احذف مجلد `.next` وأعد تشغيل `npm run dev` |
| أخطاء TypeScript بعد استنساخ جديد | `node_modules` مفقود | شغّل `npm install` |

---

## ✅ ملخص القسم

- يتطلب Next.js 16 **Node.js 20.9 أو أحدث**
- أنشئ مشاريع جديدة باستخدام `npx create-next-app@latest`
- اختر TypeScript، ESLint، Tailwind، `src/`، App Router، ومسار اختصار للاستيراد (import alias)
- يعمل `next dev` الآن على **Turbopack** افتراضياً لبدء تشغيل وتحديث سريعين
- معظم مشاكل الإعداد ترجع إلى عدم تطابق إصدار Node أو ذاكرة تخزين مؤقت `.next` قديمة

---

## Review Questions

1. **Why does Next.js 16 require Node.js 20.9 or later?**
   Next.js relies on modern Node.js runtime features (and Turbopack's requirements) that aren't available in older Node versions — running an older version causes the CLI or dev server to fail unpredictably.

2. **What's the fastest fix when the dev server shows stale or broken UI after pulling new changes?**
   Delete the `.next` build cache folder and restart `npm run dev` — this forces Next.js to rebuild from scratch instead of reusing outdated cached output.

---

**السابق:** [القسم 1 — مقدمة الكورس](../Section%2001%20-%20Course%20Introduction/README.md)
**التالي:** [القسم 3 — أساسيات Next.js](../Section%2003%20-%20Next.js%20Fundamentals/README.md)
