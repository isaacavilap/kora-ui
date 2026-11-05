"use client";
import { demos } from "@/demos";

export function DemoRender({ slug }: { slug: string }) {
  const Demo = demos[slug];
  return Demo ? <Demo /> : null;
}

