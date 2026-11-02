import { FileQuestion } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

/**
 * Partie introuvable ou sans coups enregistrés (anciennes parties contre le
 * bot, enregistrées sans PGN) : message explicite au lieu de la 404 générique.
 */
export default function GameNotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-start gap-4 py-12">
      <FileQuestion aria-hidden="true" className="size-8 text-foreground-subtle" />
      <h1 className="font-display text-[26px] font-semibold sm:text-[32px]">Revue indisponible</h1>
      <p className="text-foreground-muted">
        Cette partie n&apos;existe plus, ou ses coups n&apos;ont pas été enregistrés (certaines anciennes parties contre le bot) : il n&apos;y a rien à rejouer.
      </p>
      <div className="flex flex-wrap gap-2">
        <ButtonLink href="/parties" variant="primary">
          Mes parties
        </ButtonLink>
        <ButtonLink href="/jouer">Jouer une partie</ButtonLink>
      </div>
    </div>
  );
}
