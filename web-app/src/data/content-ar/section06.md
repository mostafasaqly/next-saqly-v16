# القسم 6: Server Components و Client Components

> **دورة Next.js** — القسم 6 من 25 · المستوى: متوسط

هذا هو أكبر تحول ذهني عند الانتقال من React العادية إلى Next.js. يحدد هذا القسم بدقة متى يعمل المكون على الخادم مقابل المتصفح، وقواعد الدمج بين الاثنين.

📁 **الكود الخاص بهذا القسم:** انظر مجلد [`examples/`](./examples).

---

## جدول المحتويات

1. [ما هي Server Components؟](#1-what-are-server-components)
2. [ما هي Client Components؟](#2-what-are-client-components)
3. [متى تستخدم Server Components](#3-when-to-use-server-components)
4. [متى تستخدم Client Components](#4-when-to-use-client-components)
5. [التوجيه "use client"](#5-the-use-client-directive)
6. [تمرير Props بين Server و Client Components](#6-passing-props-between-server-and-client-components)
7. [واجهات برمجة المتصفح (Browser APIs) في Client Components](#7-browser-apis-in-client-components)
8. [الأخطاء الشائعة في Server و Client Components](#8-common-server-and-client-component-mistakes)

---

## 1. ما هي Server Components؟

انظر [`examples/01-server-component.tsx`](./examples/01-server-component.tsx).

### الحل

تُعرض Server Components على الخادم — أثناء الطلب أو في وقت البناء (build time) — ولا تُرسل ملفات JavaScript الخاصة بها إلى المتصفح أبدًا. يمكن أن تكون `async` وتستعلم قاعدة بيانات أو تستدعي API يحتوي على أسرار مباشرة:

```tsx
import { db } from "@/lib/db";

export default async function PostsPage() {
  const posts = await db.post.findMany();
  return <ul>{posts.map((post) => <li key={post.id}>{post.title}</li>)}</ul>;
}
```

---

## 2. ما هي Client Components؟

انظر [`examples/02-client-component.tsx`](./examples/02-client-component.tsx).

### الحل

تتم عملية الـ hydration لمكونات Client Components وتعمل في المتصفح، لذا يمكنها الاحتفاظ بحالة (state)، والاستجابة للأحداث، واستخدام التأثيرات (effects):

```tsx
"use client";
import { useState } from "react";

export default function LikeButton({ initialLikes }: { initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes);
  return <button onClick={() => setLikes((n) => n + 1)}>❤️ {likes}</button>;
}
```

---

## 3. متى تستخدم Server Components

### الحل

اعتمد على Server Components افتراضيًا من أجل:

- جلب البيانات (لا حاجة إلى مؤشر تحميل (loading spinner) من جهة العميل عند العرض الأولي)
- الوصول إلى الأسرار، متغيرات البيئة، أو قاعدة بيانات مباشرة
- أي شيء لا يحتاج إلى تفاعلية — مما يقلل ما يُرسل إلى المتصفح

---

## 4. متى تستخدم Client Components

### الحل

الجأ إلى Client Component عندما تحتاج إلى:

- حالة محلية (`useState`, `useReducer`)
- معالجات أحداث (`onClick`, `onChange`, إلخ)
- واجهات برمجة خاصة بالمتصفح فقط (`window`, `localStorage`)
- خطافات (hooks) مخصصة تعتمد على أي مما سبق

---

## 5. التوجيه "use client"

### الحل

ضع `"use client"` كأول سطر في الملف لتحديد أن هذه الوحدة — وكل ما تستورده — جزء من حزمة العميل (client bundle):

```tsx
"use client";

export default function Toggle() {
  // ...
}
```

> ⚠️ **تحذير:** يحدد `"use client"` *حدًا (boundary)*، وليس مجرد مكون واحد. كل مكون يستورده هذا الملف يصبح أيضًا جزءًا من حزمة العميل، حتى لو لم تستخدم تلك الاستيرادات الحالة بنفسها.

---

## 6. تمرير Props بين Server و Client Components

انظر [`examples/03-passing-server-children-to-client.tsx`](./examples/03-passing-server-children-to-client.tsx) و [`examples/04-serializable-props.tsx`](./examples/04-serializable-props.tsx).

### المشكلة

غالبًا ما تحتاج إلى تفاعلية (نافذة منبثقة، مفتاح تبديل) لتغليف محتوى يحتاج بحد ذاته إلى جلب بيانات من جهة الخادم.

### الحل

يمكن لـ Server Component أن يعرض Client Component ويمرر له props **قابلة للتسلسل (serializable)** (سلاسل نصية، أرقام، كائنات وصفائف بسيطة — وليس دوال أو كائنات صنفية):

```tsx
// Server Component
import LikeButton from "./components/LikeButton";

export default async function PostPage() {
  const likes = await getLikeCount();
  return <LikeButton initialLikes={likes} />;
}
```

يمكن لـ Client Component أيضًا أن يقبل Server Component كـ `children` — يُمرَّر الناتج المعروض من الخادم كمحتوى مُعرَض بالفعل:

```tsx
// Client Component
export default function Modal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return <>{open && <div className="modal">{children}</div>}</>;
}

// Server Component using it
<Modal>
  <ServerRenderedStats />
</Modal>
```

---

## 7. واجهات برمجة المتصفح (Browser APIs) في Client Components

### الحل

لا توجد `window` و `document` و `localStorage` ومستمعو أحداث DOM إلا في المتصفح — فمن الآمن استخدامها فقط داخل Client Components، وعادة داخل `useEffect` لتجنب تشغيلها أثناء أي عملية عرض من جهة الخادم:

```tsx
"use client";
import { useEffect } from "react";

useEffect(() => {
  const stored = localStorage.getItem("theme");
  // ...
}, []);
```

---

## 8. الأخطاء الشائعة في Server و Client Components

### الحل — تجنب هذه الأخطاء

| الخطأ | لماذا يتسبب في مشكلة |
|---|---|
| استيراد كود خاص بالخادم فقط (عملاء قواعد البيانات، الأسرار) في ملف `"use client"` | قد يتم تجميع هذا الكود وربما كشفه للمتصفح |
| تعليم صفحة كاملة بـ `"use client"` من أجل عنصر تفاعلي واحد | يرسل JS بشكل غير ضروري لمحتوى كان يمكن أن يبقى معروضًا من جهة الخادم |
| تمرير دالة كـ prop من Server إلى Client Component | الدوال غير قابلة للتسلسل عبر حد الخادم/العميل |
| استخدام `useState`/`useEffect` في ملف بدون `"use client"` | لا تعمل Server Components في المتصفح أبدًا — لا توجد دورة حياة (lifecycle) للربط بها |

> 💡 **نصيحة:** عند الشك، ابدأ كل مكون جديد كـ Server Component وأضف `"use client"` فقط عندما تواجه حاجة فعلية للحالة أو التأثيرات أو الأحداث.

---

## ✅ ملخص القسم

- تعمل Server Components على الخادم، ولا ترسل JS، ويمكنها الوصول إلى موارد الواجهة الخلفية مباشرة
- تعمل Client Components في المتصفح وهي مطلوبة للحالة والتأثيرات والأحداث وواجهات برمجة المتصفح
- يحدد `"use client"` وحدة كاملة (واستيراداتها) كجزء من جانب العميل
- يجب أن تكون الـ props من Server إلى Client Components قابلة للتسلسل؛ ويمكن لا يزال تمرير Server Components كـ `children`
- اعتمد على Server Components افتراضيًا؛ واختر Client Components فقط حيث تكون التفاعلية مطلوبة فعليًا

---

## Review Questions

1. **Why can't you pass a function as a prop from a Server Component to a Client Component?**
   Server-to-client props are serialized and sent across the network boundary as part of the React payload; functions have no serializable representation, so only plain data (strings, numbers, objects, arrays) can cross that boundary.

2. **Why is it still fine to render a Server Component as `children` of a Client Component?**
   Because the Server Component is already rendered to its output on the server before being passed down — the Client Component just receives the resulting markup as `children`, not the component itself needing to run in the browser.

3. **What's wrong with adding `"use client"` to the top of `app/page.tsx` just because one button needs `onClick`?**
   It forces the entire page and everything it imports into the client bundle, discarding the zero-JS benefit of Server Components for all the surrounding static content — the fix is to extract just the interactive piece into its own small Client Component.

---

**السابق:** [القسم 5 — التنقل والتوجيه (Navigation and Routing)](../Section%2005%20-%20Navigation%20and%20Routing/README.md)
**التالي:** [القسم 7 — التنسيق في Next.js (Styling in Next.js)](../Section%2007%20-%20Styling%20in%20Next.js/README.md)
