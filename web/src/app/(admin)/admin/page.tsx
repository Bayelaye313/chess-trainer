import { Card } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { DailyBars } from "@/client/features/admin/daily-bars";
import { formatDuration } from "@/client/features/admin/format";
import { OnlineCard } from "@/client/features/admin/online-card";
import { getDashboardStats } from "@/server/admin/stats";
import { requireAdmin } from "@/server/auth/session";

/** Tableau de bord : en ligne, actifs (jour, 7 j, 30 j), inscrits, courbes sur 30 jours. */
export default async function AdminDashboardPage() {
  await requireAdmin();
  const stats = await getDashboardStats();
  const retention = stats.retention.rate === null ? "—" : `${Math.round(stats.retention.rate * 100)} %`;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <OnlineCard initial={{ onlineNow: stats.onlineNow, onlineBySection: stats.onlineBySection, generatedAt: stats.generatedAt }} />
        <Card aria-label="Comptes et activité" className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
          <Stat label="Actifs aujourd'hui" value={stats.dau} hint="≥ 60 s ce jour (UTC)" />
          <Stat label="Actifs sur 7 jours" value={stats.wau} />
          <Stat label="Actifs sur 30 jours" value={stats.mau} />
          <Stat label="Total inscrits" value={stats.totalUsers} />
          <Stat label="Nouveaux sur 7 jours" value={stats.newUsers7d} />
          <Stat label="Sessions actives" value={stats.activeSessions} hint="non expirées" />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DailyBars title="Utilisateurs actifs par jour" unit="actifs" points={stats.activePerDay} />
        <DailyBars title="Inscriptions par jour" unit="inscriptions" points={stats.signupsPerDay} />
      </div>

      <Card aria-label="Engagement" className="grid grid-cols-2 gap-4">
        <Stat label="Temps actif moyen par utilisateur actif" value={formatDuration(stats.averageActiveSeconds7d)} hint="7 derniers jours" />
        <Stat
          label="Rétention simple"
          value={retention}
          hint={stats.retention.cohort === 0 ? "Aucun inscrit depuis au moins 7 jours" : `${stats.retention.returned} revenus sur ${stats.retention.cohort} inscrits depuis 7 jours ou plus`}
        />
      </Card>
    </div>
  );
}
