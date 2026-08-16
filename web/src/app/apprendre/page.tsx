import { LearnScreen } from "@/client/features/learn/learn-screen";
import { listCurriculumOverview } from "@/server/queries/curriculum";

export default async function ApprendrePage() {
  const categories = await listCurriculumOverview();

  return <LearnScreen initialCategories={categories} />;
}
