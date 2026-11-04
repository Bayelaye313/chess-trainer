"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/components/ui/cx";

const LINKS = [
  { href: "/admin", label: "Tableau de bord", exact: true },
  { href: "/admin/utilisateurs", label: "Utilisateurs", exact: false },
  { href: "/admin/journal", label: "Journal", exact: false },
] as const;

/** Sous-navigation de l'espace admin (même contrôle segmenté que S'entraîner). */
export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Administration" className="mb-6 inline-flex max-w-full overflow-x-auto rounded-lg border border-border bg-surface p-1">
      {LINKS.map((link) => {
        const active = link.exact ? pathname === link.href : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cx(
              "inline-flex min-h-11 items-center rounded-md px-4 text-sm font-medium whitespace-nowrap transition-colors",
              active ? "bg-surface-raised text-foreground" : "text-foreground-muted hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
