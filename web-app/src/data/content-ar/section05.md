# القسم 5: التنقل والتوجيه

> **كورس Next.js** — القسم 5 من 25 · المستوى: متوسط

بعد إرساء التوجيه القائم على الملفات، يغطي هذا القسم كيف ينتقل المستخدمون فعلياً بين المسارات: مكون `Link`، التنقل البرمجي، الأجزاء الديناميكية (dynamic segments)، معاملات البحث (search params)، وإعادة التوجيه.

📁 **كود هذا القسم:** انظر مجلد [`examples/`](./examples).

---

## جدول المحتويات

1. [مكون Link](#1-مكون-link)
2. [التنقل البرمجي](#2-التنقل-البرمجي)
3. [useRouter](#3-userouter)
4. [الروابط النشطة](#4-الروابط-النشطة)
5. [المسارات الديناميكية](#5-المسارات-الديناميكية)
6. [معاملات المسار](#6-معاملات-المسار)
7. [معاملات البحث](#7-معاملات-البحث)
8. [المسارات الاختيارية](#8-المسارات-الاختيارية)
9. [مسارات التقاط كل شيء (Catch-All)](#9-مسارات-التقاط-كل-شيء-catch-all)
10. [إعادة التوجيه](#10-إعادة-التوجيه)

---

## 1. مكون Link

انظر [`examples/01-link-component.tsx`](./examples/01-link-component.tsx).

### المشكلة

وسم `<a>` العادي يتسبب في إعادة تحميل كاملة للصفحة، متجاهلاً كل حالة العميل (client-side state) ومعيداً تنزيل المستند بأكمله.

### الحل

مكون `Link` من `next/link` يقوم بالتنقل من جانب العميل ويجلب مسبقاً (prefetch) تلقائياً المسارات المرتبطة عندما تدخل نطاق الرؤية، بحيث تبدو النقرات فورية:

```tsx
import Link from "next/link";

export default function NavBar() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
    </nav>
  );
}
```

> ⚠️ **تحذير:** استخدم `<Link>` للتنقل الداخلي. وسم `<a>` العادي لا يزال صحيحاً للروابط الخارجية.

---

## 2. التنقل البرمجي

### المشكلة

أحياناً ينبغي أن يحدث التنقل *كنتيجة* لإجراء (إرسال نموذج، نقرة زر) بدلاً من نقر المستخدم على رابط مباشرة.

### الحل

شغّل التنقل من داخل معالج حدث (event handler) أو تأثير (effect) باستخدام واجهة برمجة الموجّه (router API) الموضحة لاحقاً.

---

## 3. useRouter

انظر [`examples/02-use-router.tsx`](./examples/02-use-router.tsx).

### الحل

يمنحك `useRouter` (خاص بـ Client Component فقط) الدوال `push`، `replace`، `back`، `forward`، و`refresh`:

```tsx
"use client";
import { useRouter } from "next/navigation";

export default function SaveButton() {
  const router = useRouter();

  async function handleSave() {
    await fetch("/api/save", { method: "POST" });
    router.push("/dashboard");
    router.refresh(); // re-fetches server data for the current route
  }

  return <button onClick={handleSave}>Save</button>;
}
```

> 💡 **نصيحة:** تُعيد `router.refresh()` تشغيل Server Components للمسار الحالي دون إعادة تحميل كاملة للصفحة — مفيدة مباشرة بعد إجراء تعديل (mutation).

---

## 4. الروابط النشطة

انظر [`examples/03-active-link.tsx`](./examples/03-active-link.tsx).

### الحل

تُعيد `usePathname()` المسار الحالي حتى تتمكن من مقارنته مع `href` الرابط وتطبيق تنسيق النشاط (active styling):

```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <Link href={href} className={pathname === href ? "nav-link nav-link--active" : "nav-link"}>
      {children}
    </Link>
  );
}
```

---

## 5. المسارات الديناميكية

### المشكلة

لا يمكنك إنشاء مجلد لكل تدوينة أو منتج — مجموعة الروابط (URLs) تُحدَّد بالبيانات وليست ثابتة وقت البناء.

### الحل

أسماء المجلدات الموضوعة بين أقواس مثل `[slug]` تلتقط ذلك الجزء من الرابط كمعامل (parameter):

```text
app/blog/[slug]/page.tsx   →  /blog/hello-world  (slug = "hello-world")
```

---

## 6. معاملات المسار

انظر [`examples/04-dynamic-route.tsx`](./examples/04-dynamic-route.tsx).

### المشكلة

مرّرت إصدارات Next.js القديمة `params` ككائن عادي — الإصدارات الحالية غيّرت هذا.

### الحل

في Next.js الحالي، **`params` هو Promise** ويجب انتظاره (await) قبل الاستخدام:

```tsx
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <h1>Post: {slug}</h1>;
}
```

> ⚠️ **تحذير:** نسيان `await params` (أو `searchParams`) هو الخطأ الأكثر شيوعاً عند الترقية من كود Next.js قديم — سيُنبّهك TypeScript لذلك لأن النوع هو `Promise`.

---

## 7. معاملات البحث

انظر [`examples/05-search-params.tsx`](./examples/05-search-params.tsx) و[`examples/06-use-search-params-client.tsx`](./examples/06-use-search-params-client.tsx).

### الحل

على الخادم، `searchParams` هو أيضاً خاصية غير متزامنة (async):

```tsx
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const { category, page = "1" } = await searchParams;
  return <p>Category: {category ?? "all"} — Page: {page}</p>;
}
```

على العميل، استخدم الـ hook باسم `useSearchParams`، عادة مقترناً مع `useRouter`/`usePathname` لتحديث الرابط:

```tsx
"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export default function SearchBox() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(term: string) {
    const params = new URLSearchParams(searchParams);
    if (term) params.set("q", term); else params.delete("q");
    router.push(`${pathname}?${params.toString()}`);
  }

  return <input defaultValue={searchParams.get("q") ?? ""} onChange={(e) => handleChange(e.target.value)} />;
}
```

> 💡 **نصيحة:** تخزين حالة الفلترة/التبويب في الرابط (URL) (بدلاً من `useState`) يجعلها قابلة للمشاركة والحفظ كإشارة مرجعية (bookmark) مجاناً.

---

## 8. المسارات الاختيارية

انظر [`examples/07-catch-all-routes.txt`](./examples/07-catch-all-routes.txt).

### الحل

صيغة القوسين المزدوجين `[[...slug]]` تجعل جزء التقاط كل شيء (catch-all) اختيارياً، بحيث يتطابق المسار الأب نفسه أيضاً:

```text
app/docs/[[...slug]]/page.tsx
  matches: /docs, /docs/a, /docs/a/b
```

---

## 9. مسارات التقاط كل شيء (Catch-All)

### الحل

القوس المفرد `[...slug]` يطابق جزءاً واحداً أو أكثر من الأجزاء المتداخلة (لكن ليس المسار الأب المجرد):

```text
app/docs/[...slug]/page.tsx
  matches: /docs/a, /docs/a/b   (NOT /docs itself)
  params.slug: ["a", "b"]
```

---

## 10. إعادة التوجيه

انظر [`examples/08-redirects.tsx`](./examples/08-redirects.tsx).

### الحل

استخدم دالة `redirect()` لإعادة التوجيه الشرطية المُوجَّهة بالكود:

```tsx
import { redirect } from "next/navigation";

export default function OldPathPage() {
  redirect("/new-path");
}
```

أو أعدّ إعادة توجيه ثابتة في `next.config.ts` عندما يكون الربط ثابتاً ومعروفاً مسبقاً:

```ts
const nextConfig = {
  async redirects() {
    return [{ source: "/old-blog/:slug", destination: "/blog/:slug", permanent: true }];
  },
};
```

> ⚠️ **تحذير:** تُصدر `redirect()` استثناءً (throw) داخلياً لإيقاف العرض — لا تُغلّفها في `try/catch` يبتلع الاستثناء، وإلا فلن تحدث إعادة التوجيه.

---

## ✅ ملخص القسم

- استخدم `<Link>` للتنقل من جانب العميل مع الجلب المسبق (prefetching) التلقائي
- يمنحك `useRouter` تنقلاً برمجياً عبر `push`/`replace`/`refresh`؛ ويكتشف `usePathname` المسار النشط
- `params` و`searchParams` هما **غير متزامنين (async)** في Next.js الحالي — انتظرهما (await) دائماً
- `[slug]` = جزء ديناميكي، `[...slug]` = التقاط كل شيء، `[[...slug]]` = التقاط كل شيء اختياري
- استخدم `redirect()` لإعادة التوجيه الشرطية، وإعادة توجيه `next.config` للربط الثابت

---

## Review Questions

1. **Why must `params` be awaited in current Next.js instead of accessed directly?**
   Next.js changed route parameter APIs to be asynchronous so the framework can defer resolving them until actually needed, which enables more flexible rendering/caching behavior — TypeScript enforces this by typing `params` as a `Promise`.

2. **When would you store UI state in the URL via search params instead of `useState`?**
   When that state should be shareable or bookmarkable — like active filters, the selected tab, or a search query — since URL state survives page reloads and can be copy-pasted to someone else.

3. **What's the difference between `[...slug]` and `[[...slug]]`?**
   `[...slug]` is a required catch-all that needs at least one segment after the parent path; `[[...slug]]` is optional, so the parent path alone also matches, with `slug` being `undefined` in that case.

---

**السابق:** [القسم 4 — أساسيات App Router](../Section%2004%20-%20App%20Router%20Basics/README.md)
**التالي:** [القسم 6 — Server Components و Client Components](../Section%2006%20-%20Server%20Components%20and%20Client%20Components/README.md)
