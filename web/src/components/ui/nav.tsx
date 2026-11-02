"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChartLine,
  ChessKnight,
  BookOpen,
  CloudAlert,
  CloudCheck,
  Loader2,
  Settings,
  Sun,
  Target,
  type LucideIcon,
} from "lucide-react";
import { listPlatformLinks } from "@/server/actions/platform-link";
import { useSync } from "@/client/features/sync/sync-context";
import { cx } from "./cx";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Préfixes de routes rattachées à cette destination. */
  match: readonly string[];
}

/** Les 5 destinations (docs/redesign/direction.md §1). */
export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Aujourd'hui", icon: Sun, match: [] },
  { href: "/jouer", label: "Jouer", icon: ChessKnight, match: ["/jouer"] },
  { href: "/ouvertures", label: "Ouvertures", icon: BookOpen, match: ["/ouvertures"] },
  { href: "/entrainer", label: "S'entraîner", icon: Target, match: ["/entrainer", "/apprendre", "/pieges"] },
  { href: "/rapport", label: "Progrès", icon: ChartLine, match: ["/rapport", "/parties", "/analyse"] },
];

function isActive(item: NavItem, pathname: string): boolean {
  if (item.href === "/") return pathname === "/";
  return item.match.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

const SHORT_DATE = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/**
 * Pastille de synchronisation : seul reste de la synchro sur l'accueil.
 * Mène aux Réglages (comptes liés, erreurs par pseudo).
 */
function SyncPill() {
  const { state } = useSync();
  const [lastSynced, setLastSynced] = useState<Date | null | undefined>(undefined);
  const stamp = state.status === "ok" || state.status === "error" ? state.at.getTime() : 0;

  useEffect(() => {
    let ignore = false;
    listPlatformLinks()
      .then((links) => {
        if (ignore) return;
        const dates = links.map((link) => link.lastSyncedAt).filter((date): date is Date => date !== null);
        setLastSynced(links.length === 0 ? null : dates.length > 0 ? new Date(Math.max(...dates.map((d) => new Date(d).getTime()))) : new Date(0));
      })
      .catch(() => {
        if (!ignore) setLastSynced(undefined);
      });
    return () => {
      ignore = true;
    };
  }, [stamp]);

  let icon: LucideIcon = CloudCheck;
  let label: string;
  let tone = "text-foreground-muted";
  if (state.status === "error") {
    icon = CloudAlert;
    label = "Synchro en échec";
    tone = "text-warning";
  } else if (lastSynced === null) {
    label = "Lier un compte";
  } else if (state.status === "running" && lastSynced === undefined) {
    icon = Loader2;
    label = "Synchronisation…";
  } else if (lastSynced && lastSynced.getTime() > 0) {
    label = `Synchronisé le ${SHORT_DATE.format(lastSynced)}`;
  } else {
    label = "Pas encore synchronisé";
  }
  const Icon = icon;

  return (
    <Link
      href="/plus#comptes"
      title={state.status === "error" ? state.message : "Comptes liés et synchronisation"}
      className={cx("inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-xs hover:bg-surface-muted hover:text-foreground", tone)}
    >
      <Icon aria-hidden="true" className={cx("size-4 shrink-0", Icon === Loader2 && "animate-spin")} />
      <span className="max-w-[46vw] truncate">{label}</span>
    </Link>
  );
}

export function Nav() {
  const pathname = usePathname();
  const settingsActive = pathname === "/plus";

  return (
    <>
      <header className="sticky top-0 z-40 h-[var(--header-h)] border-b border-border bg-background">
        <div className="flex h-full items-center gap-1 px-[var(--space-page)] md:px-5">
          <Link href="/" className="mr-auto inline-flex min-h-11 items-center gap-2 rounded-md text-foreground" aria-label="Chess Trainer — Aujourd'hui">
            <ChessKnight aria-hidden="true" className="size-6 text-accent" />
            <span className="font-display text-base font-semibold tracking-tight whitespace-nowrap sm:text-lg">Chess Trainer</span>
          </Link>
          <SyncPill />
          <Link
            href="/plus"
            aria-label="Réglages"
            title="Réglages"
            aria-current={settingsActive ? "page" : undefined}
            className={cx(
              "inline-flex size-11 items-center justify-center rounded-md hover:bg-surface-muted hover:text-foreground",
              settingsActive ? "text-foreground" : "text-foreground-muted",
            )}
          >
            <Settings aria-hidden="true" className="size-5" />
          </Link>
        </div>
      </header>

      <nav
        aria-label="Navigation principale"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:inset-y-0 md:right-auto md:left-0 md:w-[var(--rail-w)] md:border-t-0 md:border-r md:top-[var(--header-h)] md:pt-3 md:pb-0"
      >
        <ul className="grid h-[var(--tabbar-h)] grid-cols-5 md:h-auto md:grid-cols-1 md:gap-1 md:px-2">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item, pathname);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "flex h-full min-h-11 flex-col items-center justify-center gap-1 rounded-md px-1 text-[11px] leading-tight font-medium transition-colors md:min-h-16 md:py-2 md:text-xs",
                    active ? "text-foreground" : "text-foreground-muted hover:text-foreground",
                  )}
                >
                  <span
                    className={cx(
                      "inline-flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                      active ? "bg-surface-raised text-accent" : "",
                    )}
                  >
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <span className="text-center">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
