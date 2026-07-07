# القسم 17: إدارة الحالة (State Management)

> **دورة Next.js** — القسم 17 من 25 · المستوى: متوسط

السؤال التصميمي المحوري في تطبيق Next.js ليس "كيف أدير الحالة" بشكل مجرد — بل **أين ينتمي كل جزء من الحالة فعليًا**: الخادم، أم عنوان URL، أم المتصفح.

📁 **كود هذا القسم:** انظر مجلد [`examples/`](./examples).

---

## جدول المحتويات

1. [إدارة الحالة في Next.js](#1-state-management-in-nextjs)
2. [حالة الخادم مقابل حالة العميل](#2-server-state-vs-client-state)
3. [الحالة المحلية للمكوّن](#3-local-component-state)
4. [واجهة Context API](#4-context-api)
5. [حالة عنوان URL باستخدام Search Params](#5-url-state-with-search-params)
6. [استخدام Server Actions للتعديلات](#6-server-actions-for-mutations)
7. [استخدام Zustand](#7-using-zustand)
8. [متى تستخدم الحالة العامة (Global State)](#8-when-to-use-global-state)
9. [أفضل ممارسات إدارة الحالة](#9-state-management-best-practices)

---

## 1. إدارة الحالة في Next.js

### الحل

يجب وضع كل جزء من الحالة في "الموقع الأرخص" الذي يلبي متطلباته: حالة الخادم للبيانات التي تعيش في قاعدة بيانات، وحالة عنوان URL لحالة واجهة المستخدم القابلة للمشاركة، وحالة العميل فقط للأشياء العابرة حقًا والمحلية لتبويب متصفح واحد.

---

## 2. حالة الخادم مقابل حالة العميل

### الحل

**حالة الخادم** تعيش في قاعدة البيانات وتُجلب حديثة مع كل طلب (أو ضمن نافذة تخزين مؤقت) — وهي متسقة بشكل طبيعي عبر المستخدمين والأجهزة. **حالة العميل** تعيش فقط في المتصفح وتُعاد ضبطها عند إعادة التحميل — مناسبة لأشياء مثل "هل هذه القائمة المنسدلة مفتوحة".

---

## 3. الحالة المحلية للمكوّن

انظر [`examples/01-local-state.tsx`](./examples/01-local-state.tsx).

### الحل

`useState`/`useReducer` داخل Client Component، للحالة المعزولة فعليًا لعنصر واجهة مستخدم واحد:

```tsx
"use client";
export default function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen((o) => !o)}>{title}</button>
      {open && <div>{children}</div>}
    </div>
  );
}
```

---

## 4. واجهة Context API

انظر [`examples/02-context-api.tsx`](./examples/02-context-api.tsx).

### الحل

شارك حالة العميل عبر شجرة مكوّنات دون الحاجة لتمرير الخصائص عبر مستويات متعددة (prop drilling) — يجب أن يكون الـ Provider مكوّن Client Component:

```tsx
"use client";
const ThemeContext = createContext<{ theme: string; toggle: () => void } | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState("dark");
  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}
```

> ⚠️ **تحذير:** يقتصر نطاق Context على Client Components فقط — لا يمكن لـ Server Component استهلاك Context تم إنشاؤه في Client Component.

---

## 5. حالة عنوان URL باستخدام Search Params

انظر [`examples/03-url-state.tsx`](./examples/03-url-state.tsx).

### الحل

خزّن حالة واجهة المستخدم القابلة للمشاركة (المرشحات، التبويب النشط، رقم الصفحة) في سلسلة استعلام عنوان URL بدلًا من `useState`:

```tsx
export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const products = await getProducts(category);
  return <p>Filter: {category ?? "all"}</p>;
}
```

> 💡 **نصيحة:** إذا كان يجب أن يتمكن المستخدم من وضع إشارة مرجعية أو مشاركة عرض معين، فإن حالة ذلك العرض تنتمي إلى عنوان URL، وليس إلى حالة المكوّن.

---

## 6. استخدام Server Actions للتعديلات

### الحل

عامل Server Actions كالطريقة الأساسية لتغيير الحالة **المملوكة للخادم** — انظر [القسم 11](../Section%2011%20-%20Forms%20and%20Server%20Actions/README.md) للنمط الكامل. لا تكرر بيانات الخادم داخل حالة العميل فقط لتعديلها محليًا؛ بل عدّل على الخادم ودع إعادة التحقق (revalidation) تُحدّث واجهة المستخدم.

---

## 7. استخدام Zustand

انظر [`examples/04-zustand-store.ts`](./examples/04-zustand-store.ts).

### المشكلة

يعيد Context عرض كل مستهلك عند أي تغيير في الحالة، مما يصبح مشكلة أداء بالنسبة للحالة المُحدَّثة بشكل متكرر والمشتركة على نطاق واسع (مثل سلة التسوق).

### الحل

Zustand هو مخزن خارجي خفيف الوزن مع اشتراكات انتقائية — تُعاد عرض المكوّنات فقط عندما تتغير الشريحة المحددة التي تقرأها:

```ts
"use client";
import { create } from "zustand";

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
}));

// consuming component only re-renders when items.length changes
const itemCount = useCartStore((state) => state.items.length);
```

---

## 8. متى تستخدم الحالة العامة (Global State)

### الحل

الجأ إلى حالة العميل العامة (Context أو Zustand) فقط عندما تحتاج عدة مكوّنات غير مرتبطة ببعضها إلى نفس البيانات الخاصة بالعميل فقط — سلة تسوق، سمة (theme)، نافذة منبثقة مفتوحة/مغلقة مشتركة عبر الشجرة. إذا كانت شجرة مكوّنات واحدة فقط تحتاجها، فالحالة المحلية أبسط وكافية.

---

## 9. أفضل ممارسات إدارة الحالة

- اعتمد افتراضيًا على **حالة الخادم** (قاعدة البيانات) و**حالة عنوان URL** (search params) — فهما لا تتطلبان JavaScript من جانب العميل للبقاء متزامنتين
- أضف **حالة عميل محلية** فقط للحالة العابرة حقًا والمحصورة بنطاق المكوّن
- الجأ إلى **حالة العميل العامة** (Context/Zustand) فقط عندما تحتاج عدة مكوّنات غير مرتبطة فعليًا لمشاركتها
- لا تعكس بيانات الخادم في حالة العميل "للاحتياط" — أعد الجلب أو إعادة التحقق بدلًا من ذلك، بحيث يكون هناك مصدر واحد للحقيقة

---

## ✅ ملخص القسم

- فضّل حالة الخادم (قاعدة البيانات) وحالة عنوان URL (search params) — كلاهما يصمد أمام إعادة التحميل وقابل للمشاركة مجانًا
- استخدم `useState`/`useReducer` للحالة المحلية الخاصة بمكوّن واحد
- استخدم Context API للحالة المشتركة الخاصة بالعميل، محصورة بـ Client Components
- استخدم Zustand للحالة المشتركة المُحدَّثة بشكل متكرر عندما يصبح سلوك إعادة العرض في Context مشكلة
- تبقى Server Actions الطريقة الأساسية لتعديل الحالة المملوكة للخادم

---

## Review Questions

1. **Why is URL state (search params) often preferable to `useState` for filters and tabs?**
   Because URL state survives page reloads and can be copied, bookmarked, or shared with someone else and reproduce the exact same view — `useState` resets the moment the page reloads and can't be shared as a link.

2. **When would Zustand be a better choice than the Context API for shared client state?**
   When the shared state updates frequently and is read by many components, since Context re-renders every consumer on any change to the provided value, while Zustand lets components subscribe to only the specific slice of state they need, avoiding unnecessary re-renders.

---

**السابق:** [القسم 16 — Database Integration](../Section%2016%20-%20Database%20Integration/README.md)
**التالي:** [القسم 18 — Performance Optimization](../Section%2018%20-%20Performance%20Optimization/README.md)
