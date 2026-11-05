"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { HEARTBEAT_INTERVAL_MS, sectionOfPath } from "@/core/presence/metrics";

/** Écart minimal entre deux battements (changements de section rapprochés). */
const MIN_GAP_MS = 15_000;

/**
 * Battement de présence : toutes les 60 s TANT QUE l'onglet est visible, plus
 * un battement au retour sur l'onglet et au changement de section. N'envoie que
 * la section (« jouer », « ouvertures »…), jamais l'URL ni un contenu.
 */
export function PresenceBeacon() {
  const pathname = usePathname();
  const section = sectionOfPath(pathname);
  const sectionRef = useRef(section);
  const lastSentRef = useRef(0);

  useEffect(() => {
    const send = (force = false) => {
      if (document.visibilityState !== "visible") return;
      const now = Date.now();
      if (!force && now - lastSentRef.current < MIN_GAP_MS) return;
      lastSentRef.current = now;
      void fetch("/api/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: sectionRef.current }),
        keepalive: true,
      }).catch(() => {});
    };

    const interval = setInterval(() => send(true), HEARTBEAT_INTERVAL_MS);
    const onVisibility = () => send();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    sectionRef.current = section;
    if (document.visibilityState !== "visible") return;
    const now = Date.now();
    if (now - lastSentRef.current < MIN_GAP_MS) return;
    lastSentRef.current = now;
    void fetch("/api/presence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section }),
      keepalive: true,
    }).catch(() => {});
  }, [section]);

  return null;
}
