# القسم 8: الأصول والصور والبيانات الوصفية

> **دورة Next.js** — القسم 8 من 25 · المستوى: متوسط

يغطي هذا القسم كل ما يقع في `<head>` وفي `public/`: الصور المُحسَّنة، وأيقونات المفضلة (favicons)، وواجهة برمجة التطبيقات Metadata التي تقود تحسين محركات البحث (SEO) والمعاينات على وسائل التواصل الاجتماعي.

📁 **الكود الخاص بهذا القسم:** انظر مجلد [`examples/`](./examples).

---

## جدول المحتويات

1. [الأصول الثابتة](#1-static-assets)
2. [مجلد Public](#2-public-folder)
3. [مكون Next Image](#3-next-image-component)
4. [تحسين الصور](#4-image-optimization)
5. [أيقونة المفضلة والأيقونات](#5-favicon-and-icons)
6. [واجهة برمجة التطبيقات Metadata](#6-metadata-api)
7. [البيانات الوصفية الديناميكية](#7-dynamic-metadata)
8. [أساسيات SEO في Next.js](#8-seo-basics-in-nextjs)
9. [بيانات Open Graph الوصفية](#9-open-graph-metadata)

---

## 1. الأصول الثابتة

### الحل

يمكن استيراد الملفات مباشرة إلى المكونات (مثل الصور المستخدمة بواسطة `next/image`)، مما يمنحك استنتاج العرض/الارتفاع في وقت البناء وأسماء ملفات مُجزَّأة (hashed) لكسر التخزين المؤقت (cache-busting).

---

## 2. مجلد Public

### الحل

كل ما يوجد في `public/` يُقدَّم من عنوان URL الجذري دون تغيير — `public/logo.png` يمكن الوصول إليه على `/logo.png`. استخدم هذا للملفات التي تحتاج إلى عنوان URL ثابت ويمكن التنبؤ به (مراجع robots.txt، ملفات PDF قابلة للتنزيل، إلخ).

---

## 3. مكون Next Image

انظر [`examples/01-next-image.tsx`](./examples/01-next-image.tsx).

### المشكلة

تقدم وسوم `<img>` غير المُحسَّنة صورًا بالحجم الكامل بغض النظر عن نافذة العرض (viewport)، مما يسبب تحميلًا بطيئًا وانزياحًا في التخطيط (layout shift).

### الحل

يعيد `next/image` تحجيم الصور تلقائيًا، ويقدمها بصيغ حديثة (WebP/AVIF)، ويقوم بالتحميل الكسول (lazy-load) افتراضيًا:

```tsx
import Image from "next/image";
import heroImage from "@/public/hero.jpg";

export default function HomePage() {
  return <Image src={heroImage} alt="Hero banner" priority />;
}
```

> 💡 **نصيحة:** استخدم `priority` فقط للصور التي تظهر أعلى الصفحة دون تمرير (above-the-fold) (مثل شعار البانر الرئيسي) — فهو يعطل التحميل الكسول بحيث تُجلب الصورة فورًا.

---

## 4. تحسين الصور

انظر [`examples/02-remote-image-config.ts`](./examples/02-remote-image-config.ts).

### المشكلة

يحتاج `next/image` إلى معرفة أنه مسموح له بجلب وتحسين الصور من نطاق (domain) بعيد معين، لأسباب أمنية.

### الحل

أضف النطاقات البعيدة الموثوقة إلى القائمة البيضاء في `next.config.ts`:

```ts
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.example.com" }],
  },
};
```

> ⚠️ **تحذير:** استخدام عنوان URL لصورة بعيدة دون إضافة نطاقها إلى `remotePatterns` يُطلق خطأ في وقت التشغيل — وهذا مقصود، لمنع تحسين الصور الخارجية العشوائي.

---

## 5. أيقونة المفضلة والأيقونات

### الحل

ضع `favicon.ico` أو `icon.png` أو `apple-icon.png` مباشرة داخل `app/` — يقوم Next.js تلقائيًا بربط وسوم `<link>` الصحيحة، دون الحاجة إلى تعديل يدوي لـ `<head>`.

---

## 6. واجهة برمجة التطبيقات Metadata

انظر [`examples/03-static-metadata.tsx`](./examples/03-static-metadata.tsx).

### الحل

قم بتصدير كائن `metadata` من أي `page.tsx` أو `layout.tsx` للتحكم في وسوم `<head>` الخاصة بذلك المسار (route):

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn more about our company and mission.",
};
```

---

## 7. البيانات الوصفية الديناميكية

انظر [`examples/04-dynamic-metadata.tsx`](./examples/04-dynamic-metadata.tsx).

### المشكلة

لا يمكن لكائن `metadata` الثابت أن يعكس عناوين/أوصاف كل منشور على حدة في مسار ديناميكي.

### الحل

قم بتصدير دالة `generateMetadata` غير متزامنة (async) بدلًا من ذلك — تستقبل نفس الـ `params` (غير المتزامنة) التي تستقبلها الصفحة:

```tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  return { title: post.title, description: post.excerpt };
}
```

---

## 8. أساسيات SEO في Next.js

### الحل

- استخدم عنصر `<h1>` واحد وواضح لكل صفحة، وHTML دلالي (`<article>`, `<nav>`, `<section>`)
- اكتب بيانات `title`/`description` وصفية دقيقة وفريدة لكل مسار
- فضّل عرض Server Component للمحتوى الذي ينبغي أن يكون قابلًا للزحف (crawlable) — فـ HTML المعروض من الخادم يكون مرئيًا فورًا لبرامج الزحف (crawlers)

---

## 9. بيانات Open Graph الوصفية

انظر [`examples/05-open-graph-image.tsx`](./examples/05-open-graph-image.tsx).

### الحل

عرّف حقول `openGraph` في `metadata`/`generateMetadata` من أجل معاينات روابط غنية، واختياريًا قم بتوليد صورة معاينة ديناميكية باستخدام `ImageResponse`:

```tsx
import { ImageResponse } from "next/og";

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  return new ImageResponse(<div style={{ fontSize: 64 }}>{post.title}</div>, { width: 1200, height: 630 });
}
```

يتم التقاط ملف باسم `opengraph-image.tsx` بجانب `page.tsx` تلقائيًا — دون الحاجة إلى وسم `<meta>` يدوي.

---

## ✅ ملخص القسم

- يقدم `public/` الملفات في مسار URL ثابت وغير متغير
- يتعامل `next/image` مع تغيير الحجم وتحويل الصيغة والتحميل الكسول تلقائيًا
- يجب إدراج نطاقات الصور البعيدة صراحة في القائمة البيضاء داخل `next.config.ts`
- تتحكم `metadata` (الثابتة) و `generateMetadata` (الديناميكية وغير المتزامنة) في وسوم `<head>` لكل مسار
- يقوم `opengraph-image.tsx` بتوليد صور معاينة اجتماعية ديناميكية باستخدام واجهة برمجة التطبيقات `ImageResponse`

---

## Review Questions

1. **Why does `next/image` require remote domains to be whitelisted in `next.config.ts`?**
   To prevent the app from being used to optimize and proxy arbitrary external images, which could be a resource-abuse or security vector — explicitly listing trusted hosts closes that gap.

2. **When would you use `generateMetadata` instead of a static `metadata` export?**
   When the title/description/OG data depends on route params or fetched content — like a blog post's title — since a static `metadata` object has no way to read the current route's dynamic data.

---

**السابق:** [القسم 7 — التنسيق في Next.js](../Section%2007%20-%20Styling%20in%20Next.js/README.md)
**التالي:** [القسم 9 — جلب البيانات (Data Fetching)](../Section%2009%20-%20Data%20Fetching/README.md)
