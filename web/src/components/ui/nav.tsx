"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: (props: { active: boolean }) => React.ReactNode;
}

/**
 * Icônes sobres, SVG inline `currentColor` — même parti pris que `ThumbIcon`
 * dans `client/features/games/quality-badge.tsx` : pas de dépendance
 * d'icônes supplémentaire pour 6 glyphes.
 *
 * Transition d'onglet actif en CSS pur (`transition-colors`, pas de pastille
 * animée à glissement façon Framer Motion) : l'installation du paquet est
 * bloquée par le réseau de cet environnement (échec TLS systémique sur le
 * registre npm, pas propre à ce paquet) — voir `globals.css` pour les mêmes
 * transitions en CSS pur réutilisées ailleurs (toast, cartes d'accueil).
 */
function BotIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="4" y="9" width="16" height="11" rx="2" />
      <path d="M12 9V5M9 5h6" strokeLinecap="round" />
      <circle cx="12" cy="4" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="9" cy="14" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="15" cy="14" r="1.4" fill="currentColor" stroke="none" />
      <path d="M8 18h8" strokeLinecap="round" />
    </svg>
  );
}

function AnalyseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 20V10M12 20V4M20 20v-6" strokeLinecap="round" />
    </svg>
  );
}

function ReportIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 15l2.5-3 2 2L17 9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrainIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 3a9 9 0 1 0 9 9" strokeLinecap="round" />
      <path d="M12 3v5l4-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Toque de diplômé — l'académie thématique de l'onglet « Apprendre », distincte du casse-tête ponctuel qu'il remplace. */
function AcademyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="m2 9 10-5 10 5-10 5L2 9Z" strokeLinejoin="round" />
      <path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 9v6" strokeLinecap="round" />
    </svg>
  );
}

/** Livre ouvert — l'onglet « Ouvertures », distinct de la toque de l'académie « Apprendre ». */
function OpeningsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 6c-1.5-1.3-3.5-2-6-2v13c2.5 0 4.5.7 6 2 1.5-1.3 3.5-2 6-2V4c-2.5 0-4.5.7-6 2Z" strokeLinejoin="round" />
      <path d="M12 6v13" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </svg>
  );
}

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Jouer contre des Bots", icon: BotIcon },
  { href: "/analyse", label: "Analyse", icon: AnalyseIcon },
  { href: "/rapport", label: "Rapport", icon: ReportIcon },
  { href: "/entrainer", label: "Entraîner", icon: TrainIcon },
  { href: "/apprendre", label: "Apprendre", icon: AcademyIcon },
  { href: "/ouvertures", label: "Ouvertures", icon: OpeningsIcon },
  { href: "/plus", label: "Plus", icon: MoreIcon },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 py-3">
        <Link href="/" className="mr-4 shrink-0 font-semibold tracking-tight text-foreground">
          Chess Trainer
        </Link>
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors duration-200 ${
                active
                  ? "border-accent/40 bg-accent/10 text-foreground"
                  : "border-transparent text-foreground-muted hover:border-border hover:text-foreground"
              }`}
            >
              <Icon active={active} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
