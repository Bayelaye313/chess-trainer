/**
 * Règles d'accès, en fonctions pures (testées sans base ni Auth.js).
 *
 * - `ADMIN_EMAILS` : emails qui reçoivent `role = 'admin'`. La liste est relue à
 *   chaque connexion, donc retirer un email rétrograde le compte.
 * - `SIGNUP_MODE` : `open` (défaut) ou `allowlist`. En `allowlist`, seuls les
 *   emails de `ALLOWED_EMAILS` et de `ADMIN_EMAILS` créent un compte.
 */
export type SignupMode = "open" | "allowlist";
export type Role = "user" | "admin";

export interface AccessConfig {
  adminEmails: ReadonlySet<string>;
  allowedEmails: ReadonlySet<string>;
  signupMode: SignupMode;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** "a@x.fr, B@y.fr ,," → {a@x.fr, b@y.fr} */
export function parseEmailList(raw: string | undefined | null): Set<string> {
  return new Set(
    (raw ?? "")
      .split(",")
      .map(normalizeEmail)
      .filter((email) => email.length > 0),
  );
}

export function parseSignupMode(raw: string | undefined | null): SignupMode {
  return raw?.trim().toLowerCase() === "allowlist" ? "allowlist" : "open";
}

export function readAccessConfig(env: Record<string, string | undefined>): AccessConfig {
  return {
    adminEmails: parseEmailList(env.ADMIN_EMAILS),
    allowedEmails: parseEmailList(env.ALLOWED_EMAILS),
    signupMode: parseSignupMode(env.SIGNUP_MODE),
  };
}

export function roleForEmail(email: string, config: AccessConfig): Role {
  return config.adminEmails.has(normalizeEmail(email)) ? "admin" : "user";
}

/** Un compte NEUF peut-il être créé pour cet email ? (Les comptes existants ne sont pas concernés.) */
export function canCreateAccount(email: string, config: AccessConfig): boolean {
  if (config.signupMode === "open") return true;
  const normalized = normalizeEmail(email);
  return config.allowedEmails.has(normalized) || config.adminEmails.has(normalized);
}

export interface SignInCandidate {
  email: string | null | undefined;
  /** `email_verified` du profil Google. */
  emailVerified: boolean;
  /** `null` si aucun compte n'existe encore pour cet email. */
  existingStatus: "active" | "suspended" | null;
}

export type SignInDecision = { ok: true } | { ok: false; reason: "unverified" | "suspended" | "not-allowed" };

export function decideSignIn(candidate: SignInCandidate, config: AccessConfig): SignInDecision {
  if (!candidate.email || !candidate.emailVerified) return { ok: false, reason: "unverified" };
  if (candidate.existingStatus === "suspended") return { ok: false, reason: "suspended" };
  if (candidate.existingStatus === null && !canCreateAccount(candidate.email, config)) {
    return { ok: false, reason: "not-allowed" };
  }
  return { ok: true };
}

/** Initiales affichées à la place de l'avatar (« Jeanne Martin » → « JM », email seul → « J »). */
export function initialsOf(name: string | null | undefined, email: string | null | undefined): string {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  const local = (email ?? "").trim();
  return local ? local[0].toUpperCase() : "?";
}

/** Appareil approximatif à partir du User-Agent : navigateur et système, rien de plus. */
export function describeDevice(userAgent: string | null | undefined): string | null {
  if (!userAgent) return null;
  const ua = userAgent;
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\/|Opera/.test(ua)
      ? "Opera"
      : /Firefox\//.test(ua)
        ? "Firefox"
        : /Chrome\/|CriOS\//.test(ua)
          ? "Chrome"
          : /Safari\//.test(ua)
            ? "Safari"
            : null;
  const os = /Android/.test(ua)
    ? "Android"
    : /iPhone|iPad|iPod/.test(ua)
      ? "iOS"
      : /Windows/.test(ua)
        ? "Windows"
        : /Mac OS X|Macintosh/.test(ua)
          ? "macOS"
          : /Linux/.test(ua)
            ? "Linux"
            : null;
  if (!browser && !os) return null;
  return [browser, os].filter(Boolean).join(" · ");
}
