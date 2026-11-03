"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChessKnight, Layers } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BOT_DISPLAY, readLastSetup, type BotSetup } from "@/client/features/play/bot-display";

function Shortcut({ href, icon: Icon, title, detail }: { href: string; icon: LucideIcon; title: string; detail: string }) {
  return (
    <Link href={href} className="flex min-h-16 items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 transition-colors hover:bg-surface-muted">
      <Icon aria-hidden="true" className="size-5 shrink-0 text-accent" />
      <span className="min-w-0">
        <span className="block font-medium text-foreground">{title}</span>
        <span className="block truncate text-sm text-foreground-muted">{detail}</span>
      </span>
    </Link>
  );
}

/**
 * Deux raccourcis de l'accueil. « Jouer » relance directement le dernier
 * réglage mémorisé (`/jouer?rejouer=1`, 1 clic) ; sinon il ouvre le réglage.
 */
export function HomeShortcuts({ dueTotal }: { dueTotal: number }) {
  const [last, setLast] = useState<BotSetup | null>(null);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture d'une préférence locale après montage
  useEffect(() => setLast(readLastSetup()), []);

  const play = last
    ? { href: "/jouer?rejouer=1", title: "Rejouer", detail: `${BOT_DISPLAY[last.profileId].name} · ${last.color === "w" ? "Blancs" : "Noirs"}` }
    : { href: "/jouer", title: "Jouer", detail: "Choisis un bot" };

  return (
    <div className="grid grid-cols-2 gap-3">
      <Shortcut href={play.href} icon={ChessKnight} title={play.title} detail={play.detail} />
      <Shortcut
        href="/entrainer"
        icon={Layers}
        title="Réviser"
        detail={dueTotal > 0 ? `${dueTotal} carte${dueTotal > 1 ? "s" : ""}` : "Tout est à jour"}
      />
    </div>
  );
}
