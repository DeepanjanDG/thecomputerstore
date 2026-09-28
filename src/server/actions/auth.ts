"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "../db";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "../session";
import { getSession } from "../auth";

export interface AuthState { error?: string; ok?: boolean }

const safeNext = (n: FormDataEntryValue | null) => {
  const s = typeof n === "string" ? n : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : "/account";
};

async function startSession(user: { id: string; email: string; name: string; role: "CUSTOMER" | "ADMIN" }) {
  const token = await signSession(user);
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);
}

const registerSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.string().trim().toLowerCase().email("Please enter a valid email"),
  phone: z.string().trim().max(20).optional(),
  password: z.string().min(8, "Use at least 8 characters for your password").max(100),
});

export async function registerAction(_: AuthState, form: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, email, phone, password } = parsed.data;
  if (await db.user.findUnique({ where: { email } })) return { error: "An account with this email already exists. Try signing in." };
  const user = await db.user.create({ data: { name, email, phone: phone || null, passwordHash: await bcrypt.hash(password, 10) } });
  await startSession({ id: user.id, email: user.email, name: user.name, role: user.role });
  redirect(safeNext(form.get("next")));
}

export async function loginAction(_: AuthState, form: FormData): Promise<AuthState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const user = email ? await db.user.findUnique({ where: { email } }) : null;
  // Same message either way so we don't reveal which emails have accounts.
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return { error: "That email and password don't match. Please try again." };
  await startSession({ id: user.id, email: user.email, name: user.name, role: user.role });
  const next = safeNext(form.get("next"));
  redirect(user.role === "ADMIN" && next === "/account" ? "/admin" : next);
}

export async function logoutAction() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/");
}

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().max(20).optional(),
  city: z.string().trim().max(60).optional(),
});

export async function updateProfileAction(_: AuthState, form: FormData): Promise<AuthState> {
  const user = await getSession();
  if (!user) return { error: "Please sign in again." };
  const parsed = profileSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const u = await db.user.update({ where: { id: user.id }, data: { name: parsed.data.name, phone: parsed.data.phone || null, city: parsed.data.city || null } });
  await startSession({ id: u.id, email: u.email, name: u.name, role: u.role });
  return { ok: true };
}
