"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/auth/session";
import { runAdminAction, type AdminActionResult } from "@/server/admin/actions-core";

export type { AdminActionResult };

/** Chaque action revérifie le rôle admin côté serveur (404 sinon), comme le layout. */
async function act(targetId: string, action: "suspend" | "reactivate" | "revoke-sessions"): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  if (typeof targetId !== "string" || targetId.length === 0) return { ok: false, error: "Compte introuvable." };
  const result = runAdminAction({ id: admin.id, email: admin.email }, targetId, action);
  revalidatePath(`/admin/utilisateurs/${targetId}`);
  return result;
}

export async function suspendUser(targetId: string): Promise<AdminActionResult> {
  return act(targetId, "suspend");
}

export async function reactivateUser(targetId: string): Promise<AdminActionResult> {
  return act(targetId, "reactivate");
}

export async function revokeUserSessions(targetId: string): Promise<AdminActionResult> {
  return act(targetId, "revoke-sessions");
}
