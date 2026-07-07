# القسم 20: النشر (Deployment)

> **دورة Next.js** — القسم 20 من 25 · المستوى: متوسط

الخطوة الأخيرة قبل أن يصبح المشروع "جاهزًا" — تشغيله بشكل موثوق في مكان آخر غير حاسوبك المحمول.

📁 **كود هذا القسم:** انظر مجلد [`examples/`](./examples).

---

## جدول المحتويات

1. [تجهيز Next.js للإنتاج](#1-preparing-nextjs-for-production)
2. [متغيرات البيئة](#2-environment-variables)
3. [بناء المشروع](#3-building-the-project)
4. [النشر على Vercel](#4-deploying-to-vercel)
5. [النشر على Netlify](#5-deploying-to-netlify)
6. [نظرة عامة على النشر باستخدام Docker](#6-deploying-with-docker-overview)
7. [مشكلات النشر الشائعة](#7-common-deployment-issues)
8. [تصحيح الأخطاء في الإنتاج](#8-production-debugging)

---

## 1. تجهيز Next.js للإنتاج

### الحل

شغّل `next build` محليًا أولًا وحل كل خطأ أو تحذير وقت البناء قبل الدفع إلى منصة استضافة — اكتشاف المشكلات محليًا أسرع بكثير من تصحيحها في سجل CI.

---

## 2. متغيرات البيئة

انظر [`examples/01-env-variables.txt`](./examples/01-env-variables.txt).

### الحل

استخدم `.env.local` للأسرار أثناء التطوير (لا تُدرجه في git أبدًا). فقط المتغيرات التي تبدأ بـ `NEXT_PUBLIC_` تُعرَض لحزمة المتصفح:

```bash
DATABASE_URL="postgresql://user:pass@host:5432/db"        # server-only
NEXT_PUBLIC_ANALYTICS_ID="UA-XXXXXXX"                       # exposed to the client
```

> ⚠️ **تحذير:** لا تضع بادئة `NEXT_PUBLIC_` أبدًا أمام سر (مفتاح API، عنوان قاعدة بيانات) — سيتم تضمينه مباشرة في حزمة JavaScript الخاصة بالعميل، ويصبح مرئيًا لأي شخص يعرض المصدر.

---

## 3. بناء المشروع

### الحل

```bash
next build
```

يقوم بترجمة التطبيق باستخدام Turbopack ويُجهّز مخرجات مُحسَّنة وجاهزة للنشر.

---

## 4. النشر على Vercel

### الحل

Vercel هي المنصة التي بناها فريق Next.js — ربط مستودع Git يمنحك نشرًا دون إعداد، وعناوين URL معاينة تلقائية لكل طلب سحب (pull request)، ودعمًا كاملًا لكل ميزة في App Router (Server Actions، البث (streaming)، ISR).

---

## 5. النشر على Netlify

### الحل

تدعم Netlify App Router عبر محول Next.js الخاص بها، الذي يتعامل مع Server Actions والعرض الديناميكي — اضبط أمر البناء على `next build` ودع المحول يتولى الباقي.

---

## 6. نظرة عامة على النشر باستخدام Docker

انظر [`examples/02-docker-standalone.txt`](./examples/02-docker-standalone.txt).

### الحل

للاستضافة الذاتية، اضبط `output: "standalone"` في `next.config.ts` — هذا يُنتج حزمة خادم صغيرة ومستقلة بذاتها، مثالية لصورة Docker صغيرة:

```ts
const nextConfig = { output: "standalone" };
```

```dockerfile
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
CMD ["node", "server.js"]
```

---

## 7. مشكلات النشر الشائعة

| العرض | السبب المحتمل | الإصلاح |
|---|---|---|
| فشل البناء برسالة "Missing environment variable" | متغير بيئة مضبوط محليًا لكن غير موجود في لوحة تحكم منصة الاستضافة | أضفه إلى إعدادات متغيرات البيئة في المنصة |
| سلوك مختلف محليًا مقارنة بالنشر | عدم تطابق إصدار Node بين البيئة المحلية وبيئة الاستضافة | ثبّت إصدار Node صراحةً في إعدادات المنصة |
| فشل تحميل الصور في الإنتاج | نطاق الصورة البعيدة غير موجود في `remotePatterns` ضمن `next.config.ts` | أضف النطاق — انظر [القسم 8](../Section%2008%20-%20Assets%20Images%20and%20Metadata/README.md#4-image-optimization) |

---

## 8. تصحيح الأخطاء في الإنتاج

### الحل

استخدم سجلات الدوال/وقت التشغيل الخاصة بمنصة الاستضافة لرؤية أخطاء جانب الخادم، وادمج أداة تتبع أخطاء (مثل Sentry) للحصول على تقارير أعطال منظّمة، وفعّل خرائط المصدر (source maps) حتى تشير آثار المكدس (stack traces) إلى مصدرك الفعلي بدلًا من المخرجات المصغَّرة.

---

## ✅ ملخص القسم

- شغّل `next build` محليًا أولًا لاكتشاف الأخطاء قبل النشر
- فقط المتغيرات ذات بادئة `NEXT_PUBLIC_` تصل إلى المتصفح — لا تضع هذه البادئة أمام الأسرار أبدًا
- تقدم Vercel أكمل دعم لـ App Router دون إعداد؛ وتدعمه Netlify عبر محول
- ينتج `output: "standalone"` حزمة صغيرة لـ Docker/الاستضافة الذاتية
- معظم مشكلات النشر ترجع إلى متغيرات بيئة مفقودة، أو عدم تطابق إصدار Node، أو نطاقات صور غير مُعدَّة

---

## Review Questions

1. **Why should a secret like `DATABASE_URL` never be prefixed with `NEXT_PUBLIC_`?**
   Because that prefix tells Next.js to inline the variable's value directly into the client-side JavaScript bundle at build time, making it visible to anyone who inspects the page source — secrets must stay server-only.

2. **What does `output: "standalone"` in `next.config.ts` change about the build?**
   It produces a minimal, self-contained server bundle (with only the dependencies actually used, plus a small Node server) instead of a build that expects a full `node_modules` install — ideal for keeping Docker images small.

---

**السابق:** [القسم 19 — SEO and Production Readiness](../Section%2019%20-%20SEO%20and%20Production%20Readiness/README.md)
**التالي:** [القسم 21 — Project: Blog App](../Section%2021%20-%20Project%20Blog%20App/README.md)
