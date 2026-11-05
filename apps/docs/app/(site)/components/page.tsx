import type { Metadata } from "next";
import Link from "next/link";
import { componentGroups } from "@/lib/registry";

export const metadata: Metadata = { title: "Components" };

export default function ComponentsIndex() {
  return (
    <main className="px-4 py-8 lg:px-10 lg:py-10">
      <h1 className="text-2xl font-semibold">Components</h1>
      <p className="mt-2 max-w-2xl text-[var(--kora-muted)]">The pieces of a dashboard, from the page frame to a single button. Every one works with touch and keyboard, in light and dark.</p>
      <div className="mt-8 grid gap-10">
        {componentGroups.map((group) => (
          <section key={group.name} id={group.name.toLowerCase()} className="scroll-mt-20">
            <h2 className="mb-3 text-base font-semibold">{group.name}</h2>
            <ul className="grid gap-px overflow-hidden rounded-lg border border-[var(--kora-line)] bg-[var(--kora-line)] sm:grid-cols-2 xl:grid-cols-3">
              {group.items.map((item) => (
                <li key={item.slug} className="bg-[var(--kora-surface)]">
                  <Link href={`/components/${item.slug}`} className="block h-full p-4 hover:bg-[var(--kora-surface-2)]">
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="mt-1 line-clamp-2 block text-[0.8125rem] text-[var(--kora-muted)]">{item.description}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}

