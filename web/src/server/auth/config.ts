import "server-only";
import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { createAdapter } from "./adapter";
import { checkSignIn, onSignedIn } from "./lifecycle";

/** Erreurs de connexion → code court lu par la page /connexion (`?erreur=`). */
const SIGNIN_ERROR_PAGE = "/connexion?erreur=";

const SESSION_MAX_AGE = 30 * 24 * 60 * 60;

async function buildConfig(): Promise<NextAuthConfig> {
  const config: NextAuthConfig = {
    adapter: createAdapter(),
    session: { strategy: "database", maxAge: SESSION_MAX_AGE, updateAge: 24 * 60 * 60 },
    // Lit AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET.
    providers: [Google],
    pages: { signIn: "/connexion", error: "/connexion" },
    // Jamais de jeton ni de profil dans les journaux : seuls le code et le message.
    logger: {
      error(error) {
        console.error(`[auth] ${error.name}: ${error.message}`);
      },
      warn(code) {
        console.warn(`[auth] ${code}`);
      },
      debug() {},
    },
    callbacks: {
      async signIn({ user, account, profile }) {
        if (account?.provider === "google") {
          const verified = (profile as { email_verified?: boolean } | undefined)?.email_verified === true;
          const decision = await checkSignIn(profile?.email ?? user.email, verified);
          return decision.ok ? true : `${SIGNIN_ERROR_PAGE}${decision.reason}`;
        }
        // Google est le seul fournisseur en production. Le fournisseur de
        // développement remplace ce callback (dev-login.ts).
        return false;
      },
      session({ session, user }) {
        const row = user as typeof user & { role?: "user" | "admin" };
        session.user.id = user.id;
        session.user.role = row.role ?? "user";
        return session;
      },
    },
    events: {
      async signIn({ user }) {
        if (user.id) await onSignedIn(user.id);
      },
    },
  };

  // Connexion de développement : uniquement avec `next dev` ET DEV_LOGIN=1.
  // `process.env.NODE_ENV` est remplacé par une constante au build : en
  // production cette branche disparaît, et le module `dev-login` avec elle
  // (vérifié par grep sur `.next/`, voir docs/auth/audit.md).
  if (process.env.NODE_ENV === "development") {
    const { withDevLogin } = await import("./dev-login");
    return withDevLogin(config);
  }
  return config;
}

export const { handlers, auth, signIn, signOut } = NextAuth(() => buildConfig());
