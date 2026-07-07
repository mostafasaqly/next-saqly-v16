# القسم 16: تكامل قواعد البيانات

> **دورة Next.js** — القسم 16 من 25 · المستوى: متقدم

نظرًا لأن Server Components و Server Actions تعمل على الخادم، يمكنها التواصل مباشرة مع قاعدة البيانات — دون الحاجة إلى خدمة خلفية منفصلة. يستخدم هذا القسم **Prisma**، وهو ORM آمن من ناحية الأنواع (type-safe)، كمثال طوال الوقت.

📁 **كود هذا القسم:** انظر مجلد [`examples/`](./examples).

---

## جدول المحتويات

1. [نظرة عامة على تكامل قواعد البيانات](#1-database-integration-overview)
2. [اختيار قاعدة البيانات](#2-choosing-a-database)
3. [نظرة عامة على Prisma](#3-prisma-overview)
4. [تثبيت Prisma](#4-installing-prisma)
5. [إنشاء نموذج بيانات](#5-creating-a-data-model)
6. [تشغيل عمليات الترحيل (Migrations)](#6-running-migrations)
7. [قراءة البيانات من قاعدة البيانات](#7-reading-data-from-database)
8. [إنشاء البيانات](#8-creating-data)
9. [تحديث البيانات](#9-updating-data)
10. [حذف البيانات](#10-deleting-data)
11. [أفضل ممارسات قواعد البيانات](#11-database-best-practices)

---

## 1. نظرة عامة على تكامل قواعد البيانات

### الحل

تُنفَّذ Server Components و Server Actions في بيئة خادم موثوقة، لذا يمكنها استيراد عميل قاعدة بيانات والاستعلام منه مباشرة — بنفس الطريقة التي يعمل بها متحكم (controller) خلفي تقليدي.

---

## 2. اختيار قاعدة البيانات

### الحل

- **العلائقية (Postgres، MySQL)** — الخيار الافتراضي الأفضل لمعظم التطبيقات: اتساق قوي، علاقات، وأدوات ناضجة
- **NoSQL (مثل MongoDB وغيرها)** — تناسب أكثر أشكال المستندات المرنة/المتداخلة أو معدلات الكتابة العالية جدًا مع متطلبات اتساق أقل صرامة

تستخدم هذه الدورة **Postgres** مع Prisma طوال الوقت.

---

## 3. نظرة عامة على Prisma

### الحل

Prisma هو ORM آمن من ناحية الأنواع: تُعرّف مخططك (schema) مرة واحدة، وتُولّد Prisma عميلًا مكتوب النوع بالكامل — إكمال تلقائي وأخطاء وقت الترجمة (compile-time) لكل استعلام.

---

## 4. تثبيت Prisma

### الحل

```bash
npm install prisma @prisma/client
npx prisma init
```

هذا ينشئ ملف `prisma/schema.prisma` وملف `.env` يحتوي على عنصر نائب لـ `DATABASE_URL`.

---

## 5. إنشاء نموذج بيانات

انظر [`examples/01-prisma-schema.prisma`](./examples/01-prisma-schema.prisma).

### الحل

```prisma
model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  createdAt DateTime @default(now())
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
}

model User {
  id    String @id @default(cuid())
  email String @unique
  posts Post[]
}
```

---

## 6. تشغيل عمليات الترحيل (Migrations)

### الحل

```bash
npx prisma migrate dev --name init
```

هذا يُطبّق المخطط على قاعدة بياناتك ويُولّد العميل المكتوب النوع.

---

## 7. قراءة البيانات من قاعدة البيانات

انظر [`examples/02-prisma-client-singleton.ts`](./examples/02-prisma-client-singleton.ts) و[`examples/03-read-in-server-component.tsx`](./examples/03-read-in-server-component.tsx).

### الحل

استعلم مباشرة داخل Server Component باستخدام العميل المُولَّد:

```tsx
import { db } from "@/lib/db";

export default async function PostsPage() {
  const posts = await db.post.findMany({ include: { author: true }, orderBy: { createdAt: "desc" } });
  return <ul>{posts.map((post) => <li key={post.id}>{post.title} — by {post.author.email}</li>)}</ul>;
}
```

---

## 8. إنشاء البيانات

انظر [`examples/04-create-update-delete.ts`](./examples/04-create-update-delete.ts).

### الحل

```ts
"use server";
export async function createPost(authorId: string, formData: FormData) {
  await db.post.create({ data: { title: formData.get("title") as string, authorId } });
  revalidatePath("/posts");
}
```

---

## 9. تحديث البيانات

### الحل

```ts
export async function updatePost(id: string, formData: FormData) {
  await db.post.update({ where: { id }, data: { title: formData.get("title") as string } });
  revalidatePath("/posts");
}
```

---

## 10. حذف البيانات

### الحل

```ts
export async function deletePost(id: string) {
  await db.post.delete({ where: { id } });
  revalidatePath("/posts");
}
```

---

## 11. أفضل ممارسات قواعد البيانات

انظر [`examples/02-prisma-client-singleton.ts`](./examples/02-prisma-client-singleton.ts) و[`examples/05-avoid-n-plus-1.ts`](./examples/05-avoid-n-plus-1.ts).

### حافظ على عميل Prisma كنسخة وحيدة (singleton)

إنشاء `PrismaClient` جديد في كل عملية إعادة تحميل ساخن (hot-reload) أثناء التطوير يستنفد اتصالات قاعدة البيانات بسرعة:

```ts
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const db = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

### تجنب استعلامات N+1

```ts
// ❌ استعلام واحد لكل منشور، داخل حلقة
for (const post of posts) {
  const author = await db.user.findUnique({ where: { id: post.authorId } });
}

// ✅ جلب البيانات المرتبطة في استعلام واحد
const postsWithAuthors = await db.post.findMany({ include: { author: true } });
```

### تحقق من صحة المدخلات قبل الكتابة

لا تمرر أبدًا قيم `formData` الخام مباشرة إلى عملية كتابة في قاعدة البيانات — تحقق منها أولًا باستخدام Zod (انظر [القسم 11](../Section%2011%20-%20Forms%20and%20Server%20Actions/README.md#5-form-validation)).

> ⚠️ **تحذير:** تحمي Prisma من حقن SQL (SQL injection) عبر معاملة الاستعلامات (parameterizing) تلقائيًا — لكن هذه الحماية تغطي فقط واجهة استعلام Prisma الخاصة بها. إذا لجأت في أي وقت إلى SQL خام (`$queryRawUnsafe`)، فأنت المسؤول عن التعقيم بنفسك.

---

## ✅ ملخص القسم

- يمكن لـ Server Components/Actions الاستعلام مباشرة من قاعدة البيانات — دون الحاجة إلى طبقة API منفصلة
- توفر Prisma عميلًا آمنًا من ناحية الأنواع ويدعم الإكمال التلقائي، يُولَّد من ملف مخطط
- `prisma migrate dev` يُطبّق تغييرات المخطط؛ يوفر العميل المُولَّد `.findMany`، `.create`، `.update`، `.delete`، وغيرها
- حافظ على عميل Prisma كنسخة وحيدة (singleton) على مستوى الوحدة (module) لتجنب استنفاد الاتصالات أثناء التطوير
- استخدم `include` لجلب العلاقات في استعلام واحد بدلاً من التكرار والاستعلام لكل صف (مشكلة N+1)

---

## Review Questions

1. **Why is a Prisma client singleton necessary in development but less of a concern in production?**
   Next.js hot-reloading in development re-executes modules on every file change, which would create a new `PrismaClient` (and new database connections) each time without a singleton guard — production builds don't hot-reload, so this specific issue doesn't occur there, though a singleton is still good practice.

2. **What is the N+1 query problem, and how does `include` solve it?**
   It's when fetching a list triggers one additional query per item to get related data (e.g., one query per post to fetch its author), multiplying database round trips. `include` tells Prisma to fetch the related data as part of the original query, reducing N+1 queries to just one.

---

**السابق:** [القسم 15 — Middleware and Proxy](../Section%2015%20-%20Middleware%20and%20Proxy/README.md)
**التالي:** [القسم 17 — State Management](../Section%2017%20-%20State%20Management/README.md)
