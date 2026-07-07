# القسم 18: تحسين الأداء

> **دورة Next.js** — القسم 18 من 25 · المستوى: متقدم

معظم مكاسب الأداء في Next.js تلقائية — Server Components، وتقسيم الكود (code splitting)، وتحسين الصور/الخطوط. يغطي هذا القسم الروافع المتبقية التي تُفعّلها يدويًا: الاستيراد الديناميكي، واستراتيجية تحميل السكربتات، وتحليل الحزم (bundle analysis).

📁 **كود هذا القسم:** انظر مجلد [`examples/`](./examples).

---

## جدول المحتويات

1. [نظرة عامة على أداء Next.js](#1-nextjs-performance-overview)
2. [تقسيم الكود (Code Splitting)](#2-code-splitting)
3. [التحميل الكسول للمكوّنات](#3-lazy-loading-components)
4. [الاستيراد الديناميكي](#4-dynamic-imports)
5. [تحسين الصور](#5-image-optimization)
6. [تحسين الخطوط](#6-font-optimization)
7. [تحسين السكربتات](#7-script-optimization)
8. [تحليل الحزم (Bundle Analysis)](#8-bundle-analysis)
9. [نظرة عامة على Turbopack](#9-turbopack-overview)
10. [أفضل ممارسات الأداء](#10-performance-best-practices)

---

## 1. نظرة عامة على أداء Next.js

### الحل

أكبر روافع الأداء، مرتبة تقريبًا حسب التأثير: استراتيجية العرض (Server Components افتراضيًا)، وحجم الحزمة (ما يُشحن فعليًا كـ JS للعميل)، والتعامل مع الأصول (الصور/الخطوط/السكربتات).

---

## 2. تقسيم الكود (Code Splitting)

### الحل

تقسّم Next.js تلقائيًا JavaScript الخاص بتطبيقك حسب المسار (route) — فزيارة `/dashboard` لا تُنزّل كود `/checkout`. يحدث هذا دون أي إعداد.

---

## 3. التحميل الكسول للمكوّنات

### الحل

أجّل تحميل المكوّنات غير الحرجة (نافذة منبثقة، رسم بياني، محرر نص غني) حتى الحاجة الفعلية إليها، بدلًا من تضمينها في الحزمة الأولية.

---

## 4. الاستيراد الديناميكي

انظر [`examples/01-dynamic-import.tsx`](./examples/01-dynamic-import.tsx).

### الحل

يقوم `next/dynamic` بتحميل Client Component عند الطلب، ويمكنه تعطيل العرض من جانب الخادم للمكوّنات التي تعمل فقط في المتصفح:

```tsx
import dynamic from "next/dynamic";

const HeavyChart = dynamic(() => import("./components/HeavyChart"), {
  loading: () => <p>Loading chart…</p>,
  ssr: false,
});
```

> 💡 **نصيحة:** استخدم `ssr: false` للمكوّنات التي تعتمد على عناصر عامة خاصة بالمتصفح فقط (مثل مكتبة رسوم بيانية تقرأ `window` وقت الاستيراد) — وإلا فإن عرض الخادم سينهار.

---

## 5. تحسين الصور

### الحل

يتعامل `next/image` مع تغيير الحجم، وتحويل الصيغة، والتحميل الكسول تلقائيًا — انظر [القسم 8](../Section%2008%20-%20Assets%20Images%20and%20Metadata/README.md#3-next-image-component) للنمط الكامل.

---

## 6. تحسين الخطوط

### الحل

يستضيف `next/font` الخطوط ذاتيًا وقت البناء، مما يُلغي طلبات الخطوط المُعيقة للعرض (render-blocking) وتحوّل التخطيط (layout shift) — انظر [القسم 7](../Section%2007%20-%20Styling%20in%20Next.js/README.md#6-fonts-in-nextjs).

---

## 7. تحسين السكربتات

انظر [`examples/02-script-optimization.tsx`](./examples/02-script-optimization.tsx).

### المشكلة

وسم `<script>` من طرف ثالث يُوضع بلا عناية يمكن أن يمنع المتصفح من عرض الصفحة أثناء تنزيله وتنفيذه.

### الحل

يتحكم `next/script` بشكل صريح في استراتيجية التحميل:

```tsx
import Script from "next/script";

<Script src="https://analytics.example.com/script.js" strategy="afterInteractive" />
```

| الاستراتيجية | متى يتم التحميل |
|---|---|
| `beforeInteractive` | قبل أي JS للصفحة، بشكل معيق — استخدمها باقتصاد، فقط للسكربتات الحرجة |
| `afterInteractive` (الافتراضي) | بعد أن تصبح الصفحة تفاعلية |
| `lazyOnload` | خلال وقت الخمول للمتصفح، بأدنى أولوية |

---

## 8. تحليل الحزم (Bundle Analysis)

انظر [`examples/03-bundle-analyzer.ts`](./examples/03-bundle-analyzer.ts).

### الحل

يُظهر `@next/bundle-analyzer` بصريًا ما يوجد فعليًا داخل حزم العميل الخاصة بك على شكل خريطة شجرية تفاعلية (treemap)، مما يسهّل اكتشاف تبعية كبيرة بشكل غير متوقع:

```ts
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === "true" });
export default withBundleAnalyzer({ /* next config */ });
```

شغّله باستخدام `ANALYZE=true npm run build`.

---

## 9. نظرة عامة على Turbopack

### الحل

Turbopack، حزمة (bundler) Next.js المبنية بلغة Rust، هي **الافتراضية لكل من `next dev` و`next build`** في الإصدار الحالي من Next.js — مما يمنح بدء تشغيل أسرع، وتحديثًا أسرع، وبناء إنتاج أسرع مقارنة بخط أنابيب Webpack القديم، دون الحاجة لأي إعداد لتفعيلها.

---

## 10. أفضل ممارسات الأداء

- فضّل Server Components — فهي لا تشحن أي JS للمحتوى الذي لا يحتاج إلى تفاعلية
- حافظ على حدود Client Component صغيرة ومدفوعة إلى أسفل الشجرة قدر الإمكان
- استخدم `next/dynamic` للمكوّنات الكبيرة أو غير الحرجة أو الخاصة بالمتصفح فقط
- قِس باستخدام **Core Web Vitals** (LCP، INP، CLS) بدلًا من التخمين — بيانات المستخدم الحقيقية أفضل من الحدس

> ⚠️ **تحذير:** التحسين دون القياس أولًا غالبًا ما يستهدف الشيء الخطأ. تحقق من Core Web Vitals أو من تحليل الحزم قبل افتراض أن مكوّنًا أو تبعية معينة هي عنق الزجاجة.

---

## ✅ ملخص القسم

- تقسيم الكود حسب المسار يحدث تلقائيًا؛ يضيف `next/dynamic` تحميلًا عند الطلب لمكوّنات محددة
- يتعامل `next/image` و`next/font` تلقائيًا مع أكبر نقطتي ألم تاريخيتين في الأداء
- يمنح `next/script` تحكمًا صريحًا في أولوية تحميل السكربتات الخاصة بأطراف ثالثة
- يكشف `@next/bundle-analyzer` ما يُشحن فعليًا في حزم العميل الخاصة بك
- يشغّل Turbopack الآن كلًا من التطوير والبناء افتراضيًا — دون الحاجة لإعداد

---

## Review Questions

1. **When would you set `ssr: false` on a `next/dynamic` import?**
   When the component depends on browser-only APIs (like `window` or `document`) at module load time — rendering it on the server would throw, so disabling SSR defers it entirely to the client.

2. **Why is `next/script`'s `strategy` prop important for third-party scripts?**
   Because an unmanaged `<script>` tag can block the browser from parsing and rendering the page while it downloads; choosing `afterInteractive` or `lazyOnload` lets the page become interactive first, improving perceived load performance.

---

**السابق:** [القسم 17 — State Management](../Section%2017%20-%20State%20Management/README.md)
**التالي:** [القسم 19 — SEO and Production Readiness](../Section%2019%20-%20SEO%20and%20Production%20Readiness/README.md)
