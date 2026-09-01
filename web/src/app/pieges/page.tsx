import { PiegesScreen } from "@/client/features/openings/pieges-screen";
import { listAllTraps } from "@/server/queries/traps";

export default async function PiegesPage() {
  const traps = await listAllTraps();
  return <PiegesScreen traps={traps} />;
}
