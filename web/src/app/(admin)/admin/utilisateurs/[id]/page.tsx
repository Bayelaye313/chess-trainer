import { notFound } from "next/navigation";
import { MonitorSmartphone } from "lucide-react";
import { BackLink } from "@/components/ui/back-link";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Stat } from "@/components/ui/stat";
import { ConfirmAction } from "@/client/features/admin/confirm-action";
import { formatDate, formatDateTime, formatDuration } from "@/client/features/admin/format";
import { UserStateChip } from "@/client/features/admin/user-state";
import { getUserForAdmin } from "@/server/admin/users";
import { reactivateUser, revokeUserSessions, suspendUser } from "@/server/actions/admin";
import { requireAdmin } from "@/server/auth/session";

/** Fiche d'un compte : métadonnées d'usage, sessions actives, suspension et révocation. */
export default async function AdminUserPage({ params }: PageProps<"/admin/utilisateurs/[id]">) {
  const admin = await requireAdmin();
  const { id } = await params;
  const user = await getUserForAdmin(id);
  if (!user) notFound();
  const self = user.id === admin.id;

  return (
    <div className="space-y-5">
      <BackLink href="/admin/utilisateurs">Utilisateurs</BackLink>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-xl font-semibold">{user.name ?? "Sans nom"}</h2>
        <UserStateChip state={user.state} />
        <span className="text-sm text-foreground-muted">{user.role === "admin" ? "Admin" : "Utilisateur"}</span>
      </div>
      <p className="text-sm text-foreground-muted">{user.email}</p>

      <Card aria-label="Usage" className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Inscrit le" value={<span className="text-lg">{formatDate(user.createdAt)}</span>} />
        <Stat label="Dernière connexion" value={<span className="text-lg">{formatDateTime(user.lastLoginAt)}</span>} />
        <Stat label="Temps actif sur 7 jours" value={formatDuration(user.activeSeconds7d)} />
        <Stat label="Jours actifs sur 30 jours" value={user.activeDays30d} hint={`${formatDuration(user.activeSeconds30d)} au total`} />
      </Card>

      <section aria-labelledby="sessions" className="space-y-3">
        <h3 id="sessions" className="font-display text-lg font-semibold">
          Sessions actives
        </h3>
        {user.sessions.length === 0 ? (
          <EmptyState icon={MonitorSmartphone} title="Aucune session active." />
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {user.sessions.map((session) => (
              <li key={session.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <span className="flex items-center gap-2 text-foreground">
                  <MonitorSmartphone aria-hidden="true" className="size-4 text-foreground-subtle" />
                  {session.device ?? "Appareil inconnu"}
                </span>
                <span className="text-foreground-muted">
                  Ouverte le {formatDateTime(session.createdAt)} · expire le {formatDate(session.expires)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="actions" className="space-y-3">
        <h3 id="actions" className="font-display text-lg font-semibold">
          Actions
        </h3>
        {self ? (
          <p className="text-sm text-foreground-muted">C&apos;est ton compte : tu ne peux ni le suspendre ni fermer ses sessions d&apos;ici.</p>
        ) : (
          <div className="flex flex-wrap items-start gap-4">
            {user.status === "active" ? (
              <ConfirmAction
                label="Suspendre"
                variant="danger"
                confirmText="Suspendre ce compte ? Il ne pourra plus se connecter et toutes ses sessions seront fermées."
                action={suspendUser.bind(null, user.id)}
              />
            ) : (
              <ConfirmAction label="Réactiver" confirmText="Réactiver ce compte ? Il pourra de nouveau se connecter." action={reactivateUser.bind(null, user.id)} />
            )}
            <ConfirmAction
              label="Révoquer les sessions"
              confirmText="Fermer toutes les sessions de ce compte ? Il devra se reconnecter."
              action={revokeUserSessions.bind(null, user.id)}
              disabled={user.sessions.length === 0}
            />
          </div>
        )}
        <p className="text-xs text-foreground-subtle">Chaque action est inscrite au journal. Le contenu des parties, erreurs et révisions n&apos;est jamais visible ici.</p>
      </section>
    </div>
  );
}
