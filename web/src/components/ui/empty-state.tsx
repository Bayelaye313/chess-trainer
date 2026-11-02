import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cx } from "./cx";

/** État vide ou d'échec : icône, une phrase, une action éventuelle. */
export function EmptyState({ icon: Icon, title, children, action, className }: { icon?: LucideIcon; title: ReactNode; children?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cx("flex flex-col items-start gap-2 rounded-lg border border-dashed border-border-strong px-4 py-5", className)}>
      {Icon && <Icon aria-hidden="true" className="size-5 text-foreground-subtle" />}
      <p className="font-medium text-foreground">{title}</p>
      {children && <p className="text-sm text-foreground-muted">{children}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
