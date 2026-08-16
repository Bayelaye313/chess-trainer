import { SettingsScreen } from "@/client/features/settings/settings-screen";
import packageJson from "../../../package.json";

export default function PlusPage() {
  return <SettingsScreen appVersion={packageJson.version} />;
}
