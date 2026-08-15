"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  /** Étape de la feuille de route à laquelle la section devient réelle. */
  step: number;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Accueil", step: 0 },
  { href: "/play", label: "Jouer", step: 2 },
  { href: "/import", label: "Importer", step: 3 },
  { href: "/games", label: "Mes parties", step: 4 },
  { href: "/insights", label: "Progrès", step: 5 },
  { href: "/practice", label: "Réviser", step: 6 },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-surface">
      <nav className="mx-auto flex max-w-6xl items-center gap-1 px-4 py-3">
        <Link href="/" className="mr-4 font-semibold tracking-tight">
          Chess Trainer
        </Link>
        {NAV_ITEMS.slice(1).map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                active
                  ? "bg-surface-muted text-foreground"
                  : "text-foreground-muted hover:bg-surface-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
