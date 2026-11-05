import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getCurrentUser } from "@/server/auth/session";

/**
 * Groupe de l'espace admin, séparé de `(app)` : un visiteur ou un non-admin
 * reçoit un 404 (jamais une redirection vers /connexion, qui révélerait la
 * page). Le rôle est revérifié dans chaque page, action et route handler.
 */
export default async function AdminGroupLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") notFound();
  return <AppShell user={user}>{children}</AppShell>;
}
