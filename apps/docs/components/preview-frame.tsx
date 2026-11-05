"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { KoraProvider, type LinkComponent, type Locale } from "kora-ui";
import { templates } from "@/templates";

export function PreviewFrame({ slug }: { slug: string }) {
  const locale: Locale = useSearchParams().get("locale") === "es" ? "es" : "en";
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  const PreviewLink = useMemo<LinkComponent>(() => {
    return function PreviewLink({ href, ...props }) {
      return <Link href={locale === "es" ? `${href}?locale=es` : href} {...props} />;
    };
  }, [locale]);
  const Template = templates[slug];
  return <KoraProvider locale={locale} linkComponent={PreviewLink}>{Template && <Template />}</KoraProvider>;
}

