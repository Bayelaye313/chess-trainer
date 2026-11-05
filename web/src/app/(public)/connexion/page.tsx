import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/server/auth/session";
import { signInWithGoogle } from "@/server/actions/account";

export const metadata: Metadata = { title: "Connexion" };
export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  unverified: "Ton adresse Google n'est pas vérifiée. Vérifie-la chez Google, puis réessaie.",
  suspended: "Ce compte est suspendu. Contacte l'administrateur si tu penses que c'est une erreur.",
  "not-allowed": "Les inscriptions sont fermées pour cette adresse.",
  AccessDenied: "Connexion refusée.",
  OAuthAccountNotLinked: "Cette adresse est déjà liée à un autre mode de connexion.",
  CredentialsSignin: "Connexion refusée (compte suspendu ou non autorisé).",
};

/** Seul écran visible sans session : un bouton Google, une phrase sur les données. */
export default async function ConnexionPage({ searchParams }: PageProps<"/connexion">) {
  const params = await searchParams;
  if (await getCurrentUser()) redirect("/");

  const errorCode = typeof params.erreur === "string" ? params.erreur : typeof params.error === "string" ? params.error : null;
  const error = errorCode ? (ERRORS[errorCode] ?? "La connexion n'a pas abouti. Réessaie.") : null;
  const suite = typeof params.suite === "string" ? params.suite : "/";
  const deleted = params.compte === "supprime";
  // Connexion de développement : importée seulement sous `next dev`. Au build de
  // production, NODE_ENV est une constante et cette branche (et le composant)
  // disparaît du bundle.
  const DevLoginForm =
    process.env.NODE_ENV === "development" && process.env.DEV_LOGIN === "1" ? (await import("@/client/features/auth/dev-login-form")).DevLoginForm : null;

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="font-display text-[26px] leading-tight font-semibold sm:text-[32px]">Connexion</h1>
        <p className="mt-1 text-sm text-foreground-muted">Analyse tes parties, révise tes erreurs, suis ton programme.</p>
      </div>

      {deleted && (
        <p role="status" className="rounded-md border border-border bg-surface-muted px-3 py-2 text-sm text-foreground">
          Ton compte et toutes tes données ont été supprimés.
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-md border border-blunder/50 bg-blunder/15 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <Card className="space-y-4">
        <form action={signInWithGoogle}>
          <input type="hidden" name="suite" value={suite} />
          <Button type="submit" variant="primary" className="w-full">
            Continuer avec Google
          </Button>
        </form>
        <p className="text-sm text-foreground-muted">
          Nous gardons ton nom, ton email et ton historique d&apos;entraînement, pour toi seul. Détails dans la{" "}
          <Link href="/confidentialite" className="text-foreground underline underline-offset-4 hover:text-accent-hover">
            page de confidentialité
          </Link>
          .
        </p>
      </Card>

      {DevLoginForm && <DevLoginForm suite={suite} />}
    </div>
  );
}
