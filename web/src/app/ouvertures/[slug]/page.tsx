import { notFound } from "next/navigation";
import { OpeningExplorer } from "@/client/features/openings/opening-explorer";
import { getOpeningDetail } from "@/server/queries/openings";

export default async function OpeningDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const detail = getOpeningDetail(slug);
  if (!detail) notFound();

  return <OpeningExplorer opening={detail.opening} plies={detail.plies} />;
}
