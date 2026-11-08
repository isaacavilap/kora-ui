import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Highlighted } from "@/components/code-block";
import { TemplateViewer } from "@/components/template-viewer";
import { templateDocs } from "@/lib/registry";
import { readSource } from "@/lib/source";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => templateDocs.map((t) => ({ slug: t.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = templateDocs.find((t) => t.slug === slug);
  return { title: doc?.name, description: doc?.description, alternates: { canonical: `/templates/${slug}` } };
}

export default async function TemplatePage({ params }: Props) {
  const { slug } = await params;
  const doc = templateDocs.find((t) => t.slug === slug);
  if (!doc) notFound();
  // Free for now: everyone gets the preview and the code. Paid access (kora_access, lib/auth.ts) comes back with payments.
  const code = <Highlighted html={await readSource("templates", slug)} />;
  return (
    <main className="mx-auto max-w-[90rem] px-4 py-6 lg:px-6">
      <Link href="/templates" className="text-sm text-[var(--kora-muted)] hover:text-[var(--kora-fg)]">Templates</Link>
      <h1 className="mt-1 text-2xl font-semibold">{doc.name}</h1>
      <p className="mt-1 mb-4 max-w-2xl text-[var(--kora-muted)]">{doc.description}</p>
      <TemplateViewer slug={slug} name={doc.name} code={code} />
    </main>
  );
}

