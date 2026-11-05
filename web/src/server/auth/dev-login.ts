import "server-only";
import { eq } from "drizzle-orm";
import type { NextAuthConfig } from "next-auth";
import { encode as defaultEncode } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/server/db";
import { sessions, users } from "@/server/db/schema";
import { normalizeEmail } from "@/core/auth/policy";
import { currentDevice } from "./adapter";
import { checkSignIn } from "./lifecycle";

/**
 * Fournisseur « credentials » de TEST (marqueur : dev-login-provider).
 *
 * Actif seulement si `NODE_ENV=development` ET `DEV_LOGIN=1`. Il sert aux tests
 * et aux captures sans compte Google. Il ne demande pas de mot de passe :
 * l'email suffit. Ce module n'est importé que dans la branche « development »
 * de `config.ts`.
 *
 * Auth.js n'accepte les credentials qu'avec des sessions JWT. Pour garder la
 * stratégie « database », le flux de développement crée lui-même la ligne
 * `sessions`, puis `jwt.encode` renvoie son jeton : le cookie contient alors
 * exactement ce qu'aurait posé une connexion Google.
 */
export function withDevLogin(config: NextAuthConfig): NextAuthConfig {
  if (process.env.DEV_LOGIN !== "1") return config;

  const maxAge = config.session?.maxAge ?? 30 * 24 * 60 * 60;

  return {
    ...config,
    providers: [
      ...(config.providers ?? []),
      Credentials({
        id: "dev-login",
        name: "Connexion de développement",
        credentials: { email: { label: "Email" }, name: { label: "Nom" } },
        async authorize(credentials) {
          const email = typeof credentials?.email === "string" ? normalizeEmail(credentials.email) : "";
          if (!email.includes("@")) return null;
          const decision = await checkSignIn(email, true);
          if (!decision.ok) return null;
          const name = typeof credentials?.name === "string" && credentials.name.trim() ? credentials.name.trim() : email.split("@")[0];
          const existing = await db.select().from(users).where(eq(users.email, email)).get();
          const user =
            existing ??
            (await db.insert(users).values({ email, name, emailVerified: new Date() }).returning().get());
          return { id: user.id, email: user.email, name: user.name };
        },
      }),
    ],
    callbacks: {
      ...config.callbacks,
      // `authorize` a déjà appliqué les mêmes règles (email, compte suspendu, allowlist).
      async signIn(params) {
        if (params.account?.provider === "dev-login") return true;
        return config.callbacks?.signIn ? config.callbacks.signIn(params) : true;
      },
      async jwt({ token, user, account }) {
        if (account?.provider === "dev-login" && user?.id) {
          const sessionToken = crypto.randomUUID();
          await db
            .insert(sessions)
            .values({ sessionToken, userId: user.id, expires: new Date(Date.now() + maxAge * 1000), device: await currentDevice(), createdAt: new Date() })
            .run();
          token.devSessionToken = sessionToken;
        }
        return token;
      },
    },
    jwt: {
      async encode(params) {
        const devToken = params.token?.devSessionToken;
        if (typeof devToken === "string") return devToken;
        return defaultEncode(params);
      },
    },
  };
}
