import { useEffect, useRef, useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import { Tabs as R } from "radix-ui";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button, focusRing } from "./button";
import { Select } from "./form";
import { cn, KoraLink, useLabels } from "./provider";

export const Tabs = R.Root;

export function TabsList({ className, ...props }: ComponentProps<typeof R.List>) {
  return (
    <R.List
      className={cn("kr:flex kr:gap-1 kr:overflow-x-auto kr:border-b kr:border-line kr:[scrollbar-width:none]", className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof R.Trigger>) {
  return (
    <R.Trigger
      className={cn(
        "kr:-mb-px kr:h-[var(--kora-control-h)] kr:shrink-0 kr:cursor-pointer kr:whitespace-nowrap kr:border-b-2 kr:border-transparent kr:px-3 kr:text-sm kr:font-medium kr:text-muted kr:transition-colors kr:hover:text-fg",
        "kr:data-[state=active]:border-accent kr:data-[state=active]:text-fg",
        focusRing,
        "kr:focus-visible:-outline-offset-2",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: ComponentProps<typeof R.Content>) {
  return <R.Content className={cn("kr:pt-4 kr:outline-none kr:space-y-[var(--kora-gap)]", className)} {...props} />;
}

/** Page numbers around the current one, with gaps. Uses null to mark a gap. */
export function pageWindow(page: number, pageCount: number): Array<number | null> {
  const pages: Array<number | null> = [];
  let last = 0;
  for (let p = 1; p <= pageCount; p++) {
    if (p === 1 || p === pageCount || Math.abs(p - page) <= 1) {
      if (p - last > 1) pages.push(null);
      pages.push(p);
      last = p;
    }
  }
  return pages;
}

export function Pagination({ page, pageCount, onPageChange, className }: {
  /** Current page, starting at 1. */
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  const t = useLabels();
  return (
    <nav aria-label={t.page} className={cn("kr:flex kr:items-center kr:gap-1", className)}>
      <Button variant="ghost" size="icon" aria-label={t.previous} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        <ChevronLeft aria-hidden />
      </Button>
      <span className="kr:px-2 kr:text-[0.8125rem] kr:text-muted kr:tabular-nums kr:md:hidden">
        {page} {t.of} {pageCount}
      </span>
      <ul className="kr:hidden kr:items-center kr:gap-1 kr:md:flex">
        {pageWindow(page, pageCount).map((p, i) => (
          <li key={i}>
            {p === null ? (
              <span className="kr:px-1 kr:text-muted">…</span>
            ) : (
              <Button
                variant={p === page ? "secondary" : "ghost"}
                size="icon"
                aria-current={p === page ? "page" : undefined}
                className="kr:font-normal kr:tabular-nums"
                onClick={() => onPageChange(p)}
              >
                {p}
              </Button>
            )}
          </li>
        ))}
      </ul>
      <Button variant="ghost" size="icon" aria-label={t.next} disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
        <ChevronRight aria-hidden />
      </Button>
    </nav>
  );
}

export function Stepper({ steps, current, className }: {
  steps: ReactNode[];
  /** Index of the current step, starting at 0. */
  current: number;
  className?: string;
}) {
  const t = useLabels();
  return (
    <div className={className}>
      <div className="kr:md:hidden">
        <p className="kr:text-[0.8125rem] kr:text-muted">
          {t.step} {current + 1} {t.of} {steps.length}
        </p>
        <p className="kr:text-sm kr:font-medium kr:text-fg">{steps[current]}</p>
        <div className="kr:mt-2 kr:h-1 kr:rounded-full kr:bg-surface-2">
          <div className="kr:h-full kr:rounded-full kr:bg-accent" style={{ width: `${((current + 1) / steps.length) * 100}%` }} />
        </div>
      </div>
      <ol className="kr:hidden kr:items-center kr:gap-3 kr:md:flex">
        {steps.map((step, i) => (
          <li key={i} aria-current={i === current ? "step" : undefined} className="kr:flex kr:min-w-0 kr:flex-1 kr:items-center kr:gap-2 kr:last:flex-none">
            <span
              className={cn(
                "kr:flex kr:size-6 kr:shrink-0 kr:items-center kr:justify-center kr:rounded-full kr:text-xs kr:font-medium kr:tabular-nums",
                i < current && "kr:bg-accent kr:text-accent-fg",
                i === current && "kr:border-2 kr:border-accent kr:text-accent",
                i > current && "kr:bg-surface-2 kr:text-muted",
              )}
            >
              {i < current ? <Check aria-hidden className="kr:size-3.5" /> : i + 1}
            </span>
            <span className={cn("kr:truncate kr:text-sm", i === current ? "kr:font-medium kr:text-fg" : "kr:text-muted")}>{step}</span>
            {i < steps.length - 1 && <span aria-hidden className="kr:h-px kr:min-w-4 kr:flex-1 kr:bg-line" />}
          </li>
        ))}
      </ol>
    </div>
  );
}

export type BreadcrumbItem = { label: ReactNode; href?: string };

/** Page trail. On phones it keeps only the current page, so the top bar has room for its buttons. */
export function Breadcrumbs({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  const t = useLabels();
  return (
    <nav aria-label={t.breadcrumb} className={cn("kr:min-w-0", className)}>
      <ol className="kr:flex kr:min-w-0 kr:items-center kr:gap-1.5 kr:text-sm">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className={cn("kr:flex kr:min-w-0 kr:items-center kr:gap-1.5", !last && "kr:max-md:hidden")}>
              {i > 0 && <ChevronRight aria-hidden className="kr:size-3.5 kr:shrink-0 kr:text-muted kr:max-md:hidden" />}
              {item.href && !last ? (
                <KoraLink href={item.href} className={cn("kr:truncate kr:text-muted kr:hover:text-fg", focusRing)}>{item.label}</KoraLink>
              ) : (
                <span aria-current={last ? "page" : undefined} className={cn("kr:truncate", last ? "kr:font-medium kr:text-fg" : "kr:text-muted")}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export type NavSection = { id: string; label: string };

/**
 * Jumps between the sections of a long page, and marks the one on screen.
 * A sticky list from 1024px, and a select below that. Give each section a matching `id`, and `scroll-margin-top` if the topbar is sticky.
 */
export function SectionNav({ sections, className }: { sections: NavSection[]; className?: string }) {
  const t = useLabels();
  const [current, setCurrent] = useState(sections[0]?.id ?? "");
  // After a jump the short last section may never reach the band below, so the choice holds for a moment.
  const heldUntil = useRef(0);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible && Date.now() > heldUntil.current) setCurrent(visible.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    for (const section of sections) {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [sections]);

  return (
    <div className={cn("kr:min-w-0 kr:lg:sticky kr:lg:top-20 kr:lg:self-start", className)}>
      <div className="kr:lg:hidden">
        <Select
          aria-label={t.onThisPage}
          value={current}
          onValueChange={(id) => {
            heldUntil.current = Date.now() + 800;
            setCurrent(id);
            document.getElementById(id)?.scrollIntoView();
          }}
          options={sections.map((s) => ({ value: s.id, label: s.label }))}
        />
      </div>
      <nav aria-label={t.onThisPage} className="kr:hidden kr:lg:block">
        <ul className="kr:grid kr:gap-0.5">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                onClick={() => {
                  heldUntil.current = Date.now() + 800;
                  setCurrent(section.id);
                }}
                aria-current={current === section.id ? "true" : undefined}
                className={cn("kr:block kr:rounded-md kr:px-2.5 kr:py-1.5 kr:text-sm kr:text-muted kr:hover:bg-surface-2 kr:hover:text-fg kr:aria-[current]:bg-surface-2 kr:aria-[current]:font-medium kr:aria-[current]:text-fg", focusRing)}
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
