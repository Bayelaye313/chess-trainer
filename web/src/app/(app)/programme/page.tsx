import type { Metadata } from "next";
import { requireUser } from "@/server/auth/session";
import { EsportCanvas } from "@/components/ui/esport-page";
import { ProgrammeScreen } from "@/client/features/programme/programme-screen";
import { getProgrammeOverview } from "@/server/queries/programme";

export const metadata: Metadata = { title: "Programme 1000 heures" };
// La progression (jour, séances, rétention) change à chaque séance : lu à chaque requête.
export const dynamic = "force-dynamic";

export default async function ProgrammePage() {
  const { id: userId } = await requireUser();
  const overview = await getProgrammeOverview(userId);
  return (
    <EsportCanvas>
      <ProgrammeScreen overview={overview} />
    </EsportCanvas>
  );
}
