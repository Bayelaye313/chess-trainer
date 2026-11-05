import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { adminAudit, sessions, users, type AdminAuditAction } from "@/server/db/schema";

export type AdminActionResult = { ok: true; message: string } | { ok: false; error: string };

interface Actor {
  id: string;
  email: string | null;
}

/**
 * Actions d'administration, chacune journalisée dans `admin_audit` (qui, quoi,
 * sur qui, quand) dans la même transaction que l'effet. Un admin n'agit jamais
 * sur son propre compte. Le rôle, lui, ne se change pas ici : il découle de
 * `ADMIN_EMAILS` à chaque connexion.
 */
export function runAdminAction(actor: Actor, targetId: string, action: Extract<AdminAuditAction, "suspend" | "reactivate" | "revoke-sessions">, now = new Date()): AdminActionResult {
  if (actor.id === targetId) return { ok: false, error: "Tu ne peux pas agir sur ton propre compte." };
  const target = db.select({ id: users.id, email: users.email, status: users.status }).from(users).where(eq(users.id, targetId)).get();
  if (!target) return { ok: false, error: "Compte introuvable." };
  if (action === "suspend" && target.status === "suspended") return { ok: false, error: "Ce compte est déjà suspendu." };
  if (action === "reactivate" && target.status === "active") return { ok: false, error: "Ce compte est déjà actif." };

  return db.transaction((tx) => {
    let revoked = 0;
    if (action === "suspend") {
      tx.update(users).set({ status: "suspended" }).where(eq(users.id, targetId)).run();
      revoked = tx.delete(sessions).where(eq(sessions.userId, targetId)).run().changes;
    } else if (action === "reactivate") {
      tx.update(users).set({ status: "active" }).where(eq(users.id, targetId)).run();
    } else {
      revoked = tx.delete(sessions).where(eq(sessions.userId, targetId)).run().changes;
    }
    tx.insert(adminAudit)
      .values({ actorId: actor.id, actorEmail: actor.email, action, targetId, targetEmail: target.email, detail: { sessionsRevoked: revoked }, createdAt: now })
      .run();
    const messages = {
      suspend: `Compte suspendu, ${revoked} session(s) fermée(s).`,
      reactivate: "Compte réactivé.",
      "revoke-sessions": `${revoked} session(s) fermée(s).`,
    } as const;
    return { ok: true as const, message: messages[action] };
  });
}
