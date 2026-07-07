# القسم 11: النماذج و Server Actions

> **دورة Next.js** — القسم 11 من 25 · المستوى: متوسط

تتيح لك Server Actions أن تستدعي عنصر `<form>` عادي من HTML كودًا يعمل على الخادم مباشرة — دون الحاجة إلى مسار API منفصل، ودون ربط يدوي باستخدام `fetch` في الحالة الشائعة وهي "أرسل هذا النموذج، وعدّل بعض البيانات."

📁 **الكود الخاص بهذا القسم:** راجع مجلد [`examples/`](./examples).

---

## جدول المحتويات

1. [النماذج في Next.js](#1-forms-in-nextjs)
2. [ما هي Server Actions؟](#2-what-are-server-actions)
3. [إنشاء أول Server Action لك](#3-creating-your-first-server-action)
4. [استخدام Server Actions مع النماذج](#4-using-server-actions-with-forms)
5. [التحقق من صحة النماذج](#5-form-validation)
6. [حالات الانتظار (Pending States)](#6-pending-states)
7. [حالات الخطأ](#7-error-states)
8. [رسائل النجاح](#8-success-messages)
9. [إعادة تعيين النماذج](#9-resetting-forms)
10. [تعديل البيانات باستخدام Server Actions](#10-mutating-data-with-server-actions)
11. [إعادة التحقق من صحة البيانات بعد التعديل](#11-revalidating-data-after-mutation)

---

## 1. النماذج في Next.js

### المشكلة

تقليديًا، يعني إرسال النموذج ما يلي: منع السلوك الافتراضي، وقراءة قيم الحقول يدويًا، واستدعاء `fetch` لواجهة JSON API، ثم التعامل مع الاستجابة — وكل ذلك في JavaScript على جانب العميل.

### الحل

يمكن لعناصر `<form>` الأصلية أن ترسل البيانات مباشرة إلى دالة تعمل على جانب الخادم عبر خاصية `action` — دون الحاجة إلى أي JavaScript على جانب العميل في الحالة الأساسية.

---

## 2. ما هي Server Actions؟

### الحل

الـ Server Action هي دالة `async` تُميَّز بـ `"use server"` وتعمل حصريًا على الخادم، ويمكن استدعاؤها من كل من Server Components و Client Component — بما في ذلك استخدامها مباشرة كقيمة لخاصية `action` الخاصة بالنموذج.

---

## 3. إنشاء أول Server Action لك

راجع [`examples/01-first-server-action.tsx`](./examples/01-first-server-action.tsx).

### الحل

```ts
// app/actions/notes.ts
"use server";

export async function createNote(formData: FormData) {
  const text = formData.get("text") as string;
  await db.note.create({ data: { text } });
}
```

```tsx
// app/page.tsx
import { createNote } from "./actions/notes";

export default function NotesPage() {
  return (
    <form action={createNote}>
      <input name="text" />
      <button type="submit">Add Note</button>
    </form>
  );
}
```

---

## 4. استخدام Server Actions مع النماذج

### الحل

يستقبل الـ action كائن `FormData` المرسل مباشرة — دون الحاجة إلى أي تسلسل (serialization) يدوي. اقرأ الحقول باستخدام `formData.get("fieldName")`.

---

## 5. التحقق من صحة النماذج

راجع [`examples/02-validation-with-zod.tsx`](./examples/02-validation-with-zod.tsx).

### المشكلة

يمكن تجاوز التحقق من صحة البيانات على جانب العميل وحده — يجب أن يقوم الخادم بالتحقق بشكل مستقل لأنه هو حدود الثقة الفعلي.

### الحل

تحقق من صحة البيانات باستخدام Zod (أو ما شابه) داخل الـ action نفسه، قبل الوصول إلى قاعدة البيانات:

```ts
"use server";
import { z } from "zod";

const NoteSchema = z.object({ text: z.string().min(1, "Note cannot be empty").max(500) });

export async function createNote(prevState: unknown, formData: FormData) {
  const parsed = NoteSchema.safeParse({ text: formData.get("text") });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.text?.[0] };
  }
  await db.note.create({ data: { text: parsed.data.text } });
  return { success: true };
}
```

> ⚠️ **تحذير:** لا تثق أبدًا في التحقق من صحة البيانات على جانب العميل وحده. يمكن استدعاء Server Action مباشرة (متجاوزًا واجهة المستخدم لديك)، لذا فإن التحقق من صحة البيانات على جانب الخادم هو التحقق الوحيد الذي يهم فعليًا من أجل الصحة.

---

## 6. حالات الانتظار (Pending States)

راجع [`examples/03-use-action-state.tsx`](./examples/03-use-action-state.tsx) و [`examples/04-use-form-status.tsx`](./examples/04-use-form-status.tsx).

### الحل

يقوم `useActionState` بتغليف الـ action ويمنحك الحالة التي يُرجعها بالإضافة إلى علامة انتظار (pending flag):

```tsx
"use client";
import { useActionState } from "react";
import { createNote } from "../actions/notes";

export default function NoteForm() {
  const [state, formAction, isPending] = useActionState(createNote, { error: null, success: false });
  return (
    <form action={formAction}>
      <input name="text" disabled={isPending} />
      <button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Add Note"}</button>
    </form>
  );
}
```

بدلاً من ذلك، يقرأ `useFormStatus` حالة الانتظار من أقرب `<form>` أب، وهو مفيد لمكوّن زر إرسال قابل لإعادة الاستخدام:

```tsx
"use client";
import { useFormStatus } from "react-dom";

export default function SubmitButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</button>;
}
```

> 💡 **نصيحة:** يجب استدعاء `useFormStatus` داخل مكوّن متداخل *ضمن* عنصر `<form>`، وليس في المكوّن الذي يعرض النموذج نفسه.

---

## 7. حالات الخطأ

### الحل

أعد كائن خطأ منظّم من الـ action (كما هو موضح أعلاه) وقم بعرضه من `state.error` بعد استدعاء `useActionState`.

---

## 8. رسائل النجاح

### الحل

نفس النمط — أعد علامة أو رسالة `success` في الحالة التي يُرجعها الـ action، واعرضها بشكل شرطي في مكوّن النموذج.

---

## 9. إعادة تعيين النماذج

### الحل

بعد نجاح الإرسال، أعد تعيين النموذج باستخدام `ref` (`formRef.current?.reset()`) أو عبر تغيير خاصية `key` لإجبار إعادة التركيب (remount).

---

## 10. تعديل البيانات باستخدام Server Actions

راجع [`examples/05-mutate-and-revalidate.tsx`](./examples/05-mutate-and-revalidate.tsx).

### الحل

قم بتنفيذ عملية الكتابة الفعلية إلى قاعدة البيانات مباشرة داخل الـ action — هذا هو المكان المعتاد لعمليات الإنشاء والتحديث والحذف في App Router:

```ts
export async function deleteNote(id: string) {
  await db.note.delete({ where: { id } });
  revalidatePath("/notes");
}
```

---

## 11. إعادة التحقق من صحة البيانات بعد التعديل

### المشكلة

بعد أن يقوم Server Action بتعديل البيانات، تصبح أي صفحات مخزّنة مؤقتًا (cached) تعرض تلك البيانات قديمة (stale).

### الحل

استدعِ `revalidatePath` أو `revalidateTag` داخل الـ action نفسه، مباشرة بعد التعديل، بحيث تعكس واجهة المستخدم التغيير فورًا في العرض التالي:

```ts
await db.note.create({ data: { text } });
revalidatePath("/notes");
```

---

## ✅ ملخص القسم

- عنصر `<form action={serverAction}>` الأصلي يرسل البيانات مباشرة إلى كود يعمل على الخادم، دون الحاجة إلى مسار API
- Server Actions هي دوال `async` تُميَّز بـ `"use server"`، وتستقبل `FormData`
- تحقق دائمًا من صحة البيانات على الخادم (مثلاً باستخدام Zod) — التحقق على جانب العميل وحده غير موثوق
- يتعامل `useActionState` و `useFormStatus` مع واجهة المستخدم الخاصة بالانتظار/الخطأ/النجاح دون ربط حالة يدوي
- استدعِ `revalidatePath`/`revalidateTag` داخل الـ action بعد التعديل للحفاظ على تزامن واجهة المستخدم

---

## Review Questions

1. **Why is server-side validation required even if the form already validates on the client?**
   Because a Server Action can be invoked directly, bypassing the UI entirely — client-side validation only improves UX, it provides no actual security or data-integrity guarantee.

2. **What's the difference between `useActionState` and `useFormStatus`?**
   `useActionState` wraps a specific action and exposes its returned state plus a pending flag, typically used in the component that owns the form. `useFormStatus` reads pending status from the nearest ancestor `<form>` and is meant for reusable child components (like a submit button) that don't own the form themselves.

3. **Why call `revalidatePath` inside the Server Action instead of after the form submission on the client?**
   Because the action runs on the server right where the mutation happens — calling revalidation there guarantees the cache is invalidated as part of the same request, before the client even sees the response, rather than relying on a separate client-side step that could be skipped or delayed.

---

**السابق:** [القسم 10 — التخزين المؤقت وإعادة التحقق من الصحة](../Section%2010%20-%20Caching%20and%20Revalidation/README.md)
**التالي:** [القسم 12 — معالجات المسارات وواجهات البرمجة](../Section%2012%20-%20Route%20Handlers%20and%20APIs/README.md)
