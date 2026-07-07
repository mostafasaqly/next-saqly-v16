# القسم 14: المصادقة

> **دورة Next.js** — القسم 14 من 25 · المستوى: متقدم

تُبنى المصادقة في App Router من عدة أجزاء قابلة للتركيب: تجزئة كلمة المرور (password hashing)، ورمز جلسة (session) موقّع مخزّن في كوكي HTTP-only، وفحوصات على جانب الخادم قبل عرض المحتوى المحمي.

📁 **الكود الخاص بهذا القسم:** راجع مجلد [`examples/`](./examples).

---

## جدول المحتويات

1. [نظرة عامة على تدفق المصادقة](#1-authentication-flow-overview)
2. [صفحة تسجيل الدخول](#2-login-page)
3. [صفحة التسجيل](#3-register-page)
4. [التحقق من صحة كلمة المرور](#4-password-validation)
5. [نظرة عامة على الجلسات](#5-sessions-overview)
6. [نظرة عامة على JWT](#6-jwt-overview)
7. [الكوكيز في Next.js](#7-cookies-in-nextjs)
8. [Middleware للمسارات المحمية](#8-middleware-for-protected-routes)
9. [الوصول القائم على الأدوار](#9-role-based-access)
10. [تسجيل الخروج](#10-logout)
11. [أفضل ممارسات المصادقة](#11-authentication-best-practices)

---

## 1. نظرة عامة على تدفق المصادقة

### الحل

التدفق النموذجي: يُرسل المستخدم بيانات الاعتماد ← يتحقق الخادم منها ← يُصدر الخادم جلسة (كوكي أو رمز) ← يُتحقق من الطلبات اللاحقة مقابل تلك الجلسة ← تُعيد المسارات المحمية توجيه المستخدمين غير المصادق عليهم إلى صفحة تسجيل الدخول.

---

## 2. صفحة تسجيل الدخول

راجع [`examples/02-login-action-with-session.ts`](./examples/02-login-action-with-session.ts).

### الحل

يُرسل نموذج إلى Server Action يتحقق من بيانات الاعتماد ويُصدر كوكي جلسة — راجع الكود للاطلاع على التدفق الكامل، المشروح مع الجلسات أدناه.

---

## 3. صفحة التسجيل

راجع [`examples/01-register-action.ts`](./examples/01-register-action.ts).

### الحل

اجمع وتحقق من صحة بيانات المستخدم الجديد باستخدام Zod، وتحقق من وجود حساب سابق، ثم أنشئ السجل بكلمة مرور مُجزّأة (hashed):

```ts
"use server";
import bcrypt from "bcrypt";
import { z } from "zod";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function register(prevState: unknown, formData: FormData) {
  const parsed = RegisterSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: { email: ["Email already in use"] } };

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await db.user.create({ data: { email: parsed.data.email, passwordHash } });
  return { success: true };
}
```

---

## 4. التحقق من صحة كلمة المرور

### الحل

فرض حد أدنى من الطول/التعقيد باستخدام Zod، و**قم دائمًا بالتجزئة (hash)** قبل التخزين — لا تخزّن أبدًا كلمات المرور كنص عادي (plaintext):

```ts
const passwordHash = await bcrypt.hash(password, 10);
```

> ⚠️ **تحذير:** تخزين كلمات المرور كنص عادي، حتى بشكل مؤقت في السجلات أو رسائل الخطأ، يُعد فشلاً أمنيًا حرجًا. قم بالتجزئة فورًا ولا تُسجّل أبدًا قيمة كلمة المرور الخام في السجلات.

---

## 5. نظرة عامة على الجلسات

### الحل

تخزّن الجلسة المُدارة من الخادم حالة المستخدم (من هو المسجّل دخوله) ويُشار إليها بواسطة معرّف يحتفظ به العميل — في هذه الدورة، هذا المعرّف هو JWT موقّع مخزّن في كوكي HTTP-only.

---

## 6. نظرة عامة على JWT

راجع [`examples/02-login-action-with-session.ts`](./examples/02-login-action-with-session.ts).

### الحل

يُرمّز JWT مطالبات (claims) (مثل `userId` و `role`) ويُوقَّع بشكل تشفيري، بحيث يمكن التحقق منه دون مخزن جلسة على جانب الخادم:

```ts
import { SignJWT } from "jose";

const token = await new SignJWT({ userId: user.id, role: user.role })
  .setProtectedHeader({ alg: "HS256" })
  .setExpirationTime("7d")
  .sign(secret);
```

---

## 7. الكوكيز في Next.js

راجع [`examples/02-login-action-with-session.ts`](./examples/02-login-action-with-session.ts) و [`examples/03-read-session-server-component.tsx`](./examples/03-read-session-server-component.tsx).

### الحل

تقرأ وتكتب واجهة `cookies()` (غير متزامنة في الإصدار الحالي من Next.js) الكوكيز من Server Components و Server Actions و Route Handlers:

```ts
import { cookies } from "next/headers";

const cookieStore = await cookies();
cookieStore.set("session", token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
```

قراءتها لاحقًا لتحديد المستخدم الحالي:

```ts
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { userId: string; role: string };
  } catch {
    return null;
  }
}
```

> ⚠️ **تحذير:** يمكن لـ Server Components *قراءة* الكوكيز فقط، وليس تعيينها — يجب أن تحدث عمليات كتابة الكوكيز في Server Action أو Route Handler.

---

## 8. Middleware للمسارات المحمية

### الحل

قم بحماية المسارات المصادق عليها قبل عرضها — راجع [القسم 15 (Middleware and Proxy)](../Section%2015%20-%20Middleware%20and%20Proxy/README.md) للاطلاع على النمط الكامل باستخدام `proxy.ts`، أو تحقق من الجلسة مباشرة في أعلى الصفحة كما هو موضح لاحقًا.

---

## 9. الوصول القائم على الأدوار

راجع [`examples/04-role-based-access.tsx`](./examples/04-role-based-access.tsx).

### الحل

قيّد مسارًا أو جزءًا من واجهة المستخدم بناءً على الدور المخزّن في الجلسة:

```tsx
export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/dashboard");
  return <h1>Admin Panel</h1>;
}
```

---

## 10. تسجيل الخروج

راجع [`examples/05-logout-action.ts`](./examples/05-logout-action.ts).

### الحل

احذف كوكي الجلسة وأعد التوجيه:

```ts
"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/login");
}
```

---

## 11. أفضل ممارسات المصادقة

- خزّن دائمًا رموز الجلسة في كوكيز **HTTP-only** — غير قابلة للوصول من JavaScript على جانب العميل، مما يخفف من سرقة الرمز عبر XSS
- اضبط `secure: true` بحيث تُرسل الكوكيز فقط عبر HTTPS
- جزّئ كلمات المرور باستخدام bcrypt (أو argon2)؛ لا تخزّن أو تُسجّل أبدًا نصًا عاديًا
- تحقق من بيانات الاعتماد والجلسات **على الخادم** — لا تثق أبدًا في دور أو معرّف مستخدم مُرسل من العميل
- امنح رموز JWT مدة صلاحية معقولة وأعد إصدارها بدلاً من استخدام رموز لا تنتهي صلاحيتها أبدًا

> 💡 **نصيحة:** عامل كوكي الجلسة تمامًا مثل كلمة المرور — أي شخص يحصل عليها يمكنه انتحال شخصية ذلك المستخدم حتى تنتهي صلاحيتها أو يتم إبطالها.

---

## ✅ ملخص القسم

- تدفق المصادقة: تحقق من بيانات الاعتماد ← إصدار جلسة ← فحص الجلسة على المسارات المحمية
- تُجزَّأ كلمات المرور باستخدام bcrypt قبل التخزين، ولا تُخزَّن أبدًا كنص عادي
- تستخدم الجلسات هنا JWT موقّعًا مخزّنًا في كوكي HTTP-only وآمن
- الواجهة `cookies()` غير متزامنة — يمكن لـ Server Components قراءتها، لكن فقط Server Actions/Route Handlers يمكنها كتابتها
- الوصول القائم على الأدوار هو مجرد فحص على جانب الخادم مقابل حمولة الجلسة قبل العرض

---

## Review Questions

1. **Why is `httpOnly: true` important for a session cookie?**
   It prevents the cookie from being read by client-side JavaScript, so even if an attacker injects a script via XSS, they can't steal the session token directly from `document.cookie`.

2. **Why can Server Components read cookies but not set them?**
   Setting a cookie requires sending a `Set-Cookie` HTTP header, which must happen as part of a response being constructed — Server Actions and Route Handlers control that response directly, while Server Components only produce rendered output within an already-in-flight response.

3. **Why hash passwords instead of encrypting them?**
   Hashing is one-way — even if the database is compromised, the original password can't be recovered from the hash. Encryption is reversible and would let anyone with the decryption key read the real passwords, which is never necessary for authentication.

---

**السابق:** [القسم 13 — معالجة الأخطاء](../Section%2013%20-%20Error%20Handling/README.md)
**التالي:** [القسم 15 — Middleware و Proxy](../Section%2015%20-%20Middleware%20and%20Proxy/README.md)
