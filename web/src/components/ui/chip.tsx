import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cx } from "./cx";

export type ChipTone = "neutral" | "success" | "warning" | "danger" | "info" | "accent";

const TONE: Record<ChipTone, string> = {
  neutral: "border-border-strong text-foreground-muted",
  success: "border-success/40 text-success",
  warning: "border-warning/40 text-warning",
  danger: "border-danger/40 text-danger",
  info: "border-info/40 text-info",
  accent: "border-accent/50 text-accent",
};

/** Pastille de statut : toujours une icône ET un libellé, jamais la couleur seule. */
export function Chip({ icon: Icon, tone = "neutral", children, className }: { icon?: LucideIcon; tone?: ChipTone; children: ReactNode; className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap", TONE[tone], className)}>
      {Icon && <Icon aria-hidden="true" className="size-3.5 shrink-0" />}
      {children}
    </span>
  );
}
