import type { Metadata } from "next";
import Link from "next/link";
import { TemplateThumb } from "@/components/template-thumb";
import { templateDocs, templateGroups } from "@/lib/registry";

export const metadata: Metadata = { title: "Templates" };

export default function TemplatesIndex() {
  return (
    <main className="mx-auto max-w-[90rem] px-4 py-8 lg:px-6 lg:py-10">
      <h1 className="text-2xl font-semibold">Templates</h1>
      <p className="mt-2 max-w-2xl text-[var(--kora-muted)]">Complete screens that work out of the box. Pass your data and functions, and every project gets the same sign-in, settings, and error pages.</p>
      <div className="mt-8 grid gap-10">
        {templateGroups.map((group) => (
          <section key={group} id={group.toLowerCase()} className="scroll-mt-20">
            <h2 className="mb-3 text-base font-semibold">{group}</h2>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {templateDocs.filter((t) => t.group === group).map((t) => (
                <li key={t.slug} className="min-w-0">
                  <Link href={`/templates/${t.slug}`} className="group block overflow-hidden rounded-lg border border-[var(--kora-line)] bg-[var(--kora-surface)] hover:border-[var(--kora-line-strong)]">
                    <TemplateThumb slug={t.slug} name={t.name} />
                    <span className="block border-t border-[var(--kora-line)] p-3">
                      <span className="block text-sm font-medium group-hover:text-[var(--kora-accent)]">{t.name}</span>
                      <span className="mt-0.5 line-clamp-2 block text-[0.8125rem] text-[var(--kora-muted)]">{t.description}</span>
                    </span>
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

