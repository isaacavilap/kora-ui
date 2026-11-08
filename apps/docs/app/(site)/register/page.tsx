import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser, safeNext } from "@/lib/auth";
import { Register } from "../login/screens";

export const metadata: Metadata = { title: "Create account", robots: { index: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  if (await currentUser()) redirect(next);
  return <main className="py-10"><Register next={next} /></main>;
}
