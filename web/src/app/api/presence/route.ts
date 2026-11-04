import { NextResponse } from "next/server";
import { sessionUser } from "@/server/auth/session";
import { recordHeartbeat } from "@/server/presence/record";
import { parseSection } from "@/core/presence/metrics";
import { createRateLimiter } from "@/core/rate-limit";

/**
 * Battement de présence (toutes les 60 s, onglet visible). Le corps ne contient
 * QUE la section courante. Sans session : 401, rien n'est écrit. Au plus 4
 * battements par minute et par compte (changements de section compris).
 */
const globalForLimiter = globalThis as unknown as { __chessTrainerPresenceLimiter?: ReturnType<typeof createRateLimiter> };
const limiter = (globalForLimiter.__chessTrainerPresenceLimiter ??= createRateLimiter({ windowMs: 60_000, max: 4 }));

export async function POST(request: Request) {
  const user = await sessionUser();
  if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });

  const allowed = limiter.hit(user.id);
  if (!allowed.ok) {
    return NextResponse.json({ error: "Trop de battements." }, { status: 429, headers: { "Retry-After": String(Math.ceil(allowed.retryAfterMs / 1000)) } });
  }

  const body = (await request.json().catch(() => null)) as { section?: unknown } | null;
  const section = parseSection(body?.section);
  if (!section) return NextResponse.json({ error: "Section inconnue." }, { status: 400 });

  recordHeartbeat(user.id, section);
  return new NextResponse(null, { status: 204 });
}
