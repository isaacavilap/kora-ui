"use server";
import { cookies } from "next/headers";
import { COOKIE, auth, currentUser, origin, setSession } from "@/lib/auth";

const MIN = 10;
const email = (v: unknown) => String(v ?? "").trim().toLowerCase();

// Messages never say whether an account exists, so accounts can't be probed. Neon Auth rate-limits these endpoints.

export async function login(v: { email: string; password: string }) {
  const { res } = await auth("/sign-in/email", { body: { email: email(v.email), password: String(v.password ?? "") } });
  if (!res.ok) return { error: "Wrong email or password." };
  await setSession(res);
  return { ok: true };
}

export async function register(v: { name: string; email: string; password: string }) {
  const password = String(v.password ?? "");
  if (password.length < MIN) return { error: `Use at least ${MIN} characters.` };
  if (!/^\S+@\S+\.\S+$/.test(email(v.email))) return { error: "Enter a valid email." };
  const { res } = await auth("/sign-up/email", { body: { email: email(v.email), password, name: String(v.name ?? "").trim().slice(0, 80) || email(v.email) } });
  if (!res.ok) return { error: "We couldn't create the account. If you already have one, sign in or reset your password." };
  // A new account has no kora access yet: it opens the paid parts once a purchase (or a manual grant) adds it.
  if (res.headers.getSetCookie().length) await setSession(res);
  return { ok: true };
}

export async function logout() {
  const user = await currentUser();
  if (user) await auth("/sign-out", { body: {}, cookie: user.cookie });
  (await cookies()).delete(COOKIE);
}

export async function forgot(v: { email: string }) {
  const { res, data } = await auth("/request-password-reset", { body: { email: email(v.email), redirectTo: `${await origin()}/login/reset` } });
  if (!res.ok) console.error("password reset request failed", res.status, data?.code);
}

export async function reset(v: { token: string; password: string }) {
  if (String(v.password ?? "").length < MIN) return { error: `Use at least ${MIN} characters.` };
  const { res } = await auth("/reset-password", { body: { token: String(v.token ?? ""), newPassword: String(v.password) } });
  return res.ok ? { ok: true } : { error: "This link no longer works. Ask for a new one." };
}
