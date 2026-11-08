import pg from "pg";
import { cache } from "react";
import { cookies, headers } from "next/headers";

// Same accounts as the other Istmo Code apps (Neon Managed Better Auth over HTTP), but a separate door: an account
// opens kora-ui's paid parts only with a live row in public.kora_access (db/kora-access.sql). The other apps check
// their own access, so a kora customer can't get into them, and their users don't get kora for free.
// The browser only holds our httpOnly cookie, which carries the auth session cookie.
export const COOKIE = "kora_session";
const WEEK = 60 * 60 * 24 * 7;

const g = globalThis as unknown as { koraAuthPool?: pg.Pool };
const pool = (g.koraAuthPool ??= new pg.Pool({ connectionString: process.env.AUTH_DATABASE_URL, max: 3 }));

async function proto() {
  const h = await headers();
  return h.get("x-forwarded-proto")?.split(",")[0].trim() ?? (process.env.NODE_ENV === "production" ? "https" : "http");
}

/** The app's own origin: Neon Auth checks it against its trusted domains. */
export async function origin() {
  const h = await headers();
  return `${await proto()}://${h.get("x-forwarded-host") ?? h.get("host")}`;
}

export async function auth(path: string, { body, cookie }: { body?: unknown; cookie?: string } = {}) {
  const res = await fetch(`${process.env.NEON_AUTH_BASE_URL}${path}`, {
    method: body ? "POST" : "GET",
    headers: { ...(body ? { "content-type": "application/json" } : {}), ...(cookie ? { cookie } : {}), origin: await origin() },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const data = await res.json().catch(() => null);
  return { res, data };
}

/** Stores the Neon Auth session in our cookie (Secure over https; plain http only works on localhost). */
export async function setSession(res: Response) {
  const value = res.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
  (await cookies()).set(COOKIE, value, { httpOnly: true, secure: (await proto()) === "https", sameSite: "lax", path: "/", maxAge: WEEK });
}

/** A live kora grant: not revoked, not expired. */
export async function hasKoraAccess(userId: string) {
  const { rows } = await pool.query(
    "SELECT 1 FROM public.kora_access WHERE user_id = $1 AND revoked_at IS NULL AND (expires_at IS NULL OR expires_at > now())",
    [userId],
  );
  return rows.length > 0;
}

export type User = { id: string; email: string; name: string; access: boolean; cookie: string };

// ponytail: one get-session call per request (React cache dedupes it within the render).
export const currentUser = cache(async (): Promise<User | null> => {
  const cookie = (await cookies()).get(COOKIE)?.value;
  if (!cookie) return null;
  const { data } = await auth("/get-session", { cookie });
  if (!data?.user) return null;
  const id = String(data.user.id);
  const email = String(data.user.email).toLowerCase();
  return { id, email, name: data.user.name || email, access: await hasKoraAccess(id), cookie };
});

/** Only same-site paths survive as a return address ("/x", never "//evil.com" or "https://…"). */
export function safeNext(next: unknown) {
  const n = String(next ?? "");
  return n.startsWith("/") && !n.startsWith("//") && !n.startsWith("/\\") ? n : "/templates";
}
