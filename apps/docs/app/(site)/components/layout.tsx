import type { ReactNode } from "react";
import { DocsNav } from "@/components/docs-nav";

export default function ComponentsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-[90rem]">
      <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-56 shrink-0 overflow-y-auto border-r border-[var(--kora-line)] px-5 py-6 md:block">
        <DocsNav />
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

