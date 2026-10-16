import { SettingsScreen } from "@/client/features/settings/settings-screen";
import { EsportCanvas } from "@/components/ui/esport-page";
import packageJson from "../../../package.json";

export default function PlusPage() {
  return (
    <EsportCanvas detail>
      <SettingsScreen appVersion={packageJson.version} />
    </EsportCanvas>
  );
}
