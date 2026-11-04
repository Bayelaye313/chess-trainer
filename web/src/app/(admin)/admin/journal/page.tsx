import { ScrollText } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/client/features/admin/format";
import { listAuditForAdmin } from "@/server/admin/users";
import { requireAdmin } from "@/server/auth/session";

const ACTION_LABELS: Record<string, string> = {
  suspend: "a suspendu",
  reactivate: "a réactivé",
  "revoke-sessions": "a fermé les sessions de",
  "legacy-claim": "a repris les données mono-utilisateur pour",
  "delete-account": "a supprimé",
};

/** Journal des actions d'administration : qui, quoi, sur qui, quand. */
export default async function AdminJournalPage({ searchParams }: PageProps<"/admin/journal">) {
  await requireAdmin();
  const params = await searchParams;
  const { rows, page, pageCount } = await listAuditForAdmin(Number(typeof params.page === "string" ? params.page : "1"));

  if (rows.length === 0) {
    return <EmptyState icon={ScrollText} title="Le journal est vide.">Les suspensions, réactivations et révocations de sessions y seront inscrites.</EmptyState>;
  }

  return (
    <div className="space-y-4">
      <ol className="divide-y divide-border rounded-lg border border-border">
        {rows.map((row) => (
          <li key={row.id} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 text-sm">
            <span className="text-foreground">
              <strong className="font-medium">{row.actorEmail ?? "Compte supprimé"}</strong> {ACTION_LABELS[row.action] ?? row.action}{" "}
              <strong className="font-medium">{row.targetEmail ?? "un compte supprimé"}</strong>
              {row.detail && typeof row.detail.sessionsRevoked === "number" && row.detail.sessionsRevoked > 0 && (
                <span className="text-foreground-muted"> · {row.detail.sessionsRevoked} session(s) fermée(s)</span>
              )}
            </span>
            <time dateTime={row.createdAt.toISOString()} className="font-mono text-xs text-foreground-subtle">
              {formatDateTime(row.createdAt)}
            </time>
          </li>
        ))}
      </ol>
      {pageCount > 1 && (
        <nav aria-label="Pagination" className="flex items-center gap-2">
          {page > 1 && <ButtonLink href={`/admin/journal?page=${page - 1}`}>Plus récentes</ButtonLink>}
          <span className="px-2 text-sm text-foreground-muted">
            Page {page} sur {pageCount}
          </span>
          {page < pageCount && <ButtonLink href={`/admin/journal?page=${page + 1}`}>Plus anciennes</ButtonLink>}
        </nav>
      )}
    </div>
  );
}
