import { OpeningsScreen } from "@/client/features/openings/openings-screen";
import { listOpenings } from "@/server/queries/openings";

export default function OuverturesPage() {
  return <OpeningsScreen openings={listOpenings()} />;
}
