# القسم 19: تحسين محركات البحث (SEO) والجاهزية للإنتاج

> **دورة Next.js** — القسم 19 من 25 · المستوى: متوسط

بالإضافة إلى البيانات الوصفية (metadata) الخاصة بكل صفحة (تم تناولها في القسم 8)، يحتاج الموقع الجاهز للإنتاج إلى خريطة موقع (sitemap)، وسياسة روبوتات (robots)، وبيانات منظّمة (structured data) لنتائج بحث غنية، وقائمة تحقق نهائية قبل الإطلاق.

📁 **كود هذا القسم:** انظر مجلد [`examples/`](./examples).

---

## جدول المحتويات

1. [نظرة عامة على SEO](#1-seo-overview)
2. [البيانات الوصفية الثابتة](#2-static-metadata)
3. [البيانات الوصفية الديناميكية](#3-dynamic-metadata)
4. [خريطة الموقع (Sitemap)](#4-sitemap)
5. [ملف Robots](#5-robots-file)
6. [صور Open Graph](#6-open-graph-images)
7. [نظرة عامة على البيانات المنظّمة](#7-structured-data-overview)
8. [أساسيات إمكانية الوصول (Accessibility)](#8-accessibility-basics)
9. [قائمة التحقق قبل الإنتاج](#9-production-checklist)

---

## 1. نظرة عامة على SEO

### الحل

HTML المُعروض من جانب الخادم (الإعداد الافتراضي في Next.js)، وأوقات التحميل السريعة، والبيانات الوصفية المنظّمة هي أكبر ثلاث روافع لظهور نتائج البحث — وثلاثتها متاحة تقريبًا مجانًا مع الإعدادات الافتراضية لـ App Router.

---

## 2. البيانات الوصفية الثابتة

### الحل

تم تناول هذا في [القسم 8](../Section%2008%20-%20Assets%20Images%20and%20Metadata/README.md#6-metadata-api) — صدّر كائن `metadata` للعناوين/الأوصاف الثابتة.

---

## 3. البيانات الوصفية الديناميكية

### الحل

تم تناول هذا في [القسم 8](../Section%2008%20-%20Assets%20Images%20and%20Metadata/README.md#7-dynamic-metadata) — استخدم `generateMetadata` للعناوين/الأوصاف الديناميكية الخاصة بكل مسار.

---

## 4. خريطة الموقع (Sitemap)

انظر [`examples/01-sitemap.ts`](./examples/01-sitemap.ts).

### المشكلة

تحتاج محركات البحث إلى قائمة بكل عنوان URL قابل للزحف، بما في ذلك العناوين الديناميكية (مثل كل منشور مدونة) — الحفاظ على هذا يدويًا لا يتوسع.

### الحل

ملف `sitemap.ts` يُولّد `/sitemap.xml` ديناميكيًا:

```ts
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();
  const postUrls = posts.map((post) => ({ url: `https://example.com/blog/${post.slug}`, lastModified: post.updatedAt }));
  return [{ url: "https://example.com", lastModified: new Date() }, ...postUrls];
}
```

---

## 5. ملف Robots

انظر [`examples/02-robots.ts`](./examples/02-robots.ts).

### الحل

ملف `robots.ts` يُولّد `/robots.txt`، ويتحكم في الزواحف (crawlers) التي يمكنها الوصول إلى أي مسارات:

```ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/admin/" },
    sitemap: "https://example.com/sitemap.xml",
  };
}
```

---

## 6. صور Open Graph

### الحل

تم تناول هذا في [القسم 8](../Section%2008%20-%20Assets%20Images%20and%20Metadata/README.md#9-open-graph-metadata) — ملف `opengraph-image.tsx` يُولّد صور معاينة اجتماعية ديناميكية عبر واجهة `ImageResponse`.

---

## 7. نظرة عامة على البيانات المنظّمة

انظر [`examples/03-json-ld.tsx`](./examples/03-json-ld.tsx).

### المشكلة

يمكن لمحركات البحث عرض نتائج غنية (تقييمات نجمية، معاينات مقالات، قوائم أسئلة شائعة منسدلة) — لكن فقط إذا استطاعت تحليل بيانات منظّمة تصف نوع المحتوى.

### الحل

ضمّن JSON-LD مباشرة في الصفحة:

```tsx
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: post.title,
  datePublished: post.publishedAt,
  author: { "@type": "Person", name: post.author.name },
};

<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
```

> ⚠️ **تحذير:** يُعتبر `dangerouslySetInnerHTML` عادةً علامة تحذير لهجمات XSS، لكن هنا أنت تُسلسل (serialize) كائن JS عادي أنشأته بنفسك — طالما لا يتدفق أي إدخال مستخدم غير مُعقَّم مباشرة إليه، فإن هذا الاستخدام المحدد آمن وهو النمط القياسي لـ JSON-LD.

---

## 8. أساسيات إمكانية الوصول (Accessibility)

### الحل

- استخدم HTML الدلالي (`<nav>`، `<main>`، `<article>`، ترتيب عناوين صحيح) بدلًا من حساء الـ `<div>`
- أضف نص `alt` ذا معنى لكل صورة
- تأكد من أن جميع العناصر التفاعلية قابلة للوصول والتشغيل عبر لوحة المفاتيح

---

## 9. قائمة التحقق قبل الإنتاج

### الحل

قبل الإطلاق، تحقق من:

- تعيين جميع متغيرات البيئة المطلوبة في منصة الاستضافة (وليس فقط في `.env.local`)
- ربط مراقبة الأخطاء (مثل Sentry) لالتقاط أعطال وقت التشغيل
- أن تكون استراتيجية التخزين المؤقت/إعادة التحقق مقصودة لكل مسار، وليست عرضية
- تشغيل بناء إنتاج (`next build`) بنجاح دون أي تحذيرات
- التحقق من Core Web Vitals على صفحة تمثيلية، وليس الصفحة الرئيسية فقط

---

## ✅ ملخص القسم

- يُولّد `sitemap.ts` و`robots.ts` ملفي `/sitemap.xml` و`/robots.txt` ديناميكيًا
- تُتيح البيانات المنظّمة بصيغة JSON-LD نتائج بحث غنية لأنواع المحتوى المدعومة
- أساسيات إمكانية الوصول (HTML الدلالي، نص alt، التنقل بلوحة المفاتيح) جزء من الجاهزية للإنتاج، وليست تحسينًا اختياريًا
- يجب أن تغطي قائمة التحقق قبل الإطلاق متغيرات البيئة، ومراقبة الأخطاء، واستراتيجية التخزين المؤقت، وبناء إنتاج نظيف

---

## Review Questions

1. **Why generate `sitemap.xml` dynamically instead of writing a static file?**
   Because a site with dynamic content (like blog posts) has URLs that change over time — a `sitemap.ts` file can query the database and include every current post, whereas a static file would immediately go stale as content is added or removed.

2. **Why is `dangerouslySetInnerHTML` considered safe for JSON-LD structured data specifically?**
   Because the content being injected is a JSON object you constructed from known, controlled fields — the risk `dangerouslySetInnerHTML` normally guards against is injecting unsanitized *user-supplied* HTML/script, which isn't happening here as long as none of the JSON-LD fields come directly from unescaped user input.

---

**السابق:** [القسم 18 — Performance Optimization](../Section%2018%20-%20Performance%20Optimization/README.md)
**التالي:** [القسم 20 — Deployment](../Section%2020%20-%20Deployment/README.md)
