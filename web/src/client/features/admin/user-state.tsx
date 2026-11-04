import { Ban, CircleDot, Moon } from "lucide-react";
import { Chip } from "@/components/ui/chip";
import type { AdminUserState } from "@/server/admin/users";

const STATE_CHIP = {
  online: { label: "En ligne", tone: "success", icon: CircleDot },
  inactive: { label: "Inactif", tone: "neutral", icon: Moon },
  suspended: { label: "Suspendu", tone: "danger", icon: Ban },
} as const;

/** État d'un compte : icône ET libellé, jamais la couleur seule. */
export function UserStateChip({ state }: { state: AdminUserState }) {
  const chip = STATE_CHIP[state];
  return (
    <Chip icon={chip.icon} tone={chip.tone}>
      {chip.label}
    </Chip>
  );
}
