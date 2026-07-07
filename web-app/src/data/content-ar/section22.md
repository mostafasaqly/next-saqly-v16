# القسم 22: مشروع — تطبيق لوحة تحكم (Dashboard App)

> **دورة Next.js** — القسم 22 من 25 · مشروع تطبيقي 2 من 4

المشروع التطبيقي الثاني: لوحة تحكم إدارية مصادَق عليها (authenticated) تحتوي على شريط جانبي ثابت، بطاقات ملخص، جدول بيانات قابل للتصفية، وحماية للمسارات (route protection) — يجمع بين الأقسام 4 و5 و9 و14 و15.

📁 **الكود الخاص بهذا القسم:** انظر مجلد [`examples/`](./examples).

---

## جدول المحتويات

1. [نظرة عامة على المشروع](#1-project-overview)
2. [إنشاء تخطيط لوحة التحكم](#2-creating-dashboard-layout)
3. [الشريط الجانبي والرأس](#3-sidebar-and-header)
4. [بطاقات لوحة التحكم](#4-dashboard-cards)
5. [جدول البيانات](#5-data-table)
6. [البحث والتصفية](#6-search-and-filters)
7. [صفحة التفاصيل](#7-details-page)
8. [هياكل التحميل (Skeletons)](#8-loading-skeletons)
9. [معالجة الأخطاء](#9-error-handling)
10. [حماية مسارات لوحة التحكم](#10-protected-dashboard-routes)
11. [إعادة الهيكلة النهائية](#11-final-refactoring)

---

## 1. نظرة عامة على المشروع

### ما الذي نبنيه

لوحة تحكم إدارية تحتوي على:

- هيكل ثابت (shell) لشريط جانبي/رأس لجميع صفحات لوحة التحكم
- بطاقات مقاييس ملخصة في صفحة النظرة العامة
- جدول عملاء قابل للبحث ومقسم لصفحات (paginated)
- حماية للمسارات بحيث يمكن فقط للمستخدمين المصادَق عليهم الوصول إلى `/dashboard/*`

---

## 2. إنشاء تخطيط لوحة التحكم

انظر [`examples/01-dashboard-layout.tsx`](./examples/01-dashboard-layout.tsx).

### الحل

تحدد مجموعة مسارات (route group) باسم `(dashboard)` نطاق تخطيط مميز لقسم لوحة التحكم فقط، دون التأثير على الرابط (URL):

```tsx
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dashboard-shell">
      <Sidebar />
      <div className="dashboard-main">
        <Header />
        {children}
      </div>
    </div>
  );
}
```

---

## 3. الشريط الجانبي والرأس

انظر [`examples/02-sidebar.tsx`](./examples/02-sidebar.tsx).

### الحل

يقوم الشريط الجانبي بتمييز الرابط النشط باستخدام `usePathname`، باتباع النمط من [القسم 5](../Section%2005%20-%20Navigation%20and%20Routing/README.md#4-active-links).

---

## 4. بطاقات لوحة التحكم

انظر [`examples/03-summary-cards.tsx`](./examples/03-summary-cards.tsx).

### الحل

يقوم مكون خادم (Server Component) بجلب المقاييس الإجمالية وعرضها كبطاقات — لا حاجة إلى JS من جانب العميل لأرقام الملخص الثابتة:

```tsx
export default async function DashboardOverviewPage() {
  const metrics = await getDashboardMetrics();
  return (
    <div className="cards-grid">
      <div className="card"><h3>Revenue</h3><p>${metrics.revenue}</p></div>
    </div>
  );
}
```

---

## 5. جدول البيانات

انظر [`examples/04-data-table-with-filters.tsx`](./examples/04-data-table-with-filters.tsx).

### الحل

عرض صفوف مقسمة لصفحات (paginated) يتم جلبها من جانب الخادم، بناءً على رقم الصفحة الحالي.

---

## 6. البحث والتصفية

### الحل

تستخدم التصفية معاملات بحث URL (search params) (من [القسم 17](../Section%2017%20-%20State%20Management/README.md#5-url-state-with-search-params)) بدلاً من حالة العميل (client state)، بحيث تكون طرق العرض المصفاة/المقسمة لصفحات قابلة للمشاركة والحفظ كمرجعية (bookmarkable):

```tsx
export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ query?: string; page?: string }> }) {
  const { query = "", page = "1" } = await searchParams;
  const { customers, totalPages } = await getCustomers(query, Number(page));
  // ...
}
```

---

## 7. صفحة التفاصيل

### الحل

أضف مسارًا ديناميكيًا `[id]` ضمن `dashboard/customers/[id]/page.tsx` باتباع نفس النمط من [القسم 5](../Section%2005%20-%20Navigation%20and%20Routing/README.md#6-route-parameters)، لعرض السجل الكامل لعميل واحد.

---

## 8. هياكل التحميل (Skeletons)

### الحل

أضف `loading.tsx` لكل مسار فرعي في لوحة التحكم يعرض عناصر هيكلية بديلة (skeleton placeholders) بنفس شكل المحتوى الفعلي، للحصول على تجربة أداء ملموسة وأنيقة.

---

## 9. معالجة الأخطاء

### الحل

حدود `error.tsx` مخصصة (scoped) لكل مسار فرعي في لوحة التحكم، بحيث لا يؤدي فشل تحميل جدول العملاء إلى تعطيل هيكل لوحة التحكم بأكمله — نفس النمط من [القسم 13](../Section%2013%20-%20Error%20Handling/README.md).

---

## 10. حماية مسارات لوحة التحكم

انظر [`examples/05-protected-dashboard.tsx`](./examples/05-protected-dashboard.tsx).

### الحل

قم بحماية مجموعة المسارات بأكملها خلف فحص جلسة (session check) في `proxy.ts`، يطابق فقط مسارات لوحة التحكم:

```ts
export function proxy(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  if (!session) return NextResponse.redirect(new URL("/login", request.url));
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*"] };
```

---

## 11. إعادة الهيكلة النهائية

### الحل

- توحيد دوال جلب البيانات (`getDashboardMetrics`، `getCustomers`) في وحدة `lib/` مشتركة
- استخراج `SearchInput` وعناصر التحكم بالصفحات (pagination controls) إلى مكونات عميل (Client Components) قابلة لإعادة الاستخدام تُستخدم في كل جدول قابل للتصفية
- التأكد من أن `matcher` الخاص بالـ proxy يغطي كل مسار فرعي في لوحة التحكم دون أن يطابق صفحات عامة غير ذات صلة

---

## ✅ ملخص القسم

- مجموعات المسارات (route groups) تمنح لوحة التحكم تخطيطها الخاص (شريط جانبي + رأس) دون تغيير الرابط
- بطاقات الملخص والجداول هي مكونات خادم تجلب البيانات مباشرة — لا حاجة لحالة تحميل من جانب العميل
- التصفية وتقسيم الصفحات موجودان في الرابط، مما يجعل كل طريقة عرض قابلة للمشاركة
- يحمي `proxy.ts` مجموعة مسارات `/dashboard/*` بأكملها خلف فحص جلسة واحد في مكان واحد

---

## Review Questions

1. **Why gate the dashboard with a single `proxy.ts` matcher instead of checking auth inside every individual dashboard page?**
   Centralizing the check in the proxy means every current and future route under `/dashboard/*` is automatically protected — checking inside each page individually is repetitive and easy to forget on a newly added route.

2. **Why store the customer table's search query and page number in the URL instead of component state?**
   So the exact filtered/paginated view can be bookmarked, shared, or reloaded without losing its state — component state would reset to the default view on every page reload.

---

**السابق:** [Section 21 — Project: Blog App](../Section%2021%20-%20Project%20Blog%20App/README.md)
**التالي:** [Section 23 — Project: Full Stack CRUD App](../Section%2023%20-%20Project%20Full%20Stack%20CRUD%20App/README.md)
