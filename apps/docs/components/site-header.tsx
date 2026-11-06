"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button, Sheet, SheetContent, ThemeToggle } from "kora-ui";
import { Menu } from "lucide-react";
import { Logo } from "@/templates/logo";
import { DocsNav } from "./docs-nav";

const links = [
  { href: "/docs", label: "Get started" },
  { href: "/components", label: "Components" },
  { href: "/templates", label: "Templates" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--kora-line)] bg-[var(--kora-surface)]">
      <div className="mx-auto flex h-14 max-w-[90rem] items-center gap-1 px-2 lg:px-6">
        <Button variant="ghost" size="icon" aria-label="Open navigation" className="md:hidden" onClick={() => setOpen(true)}>
          <Menu aria-hidden />
        </Button>
        <Link href="/" className="mr-5 flex items-center gap-2 rounded-sm px-1 text-sm font-semibold">
          <Logo />
          kora-ui
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={pathname.startsWith(l.href) ? "page" : undefined}
              className="rounded-md px-3 py-2 text-sm text-[var(--kora-muted)] hover:text-[var(--kora-fg)] aria-[current=page]:font-medium aria-[current=page]:text-[var(--kora-fg)]"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <a href="https://github.com/isaacavilap/kora-ui">GitHub</a>
          </Button>
          <ThemeToggle />
        </div>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" title="kora-ui">
          <div className="grid gap-5" onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)}>
            <nav aria-label="Mobile" className="grid">
              {links.map((l) => (
                <Link key={l.href} href={l.href} className="flex h-11 items-center text-sm font-medium">{l.label}</Link>
              ))}
            </nav>
            {pathname.startsWith("/components") && <DocsNav />}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}

