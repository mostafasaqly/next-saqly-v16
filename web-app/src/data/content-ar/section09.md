# القسم 9: جلب البيانات

> **دورة Next.js** — القسم 9 من 25 · المستوى: متوسط

يحدث جلب البيانات في App Router مباشرة داخل Server Components من نوع `async` — لا حاجة إلى `useEffect`، ولا إلى مكتبة تحميل من جانب العميل من أجل العرض الأولي.

📁 **الكود الخاص بهذا القسم:** انظر مجلد [`examples/`](./examples).

---

## جدول المحتويات

1. [نظرة عامة على جلب البيانات](#1-data-fetching-overview)
2. [جلب البيانات في Server Components](#2-fetching-data-in-server-components)
3. [واجهة Fetch API في Next.js](#3-fetch-api-in-nextjs)
4. [حالات التحميل](#4-loading-states)
5. [حالات الخطأ](#5-error-states)
6. [جلب البيانات المتوازي](#6-parallel-data-fetching)
7. [جلب البيانات المتسلسل](#7-sequential-data-fetching)
8. [إعادة استخدام منطق جلب البيانات](#8-reusing-data-fetching-logic)
9. [الجلب من واجهات برمجة تطبيقات خارجية](#9-fetching-from-external-apis)
10. [أفضل ممارسات جلب البيانات](#10-data-fetching-best-practices)

---

## 1. نظرة عامة على جلب البيانات

### المشكلة

في React العادية (بنمط SPA)، يعني جلب البيانات استخدام `useEffect` + `useState` + علامة تحميل (loading flag) — ثلاثة أجزاء متحركة لما ينبغي أن يكون بسيطًا.

### الحل

يمكن أن تكون Server Components دوال `async`. اجلب البيانات باستخدام `await`، والقيمة المُحلَّلة (resolved) هي فقط ما تعرضه — دون تأثير (effect)، ودون حالة من جانب العميل:

```tsx
export default async function PostsPage() {
  const res = await fetch("https://api.example.com/posts");
  const posts = await res.json();
  return <ul>{posts.map((p) => <li key={p.id}>{p.title}</li>)}</ul>;
}
```

---

## 2. جلب البيانات في Server Components

انظر [`examples/01-fetch-in-server-component.tsx`](./examples/01-fetch-in-server-component.tsx).

### الحل

استدعِ `fetch()` أو عميل قاعدة بيانات مباشرة في جسم المكون — يعمل هذا على الخادم، لذا فمن الآمن استخدام بيانات الاعتماد وعناوين URL الداخلية هنا.

---

## 3. واجهة Fetch API في Next.js

انظر [`examples/02-fetch-caching-options.tsx`](./examples/02-fetch-caching-options.tsx).

### الحل

يوسّع Next.js دالة `fetch()` الأصلية بكائن خيارات كوسيط ثانٍ يتحكم في التخزين المؤقت (caching):

```ts
await fetch(url, { cache: "force-cache" });               // cache indefinitely
await fetch(url, { cache: "no-store" });                   // always fresh, opts into dynamic rendering
await fetch(url, { next: { revalidate: 60 } });             // cache, refresh every 60s
await fetch(url, { next: { tags: ["posts"] } });             // cache, invalidate on demand via revalidateTag
```

> 💡 **نصيحة:** استخدام `cache: "no-store"` في أي عملية fetch ضمن مسار (route) يجعل ذلك المسار بأكمله يُعرَض بشكل ديناميكي مع كل طلب — إنها أسرع طريقة للانسحاب من العرض الثابت لمصدر بيانات معين.

---

## 4. حالات التحميل

انظر [`examples/03-loading-and-error.tsx`](./examples/03-loading-and-error.tsx).

### الحل

اجمع بين `page.tsx` الذي يجلب البيانات وملف مجاور له باسم `loading.tsx` — يقوم Next.js بتغليف المسار تلقائيًا في حد Suspense (Suspense boundary):

```tsx
// app/posts/loading.tsx
export default function Loading() {
  return <p>Loading posts…</p>;
}
```

---

## 5. حالات الخطأ

### الحل

يلتقط ملف مجاور باسم `error.tsx` (يجب أن يكون Client Component) أخطاء الجلب/العرض الخاصة بشريحة المسار (route segment) تلك:

```tsx
"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <p>Something went wrong: {error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

---

## 6. جلب البيانات المتوازي

انظر [`examples/04-parallel-fetching.tsx`](./examples/04-parallel-fetching.tsx).

### المشكلة

انتظار الطلبات واحدًا تلو الآخر عندما لا تعتمد على بعضها البعض يهدر الوقت — يُسمى هذا بشلال الطلبات (request waterfall).

### الحل

ابدأ الطلبات المستقلة معًا باستخدام `Promise.all`:

```tsx
async function ParallelFast() {
  const [user, posts] = await Promise.all([getUser(), getPosts()]);
  return { user, posts };
}
```

> ⚠️ **تحذير:** كتابة `await getUser(); await getPosts();` على أسطر منفصلة يشكل شلالًا (waterfall) حتى لو بدا غير ضار — فالطلب الثاني لا يبدأ حتى يُحلّ الطلب الأول بالكامل.

---

## 7. جلب البيانات المتسلسل

انظر [`examples/05-sequential-fetching.tsx`](./examples/05-sequential-fetching.tsx).

### الحل

عندما يحتاج طلب فعليًا إلى نتيجة طلب سابق، فإن الانتظار المتسلسل صحيح، وليس خطأً:

```tsx
const user = await getUser(id);
const posts = await getPostsByAuthor(user.id); // needs user.id — must come after
```

---

## 8. إعادة استخدام منطق جلب البيانات

انظر [`examples/06-shared-fetch-dedupe.tsx`](./examples/06-shared-fetch-dedupe.tsx).

### الحل

استخرج دوال الجلب إلى وحدة مشتركة. إذا استدعت عدة مكونات نفس الدالة بنفس الوسائط أثناء عرض واحد، يقوم Next.js تلقائيًا **بإزالة التكرار (deduplicates)** من استدعاءات `fetch()` المتطابقة — يحدث طلب شبكة فعلي واحد فقط.

---

## 9. الجلب من واجهات برمجة تطبيقات خارجية

### الحل

استدعِ واجهات REST أو GraphQL التابعة لجهات خارجية مباشرة من Server Components تمامًا كأي `fetch()` آخر — يمكن قراءة مفاتيح API بأمان من متغيرات البيئة لأن هذا الكود لا يصل أبدًا إلى المتصفح.

---

## 10. أفضل ممارسات جلب البيانات

- اجلب البيانات في أقرب نقطة ممكنة إلى مكان استخدامها، بدلًا من جلب كل شيء في تخطيط (layout) على المستوى الأعلى
- استخدم `Promise.all` كلما كانت الطلبات مستقلة
- اختر استراتيجية التخزين المؤقت (`force-cache`, `no-store`, `revalidate`) بتعمُّد لكل مصدر بيانات — لا تعتمد افتراضيًا على `no-store` في كل مكان كإجراء احترازي، وإلا ستفقد فوائد الأداء الخاصة بالتخزين المؤقت
- تجنب الجلب من جانب العميل (`useEffect` + `fetch`) للبيانات المتاحة في وقت العرض — فهذا يؤخر رؤية المستخدم للمحتوى ويضيف وميض تحميل لا تحتاجه Server Components

---

## ✅ ملخص القسم

- تجلب Server Components من نوع `async` البيانات مباشرة باستخدام `await` — دون الحاجة إلى تأثيرات أو حالة تحميل من جانب العميل
- يُتحكم في التخزين المؤقت لـ `fetch()` عبر خيارات `cache` و `next.revalidate`/`next.tags`
- يوفر `loading.tsx` و `error.tsx` سلوك Suspense وحدود الأخطاء (error-boundary) تلقائيًا لكل مسار
- استخدم `Promise.all` للطلبات المستقلة؛ والانتظار المتسلسل فقط عندما يعتمد طلب على آخر
- يتم إزالة تكرار استدعاءات `fetch()` المتطابقة ضمن عرض واحد تلقائيًا — من الآمن استدعاء دالة جلب مشتركة من عدة مكونات

---

## Review Questions

1. **What's the difference between `cache: "no-store"` and `next: { revalidate: 60 }`?**
   `no-store` never caches — every request hits the network fresh, making the route dynamic. `revalidate: 60` caches the response but treats it as stale after 60 seconds, refetching in the background on the next request after that window.

2. **Why is `Promise.all` preferred over two separate `await` statements for independent requests?**
   Separate sequential awaits create a waterfall where the second request doesn't start until the first resolves, doubling the wait time; `Promise.all` starts both requests immediately so the total time is just the slower of the two.

3. **Why doesn't calling the same shared fetch function from two different components cause two network requests?**
   Next.js automatically deduplicates `fetch()` calls with identical URLs and options within a single render pass (Request Memoization), so multiple components can safely call the same data-fetching function without duplicating work.

---

**السابق:** [القسم 8 — الأصول والصور والبيانات الوصفية](../Section%2008%20-%20Assets%20Images%20and%20Metadata/README.md)
**التالي:** [القسم 10 — التخزين المؤقت وإعادة التحقق (Caching and Revalidation)](../Section%2010%20-%20Caching%20and%20Revalidation/README.md)
