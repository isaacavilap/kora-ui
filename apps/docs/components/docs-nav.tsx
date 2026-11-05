"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { componentGroups } from "@/lib/registry";

export function DocsNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Components" className="grid gap-5">
      {componentGroups.map((group) => (
        <div key={group.name}>
          <p className="mb-1 text-xs text-[var(--kora-muted)]">{group.name}</p>
          <ul>
            {group.items.map((item) => {
              const href = `/components/${item.slug}`;
              return (
                <li key={item.slug}>
                  <Link
                    href={href}
                    aria-current={pathname === href ? "page" : undefined}
                    className="-mx-2 flex h-11 items-center rounded-md px-2 text-sm text-[var(--kora-muted)] hover:text-[var(--kora-fg)] aria-[current=page]:bg-[var(--kora-accent-soft)] aria-[current=page]:font-medium aria-[current=page]:text-[var(--kora-accent)] md:h-8"
                  >
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

