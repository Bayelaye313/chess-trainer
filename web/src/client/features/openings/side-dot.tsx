import type { OpeningSide } from "@/core/curriculum/openings";

/** Petit disque Blancs/Noirs — même idée que les jetons de qualité, mais pour le camp d'une ligne d'ouverture. */
export function SideDot({ side }: { side: OpeningSide }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full border ${
        side === "white" ? "border-foreground/60 bg-white" : "border-transparent bg-black"
      }`}
    />
  );
}

export const SIDE_LABEL: Record<OpeningSide, string> = {
  white: "Blancs",
  black: "Noirs",
};
