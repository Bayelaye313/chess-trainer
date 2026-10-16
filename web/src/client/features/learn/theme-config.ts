/**
 * ThemeConfig — extension TypeScript de la charte "Jeu Virtuel / E-Sport" pour
 * l'académie Apprendre (cahier des charges du 2026-09-09 : accordéon de
 * paliers + Mission Briefing). Tailwind v4 n'utilise pas de fichier de config
 * ici — `app/globals.css` (`@theme inline`) reste l'unique source de vérité
 * des jetons de couleur ; ce module est le pendant TypeScript typé pour les
 * ajouts propres à ces deux composants (paliers, glow, timings), jamais un
 * remplacement de la palette déjà en place.
 *
 * Deux règles héritées de `globals.css` à ne jamais rompre depuis ici :
 *  1. Les couleurs de qualité de coup et de niveau (`--quality-*`,
 *     `CURRICULUM_LEVEL_*` dans `lib/labels.ts`) restent la seule sémantique
 *     "facile → dur" / "correct → erreur" de toute l'application — réutilisées
 *     telles quelles pour le "niveau de menace" du Mission Briefing plutôt que
 *     réinventées.
 *  2. Pas de police Google Fonts (Space Grotesk/Rajdhani demandées au cahier
 *     des charges) : `fonts.googleapis.com` échoue systématiquement derrière
 *     le proxy de cet environnement — c'est exactement pourquoi Geist est déjà
 *     auto-hébergée en `.woff2` (voir `app/layout.tsx`). L'identité "scoring
 *     e-sport" vient donc d'un traitement typographique agressif de Geist
 *     (majuscules, `font-black`, tracking large) plutôt que d'une police tierce
 *     — le jour où quelqu'un dépose des `.woff2` Rajdhani/Space Grotesk dans
 *     `app/fonts/`, seul `DISPLAY_TEXT` ci-dessous change.
 *
 * Animations : `motion` (successeur de Framer Motion, même API — le paquet
 * `framer-motion` n'existe plus que comme alias) + primitives accessibles
 * `@radix-ui/react-accordion`/`@radix-ui/react-dialog` (cahier des charges du
 * 2026-09-09, "bibliothèques UI modernes avec animations"). Contrairement à
 * `fonts.googleapis.com`, le registre npm répond normalement dans cet
 * environnement — vérifié avant d'introduire ces dépendances. Les variantes
 * ci-dessous centralisent les réglages (spring, stagger) pour que
 * `CourseCurriculum` et `MissionBriefing` restent visuellement cohérents et
 * qu'un futur composant (échiquier, HUD) les réutilise plutôt que d'en
 * inventer de nouvelles.
 */
import type { Transition, Variants } from "motion/react";
import { CURRICULUM_LEVEL_BORDER_CLASS, CURRICULUM_LEVEL_LABEL, CURRICULUM_LEVEL_TEXT_CLASS } from "@/lib/labels";
import type { CurriculumLevel } from "@/server/db/schema/curriculum";

/** Ordre d'affichage fixe des paliers — Bronze → Argent → Or, jamais l'ordre d'arrivée en base. */
export const TIER_ORDER: readonly CurriculumLevel[] = ["beginner", "intermediate", "advanced"];

export interface TierMeta {
  readonly level: CurriculumLevel;
  /** Titre complet du bandeau d'accordéon. */
  readonly label: string;
  readonly shortLabel: string;
  readonly icon: string;
  /** Liseré + fond de la section — jeton `--tier-*` additif (`globals.css`), distinct de la sémantique qualité/niveau. */
  readonly borderClass: string;
  readonly textClass: string;
}

/**
 * Paliers de compétence purement visuels (chrome de l'accordéon), keyés sur
 * le VRAI `CurriculumLevel` du catalogue — aucun champ "tier" inventé côté
 * données, `course-curriculum.tsx` groupe directement `theme.level`.
 */
export const TIER_META: Record<CurriculumLevel, TierMeta> = {
  beginner: {
    level: "beginner",
    label: "Palier Bronze — Débutant",
    shortLabel: "Bronze",
    icon: "🥉",
    borderClass: "border-tier-bronze/40",
    textClass: "text-tier-bronze",
  },
  intermediate: {
    level: "intermediate",
    label: "Palier Argent — Intermédiaire",
    shortLabel: "Argent",
    icon: "🥈",
    borderClass: "border-tier-silver/40",
    textClass: "text-tier-silver",
  },
  advanced: {
    level: "advanced",
    label: "Palier Or — Avancé",
    shortLabel: "Or",
    icon: "🥇",
    borderClass: "border-tier-gold/40",
    textClass: "text-tier-gold",
  },
};

export interface ThreatMeta {
  readonly level: CurriculumLevel;
  readonly label: string;
  readonly icon: string;
  readonly textClass: string;
  readonly borderClass: string;
}

/**
 * "Niveau de menace" du Mission Briefing — réutilise VOLONTAIREMENT
 * `CURRICULUM_LEVEL_*` (`lib/labels.ts`, vert/ambre/rouge déjà benchmarké
 * Lichess/Chess.com) plutôt que d'inventer une nouvelle palette : un thème
 * "avancé" est déjà rouge partout ailleurs dans l'app (frise, badges), il n'y
 * a aucune raison qu'il devienne autre chose ici.
 */
export const THREAT_META: Record<CurriculumLevel, ThreatMeta> = {
  beginner: {
    level: "beginner",
    label: CURRICULUM_LEVEL_LABEL.beginner,
    icon: "🟢",
    textClass: CURRICULUM_LEVEL_TEXT_CLASS.beginner,
    borderClass: CURRICULUM_LEVEL_BORDER_CLASS.beginner,
  },
  intermediate: {
    level: "intermediate",
    label: CURRICULUM_LEVEL_LABEL.intermediate,
    icon: "🟡",
    textClass: CURRICULUM_LEVEL_TEXT_CLASS.intermediate,
    borderClass: CURRICULUM_LEVEL_BORDER_CLASS.intermediate,
  },
  advanced: {
    level: "advanced",
    label: CURRICULUM_LEVEL_LABEL.advanced,
    icon: "🔴",
    textClass: CURRICULUM_LEVEL_TEXT_CLASS.advanced,
    borderClass: CURRICULUM_LEVEL_BORDER_CLASS.advanced,
  },
};

/** Durées de repli (µ-interactions ponctuelles hors `motion`, ex. `transition-transform` CSS pur) — cahier des charges : jamais plus de 300ms sur un volet, jamais plus de 150ms sur un déplacement de pièce (hors périmètre de cette passe, gardé ici pour que le futur composant d'échiquier reprenne la même constante plutôt que d'en réinventer une). */
export const MOTION = {
  panelMs: 300,
  pieceMoveMs: 150,
} as const;

/**
 * Valeurs `boxShadow` brutes (pas des classes Tailwind) — consommées par
 * `whileHover`/`whileTap` de `motion`, qui anime la propriété CSS directement
 * en style inline. Un utilitaire Tailwind `hover:shadow-[...]` en parallèle
 * se ferait écraser sans jamais s'appliquer (l'inline de `motion` gagne
 * toujours en spécificité) — mélanger les deux systèmes sur la même
 * propriété serait donc du code mort, pas une redondance inoffensive.
 */
export const GLOW = {
  cta: "0 0 32px -4px var(--accent)",
  card: "0 0 20px -8px var(--accent)",
} as const;

/** Ressort standard des micro-interactions (chevrons, cartes, boutons) — un seul réglage pour que toute la surface de clic de l'académie "rebondisse" pareil. */
export const SPRING: Transition = { type: "spring", stiffness: 380, damping: 32, mass: 0.9 };
/** Ressort plus doux pour les grands mouvements (panneaux qui se déplient, overlay qui entre) — évite l'effet "élastique" d'un `SPRING` serré sur une grande distance. */
export const SOFT_SPRING: Transition = { type: "spring", stiffness: 260, damping: 28 };

/**
 * Volet d'accordéon (`CourseCurriculum`) — anime `height`/`opacity` entre
 * `"closed"`/`"open"`, posé sur `Accordion.Content forceMount asChild` de
 * Radix : Radix gère l'accessibilité (aria-expanded, clavier), `motion` gère
 * entièrement le rendu visuel de l'ouverture/fermeture (Radix ne pose plus
 * ses propres classes de transition CSS quand `forceMount` est utilisé ainsi).
 */
export const ACCORDION_PANEL_VARIANTS: Variants = {
  open: { height: "auto", opacity: 1, transition: { height: SOFT_SPRING, opacity: { duration: 0.2, delay: 0.05 } } },
  closed: { height: 0, opacity: 0, transition: { height: SOFT_SPRING, opacity: { duration: 0.15 } } },
};

/** Orchestration du contenu du volet — `staggerChildren` propage automatiquement aux `motion.li` enfants dès que le parent passe à `"open"`, aucun délai calculé à la main par item. */
export const ACCORDION_LIST_VARIANTS: Variants = {
  open: { transition: { staggerChildren: 0.04, delayChildren: 0.08 } },
  closed: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
};
export const ACCORDION_ROW_VARIANTS: Variants = {
  open: { opacity: 1, x: 0, transition: SOFT_SPRING },
  closed: { opacity: 0, x: -8 },
};
export const CHEVRON_VARIANTS: Variants = {
  open: { rotate: 180 },
  closed: { rotate: 0 },
};

/** Overlay Mission Briefing — fondu de la trame, montée en spring du panneau. */
export const BRIEFING_BACKDROP_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};
export const BRIEFING_PANEL_VARIANTS: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 16 },
  visible: { opacity: 1, scale: 1, y: 0, transition: SPRING },
  exit: { opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.15 } },
};

/** Mission checklist — même orchestration parent/enfants que l'accordéon, décalée pour démarrer après l'entrée du panneau. */
export const CHECKLIST_LIST_VARIANTS: Variants = {
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.25 } },
};
export const CHECKLIST_ITEM_VARIANTS: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: SOFT_SPRING },
};

/** Traitement typographique "scoring e-sport" — voir la note en tête de fichier sur l'absence de Space Grotesk/Rajdhani. */
export const DISPLAY_TEXT = "font-sans font-black uppercase tracking-wide";
