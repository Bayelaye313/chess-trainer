import Link from "next/link";
import { Search, Users } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, formatDateTime, formatDuration } from "@/client/features/admin/format";
import { UserStateChip } from "@/client/features/admin/user-state";
import { listUsersForAdmin } from "@/server/admin/users";
import { requireAdmin } from "@/server/auth/session";

/** Liste des comptes : recherche (nom, email), tri par dernière activité, 25 par page. */
export default async function AdminUsersPage({ searchParams }: PageProps<"/admin/utilisateurs">) {
  await requireAdmin();
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const page = Number(typeof params.page === "string" ? params.page : "1");
  const { rows, total, page: current, pageCount } = await listUsersForAdmin({ query, page });
  const href = (target: number) => `/admin/utilisateurs?${new URLSearchParams({ ...(query ? { q: query } : {}), page: String(target) })}`;

  return (
    <div className="space-y-4">
      <form role="search" className="flex max-w-xl gap-2" action="/admin/utilisateurs">
        <label className="sr-only" htmlFor="recherche-utilisateurs">
          Rechercher un nom ou un email
        </label>
        <input
          id="recherche-utilisateurs"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Nom ou email"
          className="min-h-11 w-full rounded-md border border-border-strong bg-surface-muted px-3 text-sm text-foreground placeholder:text-foreground-subtle"
        />
        <Button type="submit">
          <Search aria-hidden="true" />
          Rechercher
        </Button>
      </form>

      <p className="text-sm text-foreground-muted">
        {total} compte{total > 1 ? "s" : ""}
        {query ? ` pour « ${query} »` : ""}, du plus récemment actif au moins récent.
      </p>

      {rows.length === 0 ? (
        <EmptyState icon={Users} title={query ? "Aucun compte ne correspond." : "Aucun compte pour l'instant."}>
          {query ? "Vérifie l'orthographe, ou cherche une partie de l'email." : "Les comptes apparaîtront ici après leur première connexion."}
        </EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-surface text-foreground-subtle">
              <tr>
                {["Nom", "Email", "Rôle", "Inscrit le", "Dernière activité", "Actif sur 7 j", "État"].map((label) => (
                  <th key={label} scope="col" className="px-3 py-2 font-normal">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => {
                return (
                  <tr key={row.id} className="hover:bg-surface-muted">
                    <td className="px-3 py-1">
                      <Link href={`/admin/utilisateurs/${row.id}`} className="inline-flex min-h-11 items-center font-medium text-foreground underline-offset-4 hover:underline">
                        {row.name ?? "Sans nom"}
                      </Link>
                    </td>
                    <td className="px-3 py-1 text-foreground-muted">{row.email ?? "—"}</td>
                    <td className="px-3 py-1 text-foreground-muted">{row.role === "admin" ? "Admin" : "Utilisateur"}</td>
                    <td className="px-3 py-1 text-foreground-muted">{formatDate(row.createdAt)}</td>
                    <td className="px-3 py-1 text-foreground-muted">{formatDateTime(row.lastActivityAt)}</td>
                    <td className="px-3 py-1 font-mono text-foreground">{formatDuration(row.activeSeconds7d)}</td>
                    <td className="px-3 py-1">
                      <UserStateChip state={row.state} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pageCount > 1 && (
        <nav aria-label="Pagination" className="flex items-center gap-2">
          {current > 1 && <ButtonLink href={href(current - 1)}>Page précédente</ButtonLink>}
          <span className="px-2 text-sm text-foreground-muted">
            Page {current} sur {pageCount}
          </span>
          {current < pageCount && <ButtonLink href={href(current + 1)}>Page suivante</ButtonLink>}
        </nav>
      )}
    </div>
  );
}
