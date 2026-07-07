# القسم 10: التخزين المؤقت وإعادة التحقق

> **دورة Next.js** — القسم 10 من 25 · المستوى: متقدم

التخزين المؤقت (caching) هو ما يجعل Next.js سريعًا افتراضيًا، لكنه أيضًا الموضوع الذي يربك المطورين أكثر من غيره عند الانتقال من تطبيق SPA عادي. يرسم هذا القسم خريطة لكل طبقة من طبقات التخزين المؤقت وكيفية إبطال كل واحدة منها بتعمُّد.

📁 **الكود الخاص بهذا القسم:** انظر مجلد [`examples/`](./examples).

---

## جدول المحتويات

1. [ما هو التخزين المؤقت؟](#1-what-is-caching)
2. [نظرة عامة على التخزين المؤقت في Next.js](#2-nextjs-caching-overview)
3. [العرض الثابت (Static Rendering)](#3-static-rendering)
4. [العرض الديناميكي (Dynamic Rendering)](#4-dynamic-rendering)
5. [تخزين الطلب المؤقت (Request Memoization)](#5-request-memoization)
6. [ذاكرة التخزين المؤقت للبيانات (Data Cache)](#6-data-cache)
7. [ذاكرة التخزين المؤقت الكاملة للمسار (Full Route Cache)](#7-full-route-cache)
8. [ذاكرة تخزين الموجّه المؤقتة (Router Cache)](#8-router-cache)
9. [إعادة التحقق المستندة إلى الوقت](#9-time-based-revalidation)
10. [إعادة التحقق عند الطلب](#10-on-demand-revalidation)
11. [الدالة revalidatePath](#11-revalidatepath)
12. [الدالة revalidateTag](#12-revalidatetag)

---

## 1. ما هو التخزين المؤقت؟

### الحل

يعني التخزين المؤقت تخزين نتيجة محسوبة (صفحة معروضة، استجابة fetch) بحيث يمكن لطلب لاحق إعادة استخدامها بدلًا من إعادة القيام بالعمل — مما يقايض قدرًا من عدم الحداثة (staleness) بالسرعة.

---

## 2. نظرة عامة على التخزين المؤقت في Next.js

### الحل

يضم Next.js أربع ذواكر تخزين مؤقت متمايزة، لكل منها نطاقها وقواعد إبطالها الخاصة:

| الطبقة | النطاق | ما تخزنه |
|---|---|---|
| Request Memoization | عملية عرض واحدة | نتائج `fetch()` بعد إزالة التكرار |
| Data Cache | عبر الطلبات وعمليات النشر | نتائج `fetch()` (دائمة) |
| Full Route Cache | عبر الطلبات | HTML المعروض/حمولة RSC للمسارات الثابتة |
| Router Cache | من جانب العميل، لكل جلسة متصفح | شرائح المسارات التي تمت زيارتها، للتنقل الفوري للأمام/للخلف |

> ⚠️ **تحذير:** هذه أربع ذواكر تخزين مؤقت *مختلفة*. مسح واحدة منها (مثل استدعاء `revalidatePath`) لا يمسح الأخريات تلقائيًا — من المهم فهم الطبقة التي تستهدفها.

---

## 3. العرض الثابت (Static Rendering)

انظر [`examples/01-static-vs-dynamic.tsx`](./examples/01-static-vs-dynamic.tsx).

### الحل

يُعرَض المسار الذي لا يحتوي على بيانات خاصة بالطلب (لا `cookies()`، ولا fetch بخيار `no-store`) مرة واحدة في وقت البناء ويُقدَّم كـ HTML ثابت من Full Route Cache:

```tsx
export default function AboutPage() {
  return <h1>About Us</h1>;
}
```

---

## 4. العرض الديناميكي (Dynamic Rendering)

### الحل

قراءة بيانات خاصة بالطلب — ملفات تعريف الارتباط (cookies)، الرؤوس (headers)، معاملات البحث (search params)، أو `fetch` بخيار `cache: "no-store"` — يجعل المسار يُعرض بشكل جديد مع كل طلب:

```tsx
import { cookies } from "next/headers";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value;
  return <p>Theme: {theme}</p>;
}
```

---

## 5. تخزين الطلب المؤقت (Request Memoization)

### الحل

ضمن **عملية عرض واحدة**، تُزال تلقائيًا التكرارات في استدعاءات `fetch()` المتطابقة (نفس عنوان URL + نفس الخيارات) — استدعاء نفس دالة البيانات من تخطيط (layout) وصفحة لا يصل إلى الشبكة إلا مرة واحدة. تُمسح هذه الذاكرة المؤقتة في نهاية كل طلب.

---

## 6. ذاكرة التخزين المؤقت للبيانات (Data Cache)

### الحل

على عكس Request Memoization، **تستمر** Data Cache **عبر الطلبات وعمليات النشر**. تبقى نتيجة `fetch()` المخزنة باستخدام `force-cache` أو `next.revalidate` متاحة حتى تتم إعادة التحقق منها صراحة أو تنتهي فترتها الزمنية.

---

## 7. ذاكرة التخزين المؤقت الكاملة للمسار (Full Route Cache)

### الحل

بالنسبة للمسارات المعروضة بشكل ثابت، يخزن Next.js الناتج المعروض بأكمله (HTML + حمولة RSC)، بحيث لا تعيد الزيارة المتكررة عرض شجرة المكونات على الإطلاق — بل تقدم النتيجة المخزنة مباشرة.

---

## 8. ذاكرة تخزين الموجّه المؤقتة (Router Cache)

### الحل

على جانب العميل، يحتفظ Next.js بذاكرة تخزين مؤقت لشرائح المسارات التي تمت زيارتها في الذاكرة، بحيث يكون التنقل مرة أخرى إلى صفحة تمت زيارتها سابقًا فوريًا — دون طلب جديد، ودون إعادة عرض.

---

## 9. إعادة التحقق المستندة إلى الوقت

انظر [`examples/02-time-based-revalidation.tsx`](./examples/02-time-based-revalidation.tsx).

### الحل

اضبط فترة `revalidate` (بالثواني) بحيث تتحدث البيانات المخزنة مؤقتًا تلقائيًا بعد انقضاء تلك الفترة:

```tsx
export const revalidate = 60; // route-segment level

// or per-fetch:
await fetch(url, { next: { revalidate: 60 } });
```

---

## 10. إعادة التحقق عند الطلب

### المشكلة

فترة تخزين مؤقت مدتها 60 ثانية تعني أن المحتوى قد يبقى غير محدث لمدة تصل إلى دقيقة بعد أن ينشر المحرر تغييرًا — وأحيانًا يكون ذلك بطيئًا جدًا.

### الحل

فعّل إبطال ذاكرة التخزين المؤقت يدويًا، استجابة لحدث مثل webhook من نظام إدارة المحتوى (CMS)، باستخدام `revalidatePath` أو `revalidateTag` (أدناه) بدلًا من انتظار المؤقت.

---

## 11. الدالة revalidatePath

انظر [`examples/03-revalidate-path.tsx`](./examples/03-revalidate-path.tsx).

### الحل

أبطل ذاكرة التخزين المؤقت لمسار واحد محدد، ويُستدعى ذلك عادة مباشرة بعد عملية تعديل (mutation):

```ts
"use server";
import { revalidatePath } from "next/cache";

export async function createPost(formData: FormData) {
  await db.post.create({ data: { title: formData.get("title") as string } });
  revalidatePath("/posts");
}
```

---

## 12. الدالة revalidateTag

انظر [`examples/04-revalidate-tag.tsx`](./examples/04-revalidate-tag.tsx).

### الحل

ضع علامة (tag) على استدعاءات `fetch()` ذات الصلة، ثم أبطلها جميعًا دفعة واحدة — عبر أي مسار يستخدم تلك العلامة — وهو أكثر مرونة من استهداف مسار واحد في كل مرة:

```ts
// tag the fetch
await fetch(url, { next: { tags: ["posts"] } });

// invalidate everywhere it's used
import { revalidateTag } from "next/cache";
revalidateTag("posts");
```

> 💡 **نصيحة:** استخدم `revalidatePath` عندما يحتاج مسار واحد فقط إلى التحديث؛ واستخدم `revalidateTag` عندما تظهر نفس البيانات في عدة مسارات (مثل منشور يظهر في صفحة قائمة وصفحة تفاصيل معًا).

---

## ✅ ملخص القسم

- يمتلك Next.js أربع طبقات تخزين مؤقت: Request Memoization و Data Cache و Full Route Cache و Router Cache
- يحدث العرض الثابت عندما لا تُقرأ أي بيانات خاصة بالطلب؛ ويبدأ العرض الديناميكي في الحالات الأخرى
- تُحدِّث `revalidate` (المستندة إلى الوقت) البيانات المخزنة مؤقتًا تلقائيًا بعد مرور N ثانية
- تبطل `revalidatePath` و `revalidateTag` عند الطلب — وتُستدعيان عادة داخل Server Action مباشرة بعد عملية تعديل

---

## Review Questions

1. **What's the difference between Request Memoization and the Data Cache?**
   Request Memoization deduplicates identical `fetch()` calls only within a single render pass and clears at the end of that request; the Data Cache persists `fetch()` results across requests and even deployments until explicitly revalidated.

2. **When should you use `revalidateTag` instead of `revalidatePath`?**
   When the same underlying data appears on more than one route — tagging the fetch once and calling `revalidateTag` invalidates it everywhere, whereas `revalidatePath` would need to be called once per affected route.

3. **What causes a route to switch from static to dynamic rendering?**
   Reading any request-specific data — `cookies()`, `headers()`, `searchParams`, or a `fetch` call using `cache: "no-store"` — forces Next.js to render that route fresh on every request instead of serving cached static HTML.

---

**السابق:** [القسم 9 — جلب البيانات](../Section%2009%20-%20Data%20Fetching/README.md)
**التالي:** [القسم 11 — النماذج و Server Actions (Forms and Server Actions)](../Section%2011%20-%20Forms%20and%20Server%20Actions/README.md)
