import type { Metadata } from "next";
import { Forgot } from "../screens";

export const metadata: Metadata = { title: "Reset password", robots: { index: false } };

export default function Page() {
  return <main className="py-10"><Forgot /></main>;
}
