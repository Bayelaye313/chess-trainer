import type { Metadata } from "next";
import { PlayScreen } from "@/client/features/play/play-screen";
import { PageHeader } from "@/components/ui/page-header";
import { getDailySessionState, listBotStartLines } from "@/server/queries/daily-plan";

export const metadata: Metadata = { title: "Jouer" };
// Le plan du jour appliqué change les lignes imposées : jamais figé au build.
export const dynamic = "force-dynamic";

/**
 * Jouer contre un bot. `?rejouer=1` (raccourci de l'accueil) relance aussitôt
 * une partie avec le dernier réglage mémorisé.
 */
export default async function JouerPage({ searchParams }: { searchParams: Promise<{ rejouer?: string }> }) {
  const { rejouer } = await searchParams;
  const sessionState = await getDailySessionState();
  // Plan du jour appliqué → lignes que le bot imposera (vide hors session ou sans « Ouvertures »/« Pièges »).
  const startLines = listBotStartLines(sessionState?.session ?? null);

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <PageHeader title="Jouer" description="Une partie contre Stockfish, commentée coup par coup par le coach." />
      <PlayScreen startLines={startLines} autoStart={rejouer === "1"} />
    </div>
  );
}
