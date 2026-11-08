import type { MetadataRoute } from "next";
import { allComponents, templateDocs } from "@/lib/registry";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/docs", "/components", "/templates", "/ai"];
  return [
    ...pages.map((p) => ({ url: `${SITE}${p}`, priority: p ? 0.8 : 1 })),
    ...allComponents.map((c) => ({ url: `${SITE}/components/${c.slug}`, priority: 0.6 })),
    ...templateDocs.map((t) => ({ url: `${SITE}/templates/${t.slug}`, priority: 0.5 })),
  ];
}
