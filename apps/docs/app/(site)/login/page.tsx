import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser, safeNext } from "@/lib/auth";
import { Login } from "./screens";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  if (await currentUser()) redirect(next);
  return <main className="py-10"><Login next={next} /></main>;
}
