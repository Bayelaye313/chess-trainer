import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { claimLegacyData } from "@/server/db/user-scope";
import { decideSignIn, normalizeEmail, readAccessConfig, roleForEmail, type SignInDecision } from "@/core/auth/policy";

/** Relu à chaque appel : modifier `ADMIN_EMAILS` puis redémarrer suffit. */
export function accessConfig() {
  return readAccessConfig(process.env);
}

/** Décide si cet email peut se connecter (compte existant) ou s'inscrire (compte neuf). */
export async function checkSignIn(email: string | null | undefined, emailVerified: boolean): Promise<SignInDecision> {
  const existing = email
    ? await db.select({ status: users.status }).from(users).where(eq(users.email, normalizeEmail(email))).get()
    : undefined;
  return decideSignIn({ email, emailVerified, existingStatus: existing?.status ?? null }, accessConfig());
}

/**
 * Après chaque connexion réussie : rôle recalculé depuis `ADMIN_EMAILS`
 * (retirer un email rétrograde le compte), date de dernière connexion, puis
 * reprise des données mono-utilisateur si c'est le compte `LEGACY_CLAIM_EMAIL`
 * (une seule fois pour toute l'instance, voir `claimLegacyData`).
 */
export async function onSignedIn(userId: string): Promise<void> {
  const user = await db.select({ email: users.email }).from(users).where(eq(users.id, userId)).get();
  if (!user?.email) return;
  await db
    .update(users)
    .set({ role: roleForEmail(user.email, accessConfig()), lastLoginAt: new Date() })
    .where(eq(users.id, userId))
    .run();

  const claim = claimLegacyData(userId, user.email, process.env.LEGACY_CLAIM_EMAIL);
  if (claim.claimed) {
    const total = Object.values(claim.counts).reduce((sum, n) => sum + n, 0);
    console.info(`[auth] reprise des données mono-utilisateur : ${total} ligne(s) rattachée(s) au compte ${userId}`);
  }
}
