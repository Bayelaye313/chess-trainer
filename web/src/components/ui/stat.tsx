import type { ReactNode } from "react";
import { cx } from "./cx";

/** Chiffre clé : grand nombre tabulaire, libellé dessous, détail optionnel. */
export function Stat({ label, value, hint, valueClassName, className }: { label: ReactNode; value: ReactNode; hint?: ReactNode; valueClassName?: string; className?: string }) {
  return (
    <div className={cx("min-w-0", className)}>
      <p className={cx("font-mono text-2xl font-medium text-foreground sm:text-3xl", valueClassName)}>{value}</p>
      <p className="mt-0.5 text-sm text-foreground-muted">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-foreground-subtle">{hint}</p>}
    </div>
  );
}
