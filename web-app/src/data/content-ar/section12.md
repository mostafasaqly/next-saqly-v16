# القسم 12: معالجات المسارات وواجهات البرمجة

> **دورة Next.js** — القسم 12 من 25 · المستوى: متوسط

توفر لك Route Handlers واجهة HTTP API حقيقية داخل App Router — مفيدة للـ webhooks ونقاط النهاية العامة، على عكس Server Actions المخصصة لتعديلات النماذج الداخلية.

📁 **الكود الخاص بهذا القسم:** راجع مجلد [`examples/`](./examples).

---

## جدول المحتويات

1. [ما هي Route Handlers؟](#1-what-are-route-handlers)
2. [إنشاء مسارات API في App Router](#2-creating-api-routes-in-app-router)
3. [معالج GET](#3-get-route-handler)
4. [معالج POST](#4-post-route-handler)
5. [معالجات PUT و PATCH](#5-put-and-patch-route-handlers)
6. [معالج DELETE](#6-delete-route-handler)
7. [قراءة جسم الطلب](#7-reading-request-body)
8. [إرجاع استجابات JSON](#8-returning-json-responses)
9. [التعامل مع الأخطاء](#9-handling-errors)
10. [متى تستخدم Route Handlers مقابل Server Actions](#10-when-to-use-route-handlers-vs-server-actions)

---

## 1. ما هي Route Handlers؟

### الحل

يُعرّف ملف `route.ts` داخل `app/` نقطة نهاية API مخصصة باستخدام واجهات Web القياسية `Request`/`Response` — دون الحاجة إلى إطار عمل خادم منفصل.

---

## 2. إنشاء مسارات API في App Router

### الحل

أضف `route.ts` إلى أي مجلد ضمن `app/` لكشف نقطة نهاية عند ذلك المسار:

```text
app/api/posts/route.ts   →  /api/posts
```

> ⚠️ **تحذير:** لا يمكن لمجلد أن يحتوي على كل من `page.tsx` و `route.ts` في نفس الجزء (segment) — اختر أحدهما لكل مسار.

---

## 3. معالج GET

راجع [`examples/01-get-route.ts`](./examples/01-get-route.ts).

### الحل

```ts
import { NextResponse } from "next/server";

export async function GET() {
  const posts = await db.post.findMany();
  return NextResponse.json(posts);
}
```

---

## 4. معالج POST

راجع [`examples/02-post-route.ts`](./examples/02-post-route.ts).

### الحل

```ts
export async function POST(request: Request) {
  const body = await request.json();
  if (!body.title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  const post = await db.post.create({ data: { title: body.title } });
  return NextResponse.json(post, { status: 201 });
}
```

---

## 5. معالجات PUT و PATCH

راجع [`examples/03-put-patch-delete.ts`](./examples/03-put-patch-delete.ts).

### الحل

يقوم `PUT` تقليديًا باستبدال المورد بأكمله؛ بينما يطبّق `PATCH` تحديثًا جزئيًا. كلاهما يستقبل معاملات الأجزاء الديناميكية (dynamic segment params) بنفس الطريقة (غير المتزامنة) التي تستقبلها الصفحات:

```ts
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const post = await db.post.update({ where: { id }, data: body });
  return NextResponse.json(post);
}
```

---

## 6. معالج DELETE

### الحل

```ts
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.post.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
```

---

## 7. قراءة جسم الطلب

### الحل

بالنسبة لحمولات JSON، استخدم `await request.json()`. بالنسبة لإرسال النماذج، استخدم `await request.formData()`.

---

## 8. إرجاع استجابات JSON

### الحل

يقوم `NextResponse.json(data, { status })` بضبط رأس `Content-Type` الصحيح ورمز الحالة في استدعاء واحد — دون الحاجة إلى ربط الرؤوس يدويًا.

---

## 9. التعامل مع الأخطاء

راجع [`examples/04-error-handling.ts`](./examples/04-error-handling.ts).

### الحل

قم بتغليف المنطق في try/catch وأرجع رمز حالة HTTP مناسبًا بدلاً من ترك الخطأ غير المُعالَج يظهر كخطأ 500 عام:

```ts
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const post = await db.post.findUniqueOrThrow({ where: { id } });
    return NextResponse.json(post);
  } catch {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
}
```

---

## 10. متى تستخدم Route Handlers مقابل Server Actions

### الحل

| | Route Handlers | Server Actions |
|---|---|---|
| الأفضل من أجل | واجهات API عامة، webhooks، تكاملات مع أطراف ثالثة | إرسال النماذج والتعديلات الداخلية |
| يُستدعى من | أي عميل HTTP (curl، خدمة أخرى، الواجهة الأمامية الخاصة بك) | مكوّنات React، مباشرة كخاصية `action` لنموذج |
| يُرجع | `Response` HTTP تُشكّلها بنفسك | أي شيء تُرجعه دالتك، ويتعامل معه React |

> 💡 **نصيحة:** إذا كان تطبيق جوال أو خدمة خارجية بحاجة إلى استدعاء الواجهة الخلفية لديك، استخدم Route Handler. أما إذا كان الأمر يقتصر على واجهة المستخدم الخاصة بك التي ترسل نموذجًا، فإن Server Action أبسط ويتطلب قدرًا أقل من الكود التمهيدي.

---

## ✅ ملخص القسم

- تُعرّف ملفات `route.ts` نقاط نهاية HTTP حقيقية باستخدام واجهات Web `Request`/`Response`
- صدّر دوال `GET` و `POST` و `PUT` و `PATCH` و `DELETE` حسب طريقة HTTP المطلوبة
- يُعد `NextResponse.json()` الطريقة القياسية لإرجاع استجابات API منظّمة
- غلّف منطق المعالج في try/catch وأرجع رموز حالة ذات معنى
- تناسب Route Handlers المستهلكين العامين/الخارجيين؛ بينما تناسب Server Actions تعديلات النماذج الداخلية

---

## Review Questions

1. **Why can't a folder have both `page.tsx` and `route.ts` for the same path segment?**
   Because both would try to define what happens when that exact path is requested — Next.js requires one or the other so there's no ambiguity about whether a request should render UI or return an API response.

2. **When would you choose a Route Handler over a Server Action for a mutation?**
   When the mutation needs to be callable from outside your own React UI — a mobile app, a third-party webhook, or another service — since Route Handlers expose a standard HTTP endpoint that any client can call, while Server Actions are invoked through React's own mechanisms.

---

**السابق:** [القسم 11 — النماذج و Server Actions](../Section%2011%20-%20Forms%20and%20Server%20Actions/README.md)
**التالي:** [القسم 13 — معالجة الأخطاء](../Section%2013%20-%20Error%20Handling/README.md)
