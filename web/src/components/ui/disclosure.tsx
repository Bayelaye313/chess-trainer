import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { cx } from "./cx";

/**
 * Bloc repliable natif (`<details>`) : accessible au clavier sans JS, état
 * conservé par le navigateur. `summary` = titre ; `meta` = compteur à droite.
 */
export function Disclosure({
  summary,
  meta,
  children,
  defaultOpen = false,
  className,
  id,
}: {
  summary: ReactNode;
  meta?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  id?: string;
}) {
  return (
    <details id={id} open={defaultOpen} className={cx("group border-t border-border", className)}>
      <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 py-2 text-left [&::-webkit-details-marker]:hidden">
        <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-foreground-subtle transition-transform duration-[var(--duration-base)] group-open:rotate-180" />
        <span className="min-w-0 flex-1 font-medium text-foreground">{summary}</span>
        {meta && <span className="shrink-0 text-sm text-foreground-muted">{meta}</span>}
      </summary>
      <div className="pb-4">{children}</div>
    </details>
  );
}
