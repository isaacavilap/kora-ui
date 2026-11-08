import Link from "next/link";
import { Button } from "kora-ui";
import { CodeBlock } from "@/components/code-block";
import { allComponents, componentGroups, templateDocs, templateGroups } from "@/lib/registry";

export const metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <main>
      <section className="mx-auto max-w-[90rem] px-4 pt-10 pb-8 lg:px-6 lg:pt-16">
        <h1 className="max-w-4xl text-4xl leading-[1.05] font-semibold tracking-tight md:text-6xl">Start your dashboard at the part only you can build</h1>
        <p className="mt-4 max-w-2xl text-base text-[var(--kora-muted)] md:text-lg">
          kora-ui gives React projects the same layout, tables, charts, sign-in, and settings screens, on phones and desktops, in light and dark.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild className="max-sm:flex-1"><Link href="/templates">See templates</Link></Button>
          <Button asChild variant="secondary" className="max-sm:flex-1"><Link href="/components">Browse components</Link></Button>
        </div>
        <div className="mt-6 max-w-md">
          <CodeBlock lang="bash" code="npm install kora-ui" />
        </div>
      </section>

      <section aria-label="Live dashboard" className="mx-auto max-w-[90rem] px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border border-[var(--kora-line-strong)]">
          <iframe title="Live analytics dashboard, built with kora-ui" src="/preview/dashboard" className="block h-[44rem] w-px min-w-full border-0 bg-[var(--kora-bg)]" />
        </div>
        <p className="mt-2 text-sm text-[var(--kora-muted)]">This is the real template running, not a screenshot. Open the menu, sort the table, or hover the charts.</p>
      </section>

      <section className="mx-auto grid max-w-[90rem] grid-cols-1 gap-10 px-4 py-14 lg:grid-cols-2 lg:px-6">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">{allComponents.length} components</h2>
          <ul className="mt-3 divide-y divide-[var(--kora-line)] border-y border-[var(--kora-line)]">
            {componentGroups.map((g) => (
              <li key={g.name}>
                <Link href={`/components#${g.name.toLowerCase()}`} className="flex items-baseline gap-3 py-3 text-sm hover:text-[var(--kora-accent)]">
                  <span className="w-20 shrink-0 font-medium">{g.name}</span>
                  <span className="min-w-0 truncate text-[var(--kora-muted)]">{g.items.map((i) => i.name).join(", ")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">{templateDocs.length} templates</h2>
          <ul className="mt-3 divide-y divide-[var(--kora-line)] border-y border-[var(--kora-line)]">
            {templateGroups.map((g) => (
              <li key={g}>
                <Link href={`/templates#${g.toLowerCase()}`} className="flex items-baseline gap-3 py-3 text-sm hover:text-[var(--kora-accent)]">
                  <span className="w-24 shrink-0 font-medium">{g}</span>
                  <span className="min-w-0 truncate text-[var(--kora-muted)]">{templateDocs.filter((t) => t.group === g).map((t) => t.name).join(", ")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

