import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { AdminNav } from "@/client/features/admin/admin-nav";
import { requireAdmin } from "@/server/auth/session";

export const metadata: Metadata = { title: "Administration", robots: { index: false } };
export const dynamic = "force-dynamic";

/** Réservé à role='admin', vérifié ici ET dans chaque page, action et route. Sinon : 404. */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <PageHeader title="Administration" description="Usage de l'application. Métadonnées seulement, jamais le contenu des parties." className="pb-3" />
      <AdminNav />
      {children}
    </div>
  );
}
