import type { Metadata } from "next";
import { requireUser } from "@/server/auth/session";
import { SectionSwitcher, TRAINING_SECTIONS } from "@/components/ui/section-switcher";
import { PiegesScreen } from "@/client/features/openings/pieges-screen";
import { displayOpeningName } from "@/client/features/openings/opening-display";
import { repertoireTrapFamilies } from "@/core/curriculum/trap-repertoire";
import { listAllTraps } from "@/server/queries/traps";

export const metadata: Metadata = { title: "Pièges" };
export const dynamic = "force-dynamic";

export default async function PiegesPage() {
  await requireUser();
  const traps = await listAllTraps();
  const families = [...new Set(traps.map((trap) => trap.family))];
  return (
    <div className="mx-auto w-full max-w-[1000px]">
      <SectionSwitcher links={TRAINING_SECTIONS} label="Sections de S'entraîner" />
      <PiegesScreen traps={traps} repertoireFamilies={repertoireTrapFamilies(families, displayOpeningName)} />
    </div>
  );
}
