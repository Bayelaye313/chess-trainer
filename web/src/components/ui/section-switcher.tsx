"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "./cx";

export interface SectionLink {
  href: string;
  label: string;
}

/**
 * Sélecteur de section (contrôle segmenté) : les sous-pages d'une même
 * destination — ici Réviser · Académie · Pièges dans « S'entraîner ».
 * Ce sont des liens (chaque section a sa route), pas des onglets ARIA.
 */
export function SectionSwitcher({ links, label }: { links: readonly SectionLink[]; label: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className="mb-5 inline-flex max-w-full rounded-lg border border-border bg-surface p-1">
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cx(
              "inline-flex min-h-11 items-center rounded-md px-4 text-sm font-medium transition-colors",
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

export const TRAINING_SECTIONS: readonly SectionLink[] = [
  { href: "/entrainer", label: "Réviser" },
  { href: "/apprendre", label: "Académie" },
  { href: "/pieges", label: "Pièges" },
];
