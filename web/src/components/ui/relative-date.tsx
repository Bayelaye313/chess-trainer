"use client";

import { useEffect, useState } from "react";
import { formatRelativeDate } from "@/lib/relative-time";

// Fuseau fixe : le rendu serveur et la première passe client produisent le même texte.
const ABSOLUTE = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/**
 * Date de partie : absolue au rendu (identique serveur/client, pas d'écart
 * d'hydratation), puis relative (« il y a 2 h ») une fois monté, puisque le
 * temps relatif dépend de l'horloge du moment.
 */
export function RelativeDate({ date }: { date: Date }) {
  const [relative, setRelative] = useState<string | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- l'horloge n'est lue qu'après le montage
    setRelative(formatRelativeDate(new Date(date)));
  }, [date]);
  const value = new Date(date);
  return (
    <time dateTime={value.toISOString()} title={ABSOLUTE.format(value)}>
      {relative ?? ABSOLUTE.format(value)}
    </time>
  );
}
