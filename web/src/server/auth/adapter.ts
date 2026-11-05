import "server-only";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import type { Adapter } from "next-auth/adapters";
import { headers } from "next/headers";
import { db } from "@/server/db";
import { accounts, sessions, users, verificationTokens } from "@/server/db/schema";
import { describeDevice } from "@/core/auth/policy";

/** Appareil approximatif de la requête en cours, ou `null` hors requête. */
export async function currentDevice(): Promise<string | null> {
  try {
    return describeDevice((await headers()).get("user-agent"));
  } catch {
    return null;
  }
}

/**
 * Adaptateur Drizzle d'Auth.js, avec trois écarts :
 *
 * - `linkAccount` ne conserve **aucun jeton** Google (access, refresh, id) :
 *   l'application n'appelle aucune API Google après la connexion.
 * - `getSessionAndUser` **refuse la session d'un compte suspendu** et la
 *   supprime. Suspendre un compte coupe donc ses sessions dès la requête
 *   suivante, même si une session aurait survécu à la révocation.
 * - `createSession` enregistre l'appareil approximatif, que l'admin voit.
 */
export function createAdapter(): Adapter {
  const base = DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  });

  return {
    ...base,
    async linkAccount(account) {
      await db
        .insert(accounts)
        .values({
          userId: account.userId,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        })
        .run();
    },
    async createSession(data) {
      const device = await currentDevice();
      return db
        .insert(sessions)
        .values({ ...data, device, createdAt: new Date() })
        .returning()
        .get();
    },
    async getSessionAndUser(sessionToken) {
      const result = await base.getSessionAndUser!(sessionToken);
      if (!result) return null;
      const status = (result.user as { status?: string }).status;
      if (status !== "active") {
        await db.delete(sessions).where(eq(sessions.sessionToken, sessionToken)).run();
        return null;
      }
      return result;
    },
  };
}
