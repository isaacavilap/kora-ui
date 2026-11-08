import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CodeBlock, Highlighted } from "@/components/code-block";
import { DemoRender } from "@/components/demo-render";
import { DemoTabs } from "@/components/demo-tabs";
import { allComponents } from "@/lib/registry";
import { readSource } from "@/lib/source";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => allComponents.map((c) => ({ slug: c.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = allComponents.find((c) => c.slug === slug);
  return { title: doc?.name, description: doc?.description, alternates: { canonical: `/components/${slug}` } };
}

export default async function ComponentPage({ params }: Props) {
  const { slug } = await params;
  const doc = allComponents.find((c) => c.slug === slug);
  if (!doc) notFound();
  const names = doc.name.split(" and ").join(", ");
  return (
    <main className="px-4 py-8 lg:px-10 lg:py-10">
      <h1 className="text-2xl font-semibold">{doc.name}</h1>
      <p className="mt-2 max-w-2xl text-[var(--kora-muted)]">{doc.description}{doc.notes && ` ${doc.notes}`}</p>
      <div className="mt-4">
        <CodeBlock code={`import { ${names} } from "${doc.from}";`} />
      </div>
      <div className="mt-6">
        <DemoTabs preview={<DemoRender slug={slug} />} code={<Highlighted html={await readSource("demos", slug)} />} />
      </div>
      {doc.props && (
        <section className="mt-10">
          <h2 className="mb-3 text-base font-semibold">Key props</h2>
          <dl className="prop-table divide-y divide-[var(--kora-line)] border-y border-[var(--kora-line)] text-sm">
            {doc.props.map((p) => (
              <div key={p.name} className="grid gap-1 py-3 md:grid-cols-[14rem_1fr] md:gap-4">
                <dt>
                  <code className="font-medium">{p.name}</code>
                  <code className="mt-0.5 block text-[var(--kora-muted)]">{p.type}</code>
                </dt>
                <dd className="text-[var(--kora-muted)]">{p.description}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </main>
  );
}

