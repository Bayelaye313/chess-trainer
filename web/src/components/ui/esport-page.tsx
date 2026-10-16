import type { ReactNode } from "react";
import styles from "./esport-page.module.css";

/**
 * Canevas e-sport des onglets principaux — même décor que l'onglet Apprendre
 * (`PlaybookLearnScreen`). Les jetons de thème y sont redéfinis : les cartes
 * Tailwind existantes prennent la palette sans modification. `detail` : pages
 * de détail qui gardent leur propre en-tête (pas d'`EsportHeader`).
 */
export function EsportCanvas({ children, detail = false }: { children: ReactNode; detail?: boolean }) {
  return (
    <div className={styles.canvas}>
      <div className={styles.ambientLine} aria-hidden="true" />
      <span className={styles.spark} aria-hidden="true" />
      <span className={`${styles.spark} ${styles.sparkPurple}`} aria-hidden="true" />
      <div className={`${styles.inner} ${detail ? styles.detail : ""}`}>{children}</div>
    </div>
  );
}

/** En-tête d'onglet : sur-titre mono, grand titre, chapeau, encart optionnel à droite. */
export function EsportHeader({
  eyebrow,
  title,
  children,
  aside,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <header className={styles.header}>
      <div>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1>{title}</h1>
        {children && <p className={styles.lede}>{children}</p>}
      </div>
      {aside && <div className={styles.aside}>{aside}</div>}
    </header>
  );
}
