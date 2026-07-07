# القسم 15: Middleware و Proxy

> **دورة Next.js** — القسم 15 من 25 · المستوى: متقدم

الكود الذي يحتاج إلى العمل **قبل** اكتمال الطلب — من أجل حماية المسارات، أو إعادة التوجيه، أو التسجيل (logging) — يعيش في ملف واحد عند جذر المشروع. في الإصدار الحالي من Next.js، يُسمى هذا الملف **`proxy.ts`**، ليحل محل `middleware.ts` القديم.

📁 **الكود الخاص بهذا القسم:** راجع مجلد [`examples/`](./examples).

---

## جدول المحتويات

1. [ما هو Middleware/Proxy؟](#1-what-is-middlewareproxy)
2. [إنشاء منطق Proxy](#2-creating-proxy-logic)
3. [مطابقة المسارات](#3-matching-routes)
4. [حماية المسارات](#4-protecting-routes)
5. [إعادة توجيه المستخدمين](#5-redirecting-users)
6. [قراءة الكوكيز](#6-reading-cookies)
7. [مثال على Proxy للمصادقة](#7-authentication-proxy-example)
8. [الترحيل من middleware.ts](#8-migrating-from-middlewarets)
9. [أفضل ممارسات Middleware/Proxy](#9-middlewareproxy-best-practices)

---

## 1. ما هو Middleware/Proxy؟

### الحل

يُصدّر ملف `proxy.ts` عند جذر المشروع دالة تعمل قبل وصول الطلبات المتطابقة إلى مساراتك — يمكنها فحص الطلب، أو إعادة كتابته، أو إعادة توجيهه، أو حظره بالكامل.

> 💡 **نصيحة:** إذا كنت قد رأيت `middleware.ts` في دروس تعليمية أقدم، فهو نفس المفهوم — أعاد الإصدار الحالي من Next.js تسمية الملف (والدالة المُصدَّرة) إلى `proxy.ts`/`proxy` من أجل الوضوح.

---

## 2. إنشاء منطق Proxy

راجع [`examples/01-basic-proxy.ts`](./examples/01-basic-proxy.ts).

### الحل

```ts
// proxy.ts — project root, sibling of app/
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  console.log(`Incoming request: ${request.nextUrl.pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

---

## 3. مطابقة المسارات

راجع [`examples/02-matcher-config.ts`](./examples/02-matcher-config.ts).

### المشكلة

تشغيل منطق proxy على كل طلب — بما في ذلك الأصول الثابتة (static assets) — يهدر العمل ويمكن أن يبطئ الصفحات غير ذات الصلة.

### الحل

يحدد إعداد `matcher` نطاق المسارات التي تُفعّل الـ proxy:

```ts
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
```

---

## 4. حماية المسارات

### الحل

تحقق من وجود كوكي/رمز جلسة صالح في أعلى دالة الـ proxy قبل السماح بمرور الطلب — راجع المثال الكامل أدناه.

---

## 5. إعادة توجيه المستخدمين

### الحل

أرجع استجابة إعادة توجيه لإرسال المستخدمين غير المصادق عليهم إلى مكان آخر:

```ts
return NextResponse.redirect(new URL("/login", request.url));
```

---

## 6. قراءة الكوكيز

### الحل

يقرأ `request.cookies.get("name")?.value` كوكي مباشرة من الطلب الوارد داخل الـ proxy — دون الحاجة إلى واجهة `cookies()` غير المتزامنة هنا، لأن الـ proxy لديه بالفعل كائن الطلب الخام.

---

## 7. مثال على Proxy للمصادقة

راجع [`examples/03-auth-proxy.ts`](./examples/03-auth-proxy.ts).

### الحل

مثال كامل يحمي `/dashboard` خلف جلسة صالحة:

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.SESSION_SECRET);

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("session")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", request.url));

  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = { matcher: ["/dashboard/:path*"] };
```

---

## 8. الترحيل من middleware.ts

راجع [`examples/04-migrating-from-middleware.txt`](./examples/04-migrating-from-middleware.txt).

### الحل

1. أعد تسمية `middleware.ts` إلى `proxy.ts`
2. أعد تسمية الدالة المُصدَّرة `middleware` إلى `proxy`
3. كل شيء آخر (`NextResponse` و `NextRequest` وإعداد `matcher` والوصول إلى الكوكيز) يبقى مطابقًا تمامًا

> ⚠️ **تحذير:** إذا كنت تتبع درسًا تعليميًا أقدم أو تعمل في مشروع لا يزال على إصدار سابق من Next.js، فقد يظل `middleware.ts` هو المتوقع — تحقق من إصدار Next.js لديك قبل افتراض أن `proxy.ts` ينطبق.

---

## 9. أفضل ممارسات Middleware/Proxy

- أبقِ منطق الـ proxy **خفيفًا وسريعًا** — فهو يعمل على كل طلب متطابق، لذا فإن العمل المكلف هنا يضيف زمن استجابة (latency) للتطبيق بأكمله
- حدد نطاق `matcher` بأضيق ما يمكن؛ لا تُشغّل فحوصات المصادقة ضد الأصول الثابتة أو مسارات API التي لا تحتاجها
- اتخذ *قرار* التفويض الفعلي هنا (إعادة توجيه أو سماح)، لكن احتفظ بمنطق الجلسة/الدور التفصيلي في أدوات الجلسة الخاصة بك، دون تكراره ضمنيًا

---

## ✅ ملخص القسم

- يعمل `proxy.ts` (المعروف سابقًا باسم `middleware.ts`) قبل اكتمال الطلبات المتطابقة
- يتحكم إعداد `matcher` في المسارات التي تُفعّله — أبقه ضيقًا قدر الإمكان
- استخدمه للتحقق من الكوكيز/الرموز وإعادة توجيه المستخدمين غير المصادق عليهم قبل عرض أي مسار محمي
- الترحيل من `middleware.ts` هو مجرد إعادة تسمية للملف والدالة المُصدَّرة — سطح الواجهة (API surface) دون تغيير

---

## Review Questions

1. **Why should proxy logic be kept as lightweight as possible?**
   Because it runs on every request matching its `matcher` config, adding latency to every one of those requests — slow logic here (like an unindexed database call) degrades performance across the whole matched section of the app.

2. **What's the practical difference between renaming `middleware.ts` to `proxy.ts`?**
   None functionally — it's the same mechanism with a clearer name and a renamed exported function (`proxy` instead of `middleware`); the `NextRequest`/`NextResponse` APIs and `matcher` config work identically.

---

**السابق:** [القسم 14 — المصادقة](../Section%2014%20-%20Authentication/README.md)
**التالي:** [القسم 16 — تكامل قاعدة البيانات](../Section%2016%20-%20Database%20Integration/README.md)
