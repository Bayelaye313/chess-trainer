import Link from "next/link";

/**
 * Carte d'aperçu "Corrigez vos gaffes" — raccourci vers les decks FSRS de
 * l'onglet Entraîner. `dueTotal` vient de `listDeckOverviews` (somme de
 * `dueCount + newCount` sur les 7 decks, voir `app/page.tsx`). Entrée animée
 * en CSS pur (`animate-fade-up-in`, voir `globals.css` et la note de
 * `components/ui/nav.tsx` sur Framer Motion).
 */
export function MistakesShortcutCard({ dueTotal }: { dueTotal: number }) {
  return (
    <Link
      href="/entrainer"
      className="animate-fade-up-in flex flex-col justify-between rounded-lg border border-border bg-surface p-5 transition-colors hover:border-accent/40"
    >
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-foreground-muted">
          Corrigez vos gaffes
        </p>
        <p className="mt-2 text-3xl font-semibold font-mono">{dueTotal}</p>
        <p className="mt-1 text-sm text-foreground-muted">
          {dueTotal > 0
            ? `carte${dueTotal > 1 ? "s" : ""} à réviser sur tes 7 decks FSRS`
            : "Aucune carte due — tout est à jour"}
        </p>
      </div>
      <span className="mt-4 text-sm font-medium text-accent">Réviser maintenant →</span>
    </Link>
  );
}
