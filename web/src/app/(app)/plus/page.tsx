import type { Metadata } from "next";
import { requireUser } from "@/server/auth/session";
import { SettingsScreen } from "@/client/features/settings/settings-screen";
import { getTrainingPreferences } from "@/server/queries/settings";
import { getDailySessionState } from "@/server/queries/daily-plan";
import packageJson from "../../../../package.json";

export const metadata: Metadata = { title: "Réglages" };
export const dynamic = "force-dynamic";

/** `/plus` reste l'adresse des Réglages (route conservée). */
export default async function PlusPage() {
  const { id: userId } = await requireUser();
  const [preferences, sessionState] = await Promise.all([getTrainingPreferences(userId), getDailySessionState(userId)]);
  return <SettingsScreen appVersion={packageJson.version} preferences={preferences} sessionState={sessionState} />;
}
