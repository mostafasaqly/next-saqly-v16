# القسم 23: مشروع — تطبيق Full Stack CRUD

> **دورة Next.js** — القسم 23 من 25 · مشروع تطبيقي 3 من 4

المشروع التطبيقي الثالث: مدير مهام كامل يدعم عمليات الإنشاء والقراءة والتحديث والحذف (Create-Read-Update-Delete) مدعوم بقاعدة بيانات Postgres حقيقية عبر Prisma — يجمع بين القسمين 11 و16 في تطبيق واحد متكامل.

📁 **الكود الخاص بهذا القسم:** انظر مجلد [`examples/`](./examples).

---

## جدول المحتويات

1. [نظرة عامة على المشروع](#1-project-overview)
2. [إعداد Prisma](#2-setting-up-prisma)
3. [إنشاء نماذج قاعدة البيانات](#3-creating-database-models)
4. [إنشاء صفحة القائمة](#4-creating-list-page)
5. [إنشاء نموذج الإضافة](#5-creating-add-form)
6. [إنشاء Server Actions](#6-creating-server-actions)
7. [إنشاء نموذج التعديل](#7-creating-edit-form)
8. [تحديث البيانات](#8-updating-data)
9. [حذف البيانات](#9-deleting-data)
10. [إعادة تحقق الصفحات](#10-revalidating-pages)
11. [إضافة التحقق من الصحة](#11-adding-validation)
12. [مراجعة المشروع النهائية](#12-final-project-review)

---

## 1. نظرة عامة على المشروع

### ما الذي نبنيه

مدير مهام يدعم CRUD كاملًا: صفحة قائمة، نموذج إضافة، نموذج تعديل، وحذف مع تأكيد — كل ذلك مدعوم بـ Postgres عبر Prisma، مع مرور كل عملية تعديل عبر Server Action تم التحقق من صحتها.

---

## 2. إعداد Prisma

### الحل

```bash
npm install prisma @prisma/client
npx prisma init
```

قم بربطه بقاعدة بيانات Postgres عبر `DATABASE_URL` في `.env` — انظر [القسم 16](../Section%2016%20-%20Database%20Integration/README.md#4-installing-prisma).

---

## 3. إنشاء نماذج قاعدة البيانات

انظر [`examples/01-prisma-setup.prisma`](./examples/01-prisma-setup.prisma).

### الحل

```prisma
model Task {
  id        String   @id @default(cuid())
  title     String
  done      Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

قم بتشغيل `npx prisma migrate dev --name init` لتطبيقه.

---

## 4. إنشاء صفحة القائمة

انظر [`examples/02-list-page.tsx`](./examples/02-list-page.tsx).

### الحل

يقوم مكون خادم (Server Component) بجلب جميع المهام مباشرة:

```tsx
export default async function TasksPage() {
  const tasks = await db.task.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>{task.title} {task.done && "✅"}</li>
      ))}
    </ul>
  );
}
```

---

## 5. إنشاء نموذج الإضافة

انظر [`examples/04-add-form.tsx`](./examples/04-add-form.tsx).

### الحل

يقوم نموذج بالإرسال إلى Server Action باسم `createTask` عبر `useActionState`، مع عرض أخطاء التحقق وحالة الانتظار (pending state) — انظر النمط الكامل في [القسم 11](../Section%2011%20-%20Forms%20and%20Server%20Actions/README.md#6-pending-states).

---

## 6. إنشاء Server Actions

انظر [`examples/03-server-actions.ts`](./examples/03-server-actions.ts).

### الحل

وحدة واحدة `actions/tasks.ts` تحتوي على `createTask` و`updateTask` و`toggleTaskDone` و`deleteTask`، كل منها يتحقق من صحة المدخلات ويعيد التحقق (revalidate) من القائمة بعد ذلك:

```ts
"use server";
const TaskSchema = z.object({ title: z.string().min(1, "Title is required").max(200) });

export async function createTask(prevState: unknown, formData: FormData) {
  const parsed = TaskSchema.safeParse({ title: formData.get("title") });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors.title?.[0] };
  await db.task.create({ data: { title: parsed.data.title } });
  revalidatePath("/tasks");
  redirect("/tasks");
}
```

---

## 7. إنشاء نموذج التعديل

انظر [`examples/05-edit-form.tsx`](./examples/05-edit-form.tsx).

### الحل

تقوم صفحة التعديل بتحميل المهمة الموجودة عبر `id` (مع استدعاء `notFound()` إذا كانت مفقودة) وتعبئة نموذج مسبقًا عبر `defaultValue`، مع ربط الإجراء (action) بـ `id` تلك المهمة تحديدًا باستخدام `.bind()`:

```tsx
const updateWithId = updateTask.bind(null, task.id);
const [state, formAction] = useActionState(updateWithId, { error: null });
```

---

## 8. تحديث البيانات

### الحل

تقوم `updateTask` (الموضحة في القسم 6 أعلاه) بالتحقق من صحة العنوان الجديد وكتابته باستخدام `db.task.update`.

---

## 9. حذف البيانات

انظر [`examples/06-delete-with-confirmation.tsx`](./examples/06-delete-with-confirmation.tsx).

### الحل

يقوم مكون عميل (Client Component) صغير بتغليف إجراء الحذف داخل مطالبة `confirm()` قبل استدعائه:

```tsx
"use client";
import { deleteTask } from "@/app/actions/tasks";

export default function DeleteTaskButton({ id }: { id: string }) {
  return (
    <form action={async () => { if (confirm("Delete this task?")) await deleteTask(id); }}>
      <button type="submit">Delete</button>
    </form>
  );
}
```

---

## 10. إعادة تحقق الصفحات

### الحل

يستدعي كل إجراء تعديل (`createTask`، `updateTask`، `deleteTask`، `toggleTaskDone`) الدالة `revalidatePath("/tasks")` مباشرة بعد الكتابة في قاعدة البيانات، بحيث تعكس صفحة القائمة التغييرات في العرض التالي مباشرة — دون الحاجة إلى تحديث يدوي.

---

## 11. إضافة التحقق من الصحة

### الحل

يتحقق كل إجراء من صحة مدخلاته باستخدام نفس `TaskSchema` قبل التعامل مع قاعدة البيانات — انظر [القسم 11](../Section%2011%20-%20Forms%20and%20Server%20Actions/README.md#5-form-validation) لمعرفة سبب كون التحقق من جانب الخادم أمرًا غير قابل للتفاوض.

---

## 12. مراجعة المشروع النهائية

### شرح تفصيلي

- **صفحة القائمة** — مكون خادم، يجلب مباشرة من Prisma
- **نماذج الإضافة/التعديل** — مكونات عميل تستخدم `useActionState` لواجهة الانتظار/الخطأ
- **Server Actions** — التحقق من الصحة باستخدام Zod، والتعديل باستخدام Prisma، وإعادة التحقق باستخدام `revalidatePath`
- **الحذف** — يتم تأكيده عبر مربع حوار أصلي `confirm()` قبل استدعاء الإجراء

### امتدادات محتملة

- إضافة تواريخ استحقاق وترتيب
- إضافة تحديثات واجهة تفاؤلية (optimistic UI) لتبديل `done` (انظر `useOptimistic` في React)
- إضافة تقسيم لصفحات (pagination) بمجرد أن تكبر قائمة المهام

---

## ✅ ملخص القسم

- يقوم Prisma بنمذجة جدول `Task`؛ وتطبق الترحيلات (migrations) تغييرات المخطط
- جميع عمليات CRUD الأربع هي Server Actions، تم التحقق من صحتها باستخدام Zod قبل التعامل مع قاعدة البيانات
- استدعاء `revalidatePath("/tasks")` بعد كل عملية تعديل يحافظ على تزامن القائمة تلقائيًا
- ترتبط نماذج التعديل بالإجراء عبر `id` سجل محدد باستخدام `.bind()`، مما يحافظ على إمكانية إعادة استخدام إجراء واحد عبر جميع المهام

---

## Review Questions

1. **Why does every Server Action in this project call `revalidatePath("/tasks")` after its mutation?**
   Because the tasks list page is statically cached by default — without revalidating, a create/update/delete would succeed in the database but the list page would keep showing stale cached data until the next natural revalidation window.

2. **Why use `.bind(null, task.id)` on the `updateTask` action inside the edit form?**
   It creates a version of the action pre-filled with the specific task's `id`, so the generic `updateTask(id, prevState, formData)` function can be reused for every task while `useActionState` only needs to manage `(prevState, formData)`.

---

**السابق:** [Section 22 — Project: Dashboard App](../Section%2022%20-%20Project%20Dashboard%20App/README.md)
**التالي:** [Section 24 — Project: Mini E-Commerce App](../Section%2024%20-%20Project%20Mini%20E-Commerce%20App/README.md)
