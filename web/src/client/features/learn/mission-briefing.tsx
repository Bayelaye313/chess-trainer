"use client";

/**
 * MissionBriefing — sas psychologique "Versus/Briefing" avant d'entrer dans
 * un module (`ThemeLesson`) : cahier des charges du 2026-09-09, "l'utilisateur
 * est jeté sur une leçon sans aucune mise en condition", puis "bibliothèques
 * UI modernes avec animations". Composant PUR — présentation seule, aucun
 * fetch : reçoit `objective`/`keyIdeas` déjà résolus par `resolveLessonContent`
 * (calculé une fois par `ThemeLesson`), comme `ProgressBar`/`ProgressRing`
 * dans ce même dossier.
 *
 * Stack : `@radix-ui/react-dialog` pour le VERROUILLAGE (focus trap, scroll
 * bloqué derrière l'overlay, `aria-modal`) — plus fiable qu'un
 * `useEffect(() => { document.body.style.overflow = "hidden" })` écrit à la
 * main — et `motion` pour l'entrée (fondu de la trame + montée en ressort du
 * panneau, variantes `BRIEFING_*`/`CHECKLIST_*` de `theme-config.ts`). C'est
 * un BRIEFING OBLIGATOIRE, pas une boîte de dialogue dismissible : Échap et le
 * clic hors du panneau sont interceptés (`onEscapeKeyDown`/
 * `onPointerDownOutside`, `event.preventDefault()`) — la seule sortie est
 * `onEnter`.
 *
 * Intégration prévue dans `ThemeLesson` (non câblée par ce fichier — ses
 * propres modifications sont en cours ailleurs) : un `useState<boolean>`
 * local `entered`, remis à `false` à chaque thème grâce au `key={theme.id}`
 * que `LearnScreen` pose déjà sur `ThemeLesson` — même patron que
 * `demoCompleted`. Tant que `entered` est faux, monter `MissionBriefing`
 * au-dessus du contenu du cours (idéalement enveloppé dans
 * `<AnimatePresence>{!entered && <MissionBriefing .../>}</AnimatePresence>`
 * pour l'animation de sortie) ; `onEnter` passe `entered` à `true`. Ce
 * composant ne connaît que "je m'affiche" / "on confirme l'entrée" — jamais
 * la logique de fermeture elle-même.
 */
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "motion/react";
import type { CurriculumCategoryMeta } from "@/core/curriculum/catalog";
import type { CurriculumThemeOverview } from "@/server/queries/curriculum";
import { moduleIcon } from "./module-icon";
import { ProgressBar } from "./progress-bar";
import {
  BRIEFING_BACKDROP_VARIANTS,
  BRIEFING_PANEL_VARIANTS,
  CHECKLIST_ITEM_VARIANTS,
  CHECKLIST_LIST_VARIANTS,
  DISPLAY_TEXT,
  GLOW,
  SPRING,
  THREAT_META,
} from "./theme-config";

export interface MissionBriefingProps {
  theme: CurriculumThemeOverview;
  category: CurriculumCategoryMeta;
  /** Résumé d'objectif déjà résolu par `resolveLessonContent` — jamais recalculé ici. */
  objective: string;
  /** Idées clés déjà résolues — deviennent la "Mission Checklist", jamais un texte inventé pour l'occasion. */
  keyIdeas: readonly string[];
  onEnter: () => void;
}

function preventDismiss(event: Event) {
  event.preventDefault();
}

export function MissionBriefing({ theme, category, objective, keyIdeas, onEnter }: MissionBriefingProps) {
  const threat = THREAT_META[theme.level];
  const hasProgress = theme.totalPuzzles > 0;

  return (
    <Dialog.Root open modal>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            variants={BRIEFING_BACKDROP_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 z-50 flex items-center justify-center bg-mission-overlay p-4 backdrop-blur-sm"
          >
            <Dialog.Content
              asChild
              onEscapeKeyDown={preventDismiss}
              onPointerDownOutside={preventDismiss}
              onInteractOutside={preventDismiss}
            >
              <motion.div
                variants={BRIEFING_PANEL_VARIANTS}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 sm:p-8"
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${threat.textClass} ${threat.borderClass}`}
                  >
                    <span aria-hidden="true">{threat.icon}</span>
                    Niveau de menace : {threat.label}
                  </span>
                  <span className="text-2xl" aria-hidden="true">
                    {moduleIcon(category.id)}
                  </span>
                </div>

                <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-foreground-muted">
                  Module — {category.label}
                  {category.author && <span> · {category.author}</span>}
                </p>
                <Dialog.Title asChild>
                  <h1 className={`mt-1 text-2xl text-foreground sm:text-3xl ${DISPLAY_TEXT}`}>{theme.title}</h1>
                </Dialog.Title>

                <Dialog.Description asChild>
                  <p className="mt-4 text-sm text-foreground-muted">{objective}</p>
                </Dialog.Description>

                <div className="mt-6">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">📋 Mission checklist</h2>
                  <motion.ul
                    variants={CHECKLIST_LIST_VARIANTS}
                    initial="hidden"
                    animate="visible"
                    className="mt-3 space-y-2"
                  >
                    {keyIdeas.map((idea, index) => (
                      <motion.li key={index} variants={CHECKLIST_ITEM_VARIANTS} className="flex gap-2.5 text-sm text-foreground">
                        <span aria-hidden="true" className="mt-0.5 shrink-0 font-mono text-xs text-accent">
                          [{String(index + 1).padStart(2, "0")}]
                        </span>
                        <span>{idea}</span>
                      </motion.li>
                    ))}
                  </motion.ul>
                </div>

                {hasProgress && (
                  <div className="mt-6">
                    <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">Progression du module</p>
                    <ProgressBar completed={theme.completedCount} total={theme.totalPuzzles} className="mt-2" />
                  </div>
                )}

                <motion.button
                  type="button"
                  onClick={onEnter}
                  whileHover={{ boxShadow: GLOW.cta, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  transition={SPRING}
                  className="mt-8 w-full rounded-lg bg-accent px-5 py-3 text-sm font-bold uppercase tracking-wide text-accent-foreground"
                >
                  Entrer dans l&apos;arène ➔
                </motion.button>
              </motion.div>
            </Dialog.Content>
          </motion.div>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
