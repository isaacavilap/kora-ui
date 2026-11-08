import type { Metadata } from "next";
import { Reset } from "../screens";

export const metadata: Metadata = { title: "New password", robots: { index: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  return <main className="py-10"><Reset token={String((await searchParams).token ?? "")} /></main>;
}
