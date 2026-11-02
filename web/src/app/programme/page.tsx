import { EsportCanvas } from "@/components/ui/esport-page";
import { ProgrammeScreen } from "@/client/features/programme/programme-screen";
import { getProgrammeOverview } from "@/server/queries/programme";

export default async function ProgrammePage() {
  const overview = await getProgrammeOverview();
  return (
    <EsportCanvas>
      <ProgrammeScreen overview={overview} />
    </EsportCanvas>
  );
}
