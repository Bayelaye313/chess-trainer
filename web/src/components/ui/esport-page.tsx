import type { ReactNode } from "react";
import { PageHeader } from "./page-header";

/**
 * Conteneur de page. Ancien « canevas e-sport » : il redéfinissait les jetons
 * (double palette) et posait grille, halos et étincelles — tout cela est
 * supprimé (docs/redesign/direction.md). Le nom est gardé pour ne pas toucher
 * chaque route ; `detail` ne change plus rien et reste accepté.
 */
export function EsportCanvas({ children }: { children: ReactNode; detail?: boolean }) {
  return <div className="mx-auto w-full max-w-[1200px]">{children}</div>;
}

/** Ancien en-tête d'onglet : délègue à `PageHeader`. Le surtitre n'est plus affiché. */
export function EsportHeader({
  title,
  children,
  aside,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
  aside?: ReactNode;
}) {
  return <PageHeader title={title} description={children} action={aside} />;
}
