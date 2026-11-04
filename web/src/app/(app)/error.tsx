"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";

/** Erreur d'un écran : message en français, nouvel essai, retour à l'accueil. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="mx-auto flex max-w-lg flex-col items-start gap-4 py-12">
      <TriangleAlert aria-hidden="true" className="size-8 text-warning" />
      <h1 className="font-display text-[26px] font-semibold sm:text-[32px]">Cet écran n&apos;a pas pu s&apos;afficher</h1>
      <p className="text-foreground-muted">
        Une erreur est survenue pendant le chargement. Tes données ne sont pas touchées : réessaie, ou repars de l&apos;accueil.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" onClick={reset}>
          Réessayer
        </Button>
        <ButtonLink href="/">Retour à Aujourd&apos;hui</ButtonLink>
      </div>
    </div>
  );
}
