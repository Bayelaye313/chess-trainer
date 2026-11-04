import type { Metadata } from "next";
import { Compass } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Page introuvable" };

/** 404 de l'application : français, thème sombre, chemin de retour explicite. */
export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-start gap-4 py-12">
      <Compass aria-hidden="true" className="size-8 text-foreground-subtle" />
      <h1 className="font-display text-[26px] font-semibold sm:text-[32px]">Page introuvable</h1>
      <p className="text-foreground-muted">
        Cette adresse ne mène nulle part : la partie, l&apos;ouverture ou le piège demandé n&apos;existe pas (ou plus).
      </p>
      <div className="flex flex-wrap gap-2">
        <ButtonLink href="/" variant="primary">
          Retour à Aujourd&apos;hui
        </ButtonLink>
        <ButtonLink href="/rapport">Voir mes progrès</ButtonLink>
      </div>
    </div>
  );
}
