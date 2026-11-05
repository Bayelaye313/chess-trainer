import { NextResponse } from "next/server";
import { sessionUser } from "@/server/auth/session";
import { getOnlineSnapshot } from "@/server/admin/stats";

export const dynamic = "force-dynamic";

/** « En ligne maintenant » (rafraîchi toutes les 30 s). Réservé aux admins : 404 pour tout autre. */
export async function GET() {
  const user = await sessionUser();
  if (!user || user.role !== "admin") return new NextResponse(null, { status: 404 });
  return NextResponse.json(await getOnlineSnapshot(), { headers: { "Cache-Control": "no-store" } });
}
