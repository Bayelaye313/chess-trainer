import type { ComponentProps } from "react";
import { cx } from "./cx";

/**
 * Surface de premier niveau. Jamais imbriquée dans une autre `Card` : à
 * l'intérieur, on sépare par des filets (`divide-y`) ou par l'espacement.
 */
export function Card({ className, as: Tag = "section", ...props }: Omit<ComponentProps<"section">, "ref"> & { as?: "section" | "div" | "article" }) {
  return <Tag className={cx("rounded-lg border border-border bg-surface p-4 sm:p-5", className)} {...props} />;
}
