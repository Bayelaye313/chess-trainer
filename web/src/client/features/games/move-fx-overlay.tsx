"use client";

import { motion } from "motion/react";
import type { MoveFxKind } from "@/core/analysis/move-fx";

interface OverlayVariant {
  background: string;
  scale: [number, number, number];
  opacity: [number, number, number];
}

/**
 * Une variante par type de coup notable — voir `use-move-fx.ts` pour le
 * pendant sonore (mêmes catégories, même intention visuelle). Réutilise les
 * jetons `--quality-*` déjà benchmarkés (globals.css) plutôt que d'inventer
 * une nouvelle palette : Brillant/Critique/Excellent/Gaffe restent
 * identifiables même à l'œil déjà habitué au journal des coups.
 */
const OVERLAY_VARIANTS: Record<Exclude<MoveFxKind, "neutral">, OverlayVariant> = {
  // Sparkle : éclat qui grossit puis s'efface.
  brilliant: {
    background: "radial-gradient(circle, color-mix(in srgb, var(--quality-brilliant) 75%, white) 0%, transparent 72%)",
    scale: [0.5, 1.35, 1.6],
    opacity: [0, 0.9, 0],
  },
  // Flash d'alerte : plein cadre, bref.
  critical: {
    background: "color-mix(in srgb, var(--quality-critical) 55%, transparent)",
    scale: [1, 1, 1],
    opacity: [0, 0.85, 0],
  },
  // Glow doux, validation.
  excellent: {
    background: "radial-gradient(circle, color-mix(in srgb, var(--quality-best) 60%, transparent) 0%, transparent 75%)",
    scale: [0.85, 1.15, 1.15],
    opacity: [0, 0.75, 0],
  },
  // Onde de choc : anneau rouge qui se dilate.
  blunder: {
    background:
      "radial-gradient(circle, transparent 38%, color-mix(in srgb, var(--quality-blunder) 70%, transparent) 52%, transparent 68%)",
    scale: [0.3, 1.9, 2.3],
    opacity: [0, 0.9, 0],
  },
  // Impacts mats, discrets — la différenciation vit surtout côté son.
  castle: {
    background: "color-mix(in srgb, var(--foreground-muted) 45%, transparent)",
    scale: [0.9, 1.05, 1.05],
    opacity: [0, 0.5, 0],
  },
  capture: {
    background: "color-mix(in srgb, var(--engine-arrow-played) 45%, transparent)",
    scale: [0.9, 1.1, 1.1],
    opacity: [0, 0.55, 0],
  },
  development: {
    background: "color-mix(in srgb, var(--accent) 35%, transparent)",
    scale: [0.95, 1.05, 1.05],
    opacity: [0, 0.4, 0],
  },
};

/**
 * Micro-animation transitoire posée sur la case d'arrivée du coup courant
 * (§11b, "Sound & Animation Canvas") — auto-disparaît sans intervention du
 * parent (l'animation elle-même retombe à `opacity: 0`), remontée à chaque
 * nouveau coup via la `key` posée par l'appelant (`game-review-screen.tsx`).
 */
export function MoveFxOverlay({ kind }: { kind: MoveFxKind }) {
  if (kind === "neutral") return null;
  const variant = OVERLAY_VARIANTS[kind];

  return (
    <motion.span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-sm"
      style={{ background: variant.background }}
      initial={{ opacity: variant.opacity[0], scale: variant.scale[0] }}
      animate={{ opacity: variant.opacity, scale: variant.scale }}
      transition={{ duration: 0.6, ease: "easeOut", times: [0, 0.35, 1] }}
    />
  );
}
