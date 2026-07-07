// app/actions/auth.ts
"use server";

import bcrypt from "bcrypt";
import { z } from "zod";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function register(prevState: unknown, formData: FormData) {
  const parsed = RegisterSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { error: { email: ["Email already in use"] } };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await db.user.create({ data: { email: parsed.data.email, passwordHash } });

  return { success: true };
}
