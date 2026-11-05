"use client";
import { useState, type ReactNode } from "react";
import { Button, Select, Tabs, TabsContent, TabsList, TabsTrigger } from "kora-ui";
import { ExternalLink, Monitor, Smartphone, Tablet } from "lucide-react";

const widths = [
  { id: "desktop", label: "Desktop", icon: Monitor, width: "100%" },
  { id: "tablet", label: "Tablet", icon: Tablet, width: "768px" },
  { id: "phone", label: "Phone", icon: Smartphone, width: "390px" },
];

export function TemplateViewer({ slug, name, code }: { slug: string; name: string; code: ReactNode }) {
  const [width, setWidth] = useState("desktop");
  const [locale, setLocale] = useState("en");
  const src = `/preview/${slug}?locale=${locale}`;
  const current = widths.find((w) => w.id === width)!;
  return (
    <Tabs defaultValue="preview">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-[var(--kora-line)]">
        <TabsList className="border-b-0">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-1 pb-1">
          <div role="group" aria-label="Preview width" className="hidden gap-1 md:flex">
            {widths.map((w) => (
              <Button key={w.id} variant={w.id === width ? "secondary" : "ghost"} size="icon" aria-label={w.label} aria-pressed={w.id === width} onClick={() => setWidth(w.id)}>
                <w.icon aria-hidden />
              </Button>
            ))}
          </div>
          <Select aria-label="Language" className="w-28" value={locale} onValueChange={setLocale} options={[{ value: "en", label: "English" }, { value: "es", label: "Español" }]} />
          <Button asChild variant="ghost" size="icon" aria-label={`Open ${name} in a new tab`}>
            <a href={src} target="_blank" rel="noreferrer"><ExternalLink aria-hidden /></a>
          </Button>
        </div>
      </div>
      <TabsContent value="preview">
        <div className="flex justify-center overflow-hidden rounded-lg border border-[var(--kora-line)] bg-[var(--kora-surface-2)]">
          <iframe key={src} title={`${name} preview`} src={src} className="h-[75dvh] min-h-[32rem] max-w-full border-0 bg-[var(--kora-bg)] transition-[width]" style={{ width: current.width }} />
        </div>
      </TabsContent>
      <TabsContent value="code">{code}</TabsContent>
    </Tabs>
  );
}

