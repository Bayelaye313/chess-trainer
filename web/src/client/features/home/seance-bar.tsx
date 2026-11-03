"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { advanceSeance, readSeanceQueue, SEANCE_EVENT, writeSeanceQueue, type SeanceQueue } from "./seance-queue";

/**
 * Barre de la séance du jour, affichée hors de l'accueil tant qu'une séance
 * lancée par « Continuer » a des actions restantes : 1 clic pour passer à
 * la suivante, sans retour manuel à l'accueil.
 */
export function SeanceBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [queue, setQueue] = useState<SeanceQueue | null>(null);

  useEffect(() => {
    const sync = () => setQueue(readSeanceQueue());
    sync();
    window.addEventListener(SEANCE_EVENT, sync);
    return () => window.removeEventListener(SEANCE_EVENT, sync);
  }, [pathname]);

  if (!queue || pathname === "/") return null;
  const position = queue.index + 1;
  const next = queue.items[queue.index + 1];

  return (
    <div data-skip-audit className="mx-auto mb-5 flex w-full max-w-[1200px] flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm">
      <span className="font-medium">Séance du jour</span>
      <span className="font-mono text-foreground-muted">
        {position}/{queue.items.length}
      </span>
      <span className="min-w-0 flex-1 truncate text-foreground-muted">{next ? `Ensuite : ${next.label}` : "Dernière action"}</span>
      <Button
        size="md"
        variant={next ? "primary" : "secondary"}
        onClick={() => {
          const href = advanceSeance();
          router.push(href ?? "/");
        }}
      >
        {next ? "Action suivante" : "Terminer"}
        <ArrowRight aria-hidden="true" />
      </Button>
      <Button size="md" variant="ghost" aria-label="Quitter la séance" onClick={() => writeSeanceQueue(null)} className="px-2">
        <X aria-hidden="true" />
      </Button>
    </div>
  );
}
