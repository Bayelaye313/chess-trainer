import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";

export const metadata: Metadata = { title: "Confidentialité" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2 border-t border-border pt-5">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <div className="space-y-2 text-sm text-foreground-muted">{children}</div>
    </section>
  );
}

/** Ce qui est stocké, ce que l'administrateur voit, et comment tout effacer. */
export default async function ConfidentialitePage() {
  // Lu à l'exécution (et non figé au build) : l'adresse dépend de l'instance déployée.
  await connection();
  const contact = process.env.PRIVACY_CONTACT_EMAIL?.trim();
  return (
    <article className="space-y-6">
      <div>
        <h1 className="font-display text-[26px] leading-tight font-semibold sm:text-[32px]">Confidentialité</h1>
        <p className="mt-1 text-sm text-foreground-muted">Ce que Chess Trainer garde sur toi, et pourquoi.</p>
      </div>

      <Section title="Ce qui est stocké">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong className="text-foreground">Ton nom et ton email</strong>, transmis par Google à la connexion. Nous ne gardons aucun jeton d&apos;accès Google, et nous n&apos;affichons pas ta photo de profil.
          </li>
          <li>
            <strong className="text-foreground">Ton historique d&apos;entraînement</strong> : révisions, séances, progression dans les ouvertures, l&apos;Académie et le Programme.
          </li>
          <li>
            <strong className="text-foreground">Les parties importées</strong> depuis les comptes Chess.com ou Lichess que tu lies, et les parties jouées ici, avec leur analyse.
          </li>
          <li>Quelques préférences d&apos;affichage dans ton navigateur (son, dernier bot, position dans un cours). Elles sont effacées à la déconnexion.</li>
        </ul>
        <p>Ces données ne servent qu&apos;à ton entraînement. Elles ne sont ni vendues ni partagées.</p>
      </Section>

      <Section title="Ce que voit l'administrateur">
        <p>
          L&apos;administrateur voit des <strong className="text-foreground">métadonnées d&apos;usage</strong> : date d&apos;inscription, dernière connexion, temps passé sur l&apos;application, section ouverte en ce moment (Jouer, Ouvertures…) et appareil approximatif (navigateur et système).
        </p>
        <p>
          Il ne voit <strong className="text-foreground">jamais le contenu</strong> de tes parties, de tes erreurs ni de tes révisions. Il peut suspendre un compte ou fermer ses sessions, et chacune de ces actions est journalisée.
        </p>
      </Section>

      <Section title="Ton droit de suppression">
        <p>
          Dans le menu de ton compte (tes initiales, en haut à droite), « Supprimer mon compte » efface en une seule fois ton compte et toutes tes données personnelles. C&apos;est définitif.
        </p>
      </Section>

      <Section title="Contact">
        {contact ? (
          <p>
            Pour toute question sur tes données, ou pour exercer tes droits d&apos;accès, de rectification et de suppression, écris à{" "}
            <a href={`mailto:${contact}`} className="text-foreground underline underline-offset-4 hover:text-accent-hover">
              {contact}
            </a>
            .
          </p>
        ) : (
          <p>Pour toute question sur tes données, adresse-toi à l&apos;administrateur de cette instance.</p>
        )}
      </Section>

      <p className="border-t border-border pt-5 text-sm">
        <Link href="/connexion" className="inline-flex min-h-11 items-center text-foreground underline underline-offset-4 hover:text-accent-hover">
          Retour à la connexion
        </Link>
      </p>
    </article>
  );
}
