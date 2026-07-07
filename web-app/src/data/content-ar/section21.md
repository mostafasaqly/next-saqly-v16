# القسم 21: مشروع — تطبيق مدونة (Blog App)

> **دورة Next.js** — القسم 21 من 25 · مشروع تطبيقي 1 من 4

المشروع التطبيقي الأول: مدونة يتم توليدها بشكل ثابت (statically-generated) مع صفحة رئيسية تعرض قائمة المقالات وصفحات مستقلة لكل مقال، مع سحب المحتوى من headless CMS/REST API. يجمع هذا المشروع بين كل ما تعلمناه في الأقسام 3–10: التوجيه (routing)، التخطيطات (layouts)، مكونات الخادم (Server Components)، البيانات الوصفية (metadata)، والتخزين المؤقت (caching).

📁 **الكود الخاص بهذا القسم:** انظر مجلد [`examples/`](./examples).

---

## جدول المحتويات

1. [نظرة عامة على المشروع](#1-project-overview)
2. [إنشاء تخطيط التطبيق](#2-creating-the-app-layout)
3. [إنشاء صفحة قائمة المدونة](#3-creating-blog-list-page)
4. [إنشاء صفحة تفاصيل المدونة](#4-creating-blog-details-page)
5. [المسارات الديناميكية للمقالات](#5-dynamic-routes-for-posts)
6. [واجهات التحميل والخطأ](#6-loading-and-error-ui)
7. [إضافة البيانات الوصفية](#7-adding-metadata)
8. [جلب المقالات من الـ API](#8-fetching-posts-from-api)
9. [إنشاء مكونات قابلة لإعادة الاستخدام](#9-creating-reusable-components)
10. [إعادة الهيكلة النهائية](#10-final-refactoring)

---

## 1. نظرة عامة على المشروع

### ما الذي نبنيه

مدونة تحتوي على:

- صفحة رئيسية (`/`) تعرض جميع المقالات كبطاقات
- صفحة مقال ديناميكية (`/blog/[slug]`) يتم عرضها مسبقًا (pre-rendered) وقت البناء (build time)
- بيانات وصفية SEO لكل مقال ومعاينات Open Graph
- حالات تحميل وخطأ لصفحة المقال

---

## 2. إنشاء تخطيط التطبيق

انظر [`examples/01-app-layout.tsx`](./examples/01-app-layout.tsx).

### الحل

رأس وتذييل مشتركان عبر التخطيط الجذري (root layout)، بالإضافة إلى قالب `title` بحيث يحصل عنصر `<title>` في كل صفحة تلقائيًا على لاحقة ثابتة `" | My Blog"`:

```tsx
export const metadata = {
  title: { default: "My Blog", template: "%s | My Blog" },
  description: "A statically-generated blog built with Next.js.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header><h1>My Blog</h1></header>
        <main>{children}</main>
        <footer>© {new Date().getFullYear()} My Blog</footer>
      </body>
    </html>
  );
}
```

---

## 3. إنشاء صفحة قائمة المدونة

انظر [`examples/02-blog-list-page.tsx`](./examples/02-blog-list-page.tsx) و[`examples/03-post-card.tsx`](./examples/03-post-card.tsx).

### الحل

يقوم مكون خادم (Server Component) بجلب جميع المقالات وعرض شبكة من `PostCard`:

```tsx
export default async function HomePage() {
  const posts = await getAllPosts();
  return <div className="post-grid">{posts.map((post) => <PostCard key={post.slug} post={post} />)}</div>;
}
```

---

## 4. إنشاء صفحة تفاصيل المدونة

انظر [`examples/04-blog-detail-page.tsx`](./examples/04-blog-detail-page.tsx).

### الحل

مسار ديناميكي `[slug]` يقوم بجلب وعرض مقال واحد، مع استدعاء `notFound()` عندما لا يتطابق الـ slug مع أي شيء.

---

## 5. المسارات الديناميكية للمقالات

### المشكلة

عرض كل مقال عند الطلب (on-demand) وقت الطلب (request time) يعمل، لكنه يعيد تنفيذ نفس عملية العرض في كل زيارة لمحتوى نادرًا ما يتغير.

### الحل

تخبر `generateStaticParams` إطار Next.js بكل قيمة ممكنة لـ `slug` مسبقًا، بحيث يتم عرض جميع المقالات مسبقًا (pre-rendered) وقت البناء:

```tsx
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}
```

---

## 6. واجهات التحميل والخطأ

انظر [`examples/05-loading-error.tsx`](./examples/05-loading-error.tsx).

### الحل

`loading.tsx` و`error.tsx` لقطاع `blog/[slug]`، باتباع الأنماط من القسمين 9 و13.

---

## 7. إضافة البيانات الوصفية

### الحل

تقوم `generateMetadata` ببناء عنوان ووصف وصورة Open Graph خاصة بكل مقال — انظر الكود الكامل في [`examples/04-blog-detail-page.tsx`](./examples/04-blog-detail-page.tsx).

---

## 8. جلب المقالات من الـ API

انظر [`examples/06-lib-posts.ts`](./examples/06-lib-posts.ts).

### الحل

وحدة `lib/posts.ts` مشتركة تغلف استدعاءات CMS/API بنافذة إعادة تحقق (revalidation) منطقية:

```ts
export async function getAllPosts(): Promise<Post[]> {
  const res = await fetch("https://cms.example.com/api/posts", { next: { revalidate: 3600 } });
  return res.json();
}
```

---

## 9. إنشاء مكونات قابلة لإعادة الاستخدام

### الحل

يُستخدم `PostCard` (الموضح أعلاه) بنفس الشكل في الصفحة الرئيسية، ويمكن إعادة استخدامه في أي مكان آخر تكون فيه معاينة المقال مطلوبة — استخرج الواجهة المشتركة بمجرد استخدامها في أكثر من مكان واحد.

---

## 10. إعادة الهيكلة النهائية

### الحل

قم بالتنظيف عن طريق:

- نقل جميع منطق الجلب إلى `lib/posts.ts` (موضح أعلاه) بحيث تبقى الصفحات بسيطة
- استخراج أنواع TypeScript المشتركة (`Post`) إلى مكان واحد يتم استيراده من قبل كل من صفحة القائمة وصفحة التفاصيل
- التأكد من أن `generateStaticParams` يغطي كل مقال منشور، وأن المقالات الجديدة تُطلق عملية إعادة بناء (rebuild) أو إعادة تحقق عند الطلب (on-demand revalidation) عبر `revalidateTag`

---

## ✅ ملخص القسم

- التوليد الثابت (`generateStaticParams`) يعرض مسبقًا كل مقال في المدونة وقت البناء
- توفر `generateMetadata` لكل مقال بيانات SEO وOpen Graph دقيقة وفريدة
- يتعامل `loading.tsx`/`error.tsx` مع الحالات غير المتزامنة لجلب مقال واحد
- منطق الجلب المشترك موجود في وحدة `lib/posts.ts` واحدة، تُستخدم من قبل كل من صفحة القائمة والتفاصيل

---

## Review Questions

1. **Why use `generateStaticParams` for the blog post pages instead of rendering them dynamically on every request?**
   Because blog content changes infrequently compared to how often it's read — pre-rendering every post at build time serves cached static HTML instantly, while dynamic rendering would redo the same fetch and render work on every single visit for no benefit.

2. **What would happen if `generateMetadata` were omitted and only a static `metadata` object were used instead?**
   Every blog post would show the same generic title and description in search results and social previews, since a static `metadata` object has no access to the current post's data — defeating the purpose of per-post SEO.

---

**السابق:** [Section 20 — Deployment](../Section%2020%20-%20Deployment/README.md)
**التالي:** [Section 22 — Project: Dashboard App](../Section%2022%20-%20Project%20Dashboard%20App/README.md)
