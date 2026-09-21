"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./nav.module.css";

interface NavItem {
  href: string;
  label: string;
  icon: ComponentType;
}

function BotIcon() { return <svg viewBox="0 0 24 24" className={styles.icon} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="4" y="9" width="16" height="11" rx="2" /><path d="M12 9V5M9 5h6" strokeLinecap="round" /><circle cx="12" cy="4" r="1.4" fill="currentColor" stroke="none" /><circle cx="9" cy="14" r="1.4" fill="currentColor" stroke="none" /><circle cx="15" cy="14" r="1.4" fill="currentColor" stroke="none" /><path d="M8 18h8" strokeLinecap="round" /></svg>; }
function ReportIcon() { return <svg viewBox="0 0 24 24" className={styles.icon} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 15l2.5-3 2 2L17 9" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function TrainIcon() { return <svg viewBox="0 0 24 24" className={styles.icon} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9" strokeLinecap="round" /><path d="M12 3v5l4-2" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function AcademyIcon() { return <svg viewBox="0 0 24 24" className={styles.icon} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m2 9 10-5 10 5-10 5L2 9Z" strokeLinejoin="round" /><path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M22 9v6" strokeLinecap="round" /></svg>; }
function OpeningsIcon() { return <svg viewBox="0 0 24 24" className={styles.icon} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M12 6c-1.5-1.3-3.5-2-6-2v13c2.5 0 4.5.7 6 2 1.5-1.3 3.5-2 6-2V4c-2.5 0-4.5 2-6 2Z" strokeLinejoin="round" /><path d="M12 6v13" /></svg>; }

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Jouer contre des Bots", icon: BotIcon },
  { href: "/rapport", label: "Rapport", icon: ReportIcon },
  { href: "/entrainer", label: "Entraîner", icon: TrainIcon },
  { href: "/apprendre", label: "Apprendre", icon: AcademyIcon },
  { href: "/ouvertures", label: "Ouvertures", icon: OpeningsIcon },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Navigation principale">
        <Link href="/" className={styles.brand} aria-label="Chess Trainer — Jouer contre des Bots">
          <span className={styles.brandMark} aria-hidden="true">♞</span>
          <span className={styles.brandCopy}><strong>Chess Trainer</strong><small>E-sports academy</small></span>
        </Link>
        <div className={styles.items}>
          {NAV_ITEMS.map((item, index) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`${styles.item} ${active ? styles.active : ""}`}>
              <span className={styles.itemIcon}><Icon /></span><span className={styles.index}>{String(index + 1).padStart(2, "0")}</span><span>{item.label}</span>
            </Link>;
          })}
        </div>
        <div className={styles.status}><span className={styles.session}>Session locale</span><span className={styles.level}>NIV. 07</span><span className={styles.xp}><span /></span></div>
      </nav>
    </header>
  );
}
