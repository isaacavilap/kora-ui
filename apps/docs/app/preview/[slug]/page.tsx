import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PreviewFrame } from "@/components/preview-frame";
import { templateDocs } from "@/lib/registry";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const metadata: Metadata = { title: "Preview", description: "A kora-ui component preview, shown inside the docs.", robots: { index: false } };
export const generateStaticParams = () => templateDocs.map((t) => ({ slug: t.slug }));

export default async function Preview({ params }: Props) {
  const { slug } = await params;
  if (!templateDocs.some((t) => t.slug === slug)) notFound();
  return (
    <Suspense>
      <PreviewFrame slug={slug} />
    </Suspense>
  );
}

