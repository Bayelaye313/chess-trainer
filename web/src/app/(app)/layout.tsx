import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/server/auth/session";

/**
 * Pages connectées. `requireUser()` fait autorité ici (le proxy ne fait qu'une
 * redirection optimiste). Chaque page et chaque action le rappelle aussi, parce
 * qu'un layout n'est pas rejoué à chaque navigation.
 */
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();
  return <AppShell user={user}>{children}</AppShell>;
}
