"use client";
import Link from "next/link";
import { KoraProvider } from "kora-ui";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <KoraProvider linkComponent={Link}>{children}</KoraProvider>;
}

