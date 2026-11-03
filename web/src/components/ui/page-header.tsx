import type { ReactNode } from "react";
import { cx } from "./cx";

/**
 * En-tête de page unique : titre (Fraunces, ≤ 28 px sur mobile), UNE phrase
 * de contexte au plus, action optionnelle à droite. Pas de surtitre numéroté.
 */
export function PageHeader({
  title,
  description,
  action,
  back,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  back?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cx("flex flex-col gap-3 pb-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6", className)}>
      <div className="min-w-0">
        {back && <div className="mb-2">{back}</div>}
        <h1 className="font-display text-[26px] leading-tight font-semibold tracking-[-0.01em] text-foreground sm:text-[32px]">{title}</h1>
        {description && <p className="mt-1 max-w-[62ch] text-sm text-foreground-muted">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
    </header>
  );
}

/** Titre de section : hiérarchie par taille et poids, sans encadré. */
export function SectionTitle({ children, action, id, className }: { children: ReactNode; action?: ReactNode; id?: string; className?: string }) {
  return (
    <div className={cx("mb-3 flex items-baseline justify-between gap-3", className)}>
      <h2 id={id} className="font-display text-lg font-semibold text-foreground">
        {children}
      </h2>
      {action}
    </div>
  );
}
