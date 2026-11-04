import { NextResponse, type NextRequest } from "next/server";

/**
 * Redirection OPTIMISTE vers /connexion quand aucun cookie de session n'est
 * présent. Ce n'est pas le contrôle d'accès : `requireUser()` fait autorité
 * côté serveur, dans les layouts, pages, actions et route handlers. Le proxy
 * ne lit que le cookie, jamais la base (docs Next 16, guide authentication).
 */
const SESSION_COOKIES = ["authjs.session-token", "__Secure-authjs.session-token"];

const PUBLIC_PATHS = ["/connexion", "/confidentialite"];

function isPublic(pathname: string): boolean {
  if (pathname.startsWith("/api/auth/")) return true;
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();

  const hasSession = SESSION_COOKIES.some((name) => request.cookies.has(name));
  if (hasSession) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }
  const url = new URL("/connexion", request.url);
  if (pathname !== "/") url.searchParams.set("suite", `${pathname}${search}`);
  return NextResponse.redirect(url);
}

export const config = {
  // Ni les fichiers statiques de Next, ni le moteur (public/engine), ni le favicon.
  matcher: ["/((?!_next/static|_next/image|engine/|favicon.ico).*)"],
};
