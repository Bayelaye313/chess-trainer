import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import type { UserRole } from "@/server/db/schema";
import { auth } from "./config";

export interface CurrentUser {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
}

/**
 * Utilisateur de la requête, ou `null`. Mis en cache pour la durée d'une
 * requête : layout, page et requêtes peuvent l'appeler sans relire la base.
 * Un compte suspendu n'a plus de session (`adapter.getSessionAndUser`).
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) return null;
  return { id: user.id, name: user.name ?? null, email: user.email ?? null, role: user.role ?? "user" };
});

/**
 * Contrôle d'accès qui fait autorité. On l'appelle dans les layouts, les pages,
 * les server actions et les route handlers. Sans session, il redirige vers
 * /connexion.
 */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  return user;
}

/** Réservé aux admins. Tout autre visiteur reçoit un 404, ce qui ne révèle pas que la page existe. */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") notFound();
  return user;
}

/** Variante pour les route handlers, qui répondent eux-mêmes 401 ou 404. */
export async function sessionUser(): Promise<CurrentUser | null> {
  return getCurrentUser();
}
