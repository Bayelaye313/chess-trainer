"use client";

import { useMemo } from "react";
import { QUALITY_LABEL, QUALITY_SYMBOL } from "@/lib/labels";
import type { CurriculumCategoryOverview } from "@/server/queries/curriculum";
import { buildPlaybookModel, formatThemeProgress, formatTierProgress, PLAYBOOK_TIER_ORDER, type PlaybookThemeRow, type PlaybookTierLane } from "./playbook-model";
import styles from "./playbook-learn.module.css";

const qualityNotation = [
  { key: "brilliant", color: "brilliant" },
  { key: "best", color: "best" },
  { key: "inaccuracy", color: "inaccuracy" },
  { key: "blunder", color: "blunder" },
] as const;

function TierDial({ lane }: { lane: PlaybookTierLane }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (lane.percent / 100) * circumference;
  return <div className={`${styles.tierDial} ${styles[`tier${lane.level}`]}`} aria-label={`${lane.percent}% maîtrisé`}>
    <svg viewBox="0 0 72 72" role="img" aria-hidden="true"><circle className={styles.dialTrack} cx="36" cy="36" r={radius} /><circle className={styles.dialValue} cx="36" cy="36" r={radius} style={{ strokeDasharray: circumference, strokeDashoffset: dashOffset }} /></svg>
    <span><strong>{lane.percent}%</strong><small>maîtrise</small></span>
  </div>;
}

function LessonFile({ theme, onOpen }: { theme: PlaybookThemeRow; onOpen: (theme: PlaybookThemeRow) => void }) {
  const interactive = theme.state !== "locked" && theme.state !== "empty";
  const stateLabel = theme.state === "completed" ? "✓ Terminé" : theme.state === "active" ? "● En cours" : theme.state === "empty" ? "En attente" : theme.state === "locked" ? "Verrouillée" : "À commencer";
  return <button type="button" disabled={!interactive} onClick={() => onOpen(theme)} className={`${styles.lessonFile} ${styles[`state${theme.state}`]}`}>
    <span className={styles.fileTop}><span>{stateLabel}</span><em>{theme.id.slice(-2).toUpperCase()}</em></span>
    <strong>{theme.title}</strong>
    <span className={styles.fileDescription}>{theme.description}</span>
    <span className={styles.fileBottom}><span>{formatThemeProgress(theme)}</span><b>+{theme.rewardXp} XP</b></span>
  </button>;
}

function TierLane({ lane, onOpen }: { lane: PlaybookTierLane; onOpen: (theme: PlaybookThemeRow) => void }) {
  return <section className={`${styles.tierLane} ${styles[`tier${lane.level}`]}`} aria-labelledby={`tier-${lane.level}`}>
    <div className={styles.tierMeta}><span className={styles.tierNumber}>{String(PLAYBOOK_TIER_ORDER.indexOf(lane.level) + 1).padStart(2, "0")}</span><div><h3 id={`tier-${lane.level}`}>{lane.label}</h3><p>{lane.description}</p><small>{formatTierProgress(lane)}</small></div></div>
    <div className={styles.tierContent}><TierDial lane={lane} /><span className={styles.connector} aria-hidden="true" /><div className={styles.files}>{lane.themes.length > 0 ? lane.themes.map((theme) => <LessonFile key={theme.id} theme={theme} onOpen={onOpen} />) : <p className={styles.emptyLane}>Aucune leçon disponible.</p>}</div></div>
  </section>;
}

export function PlaybookLearnScreen({
  categories,
  onOpenTheme,
}: {
  categories: readonly CurriculumCategoryOverview[];
  /**
   * Direct-to-Lesson (feuille de route Zone 1) : UN clic sur une fiche (ou le
   * bouton « Reprendre ») ouvre immédiatement l'arène du thème — `lesson`
   * (lecteur interactif) si le thème porte un cours, `session` (theme-session)
   * sinon — jamais plus la sous-liste intermédiaire du module. Le routage est
   * résolu par `LearnScreen` (`directViewForTheme`), ce composant ne décide que
   * de LA FICHE cliquée.
   */
  onOpenTheme: (categoryId: string, themeId: string) => void;
}) {
  const model = useMemo(() => buildPlaybookModel(categories), [categories]);
  // Purge dynamique des thèmes « 0 exercice » (feuille de route Zone 1) : les
  // fiches des réservoirs `lichess_*` encore vides ne sont plus rendues dans
  // les couloirs — l'UI reste impeccable même avant le premier import. Les
  // totaux du modèle (XP, progression, maîtrises) ignorent déjà ces thèmes
  // (`buildPlaybookModel` ne compte que les « authentiques »), le filtre ne
  // fait que aligner le RENDU sur ce décompte.
  const tiers = useMemo(
    () => model.tiers.map((lane) => ({ ...lane, themes: lane.themes.filter((theme) => theme.state !== "empty") })),
    [model],
  );
  const selectedTheme = model.activeTheme;
  const openTheme = (theme: PlaybookThemeRow) => onOpenTheme(theme.categoryId, theme.id);
  const levelTarget = model.nextLevelXp;
  return <div className={styles.canvas}>
    <div className={styles.ambientLine} aria-hidden="true" /><span className={styles.spark} aria-hidden="true" /><span className={`${styles.spark} ${styles.sparkPurple}`} aria-hidden="true" />
    <main className={styles.inner}>
      <header className={styles.overviewHeader}><div><p className={styles.eyebrow}>Tableau d&apos;entraînement / 03</p><h1>Construis le prochain coup.</h1><p className={styles.lede}>Une mission active, trois paliers et des leçons courtes pour transformer tes décisions en réflexes de partie.</p></div><div className={styles.qualityStrip} aria-label="Légende des qualités de coup"><span>Qualité</span>{qualityNotation.map(({ key, color }) => <span key={key} className={styles.qualityItem}><b className={styles[color]}>{QUALITY_SYMBOL[key]}</b>{QUALITY_LABEL[key]}</span>)}</div></header>
      <section className={styles.mission} aria-labelledby="mission-title"><div className={styles.missionLabel}><span>Mission en cours</span><b>#{selectedTheme ? "07" : "—"}</b></div><div className={styles.missionBody}><p className={styles.kicker}>{selectedTheme ? `${selectedTheme.categoryLabel} / ${selectedTheme.level}` : "Parcours prêt"}</p><h2 id="mission-title">{selectedTheme?.title ?? "Aucune mission active"}</h2><p>{selectedTheme?.description ?? "Termine une leçon disponible pour ouvrir la prochaine étape."}</p></div><div className={styles.missionProgress}><div><span>Progression</span><b>{selectedTheme ? `${selectedTheme.progressPercent}%` : "0%"}</b></div><div className={styles.progressBar}><span style={{ width: `${selectedTheme?.progressPercent ?? 0}%` }} /></div></div><button className={styles.primaryAction} type="button" disabled={!selectedTheme} onClick={() => selectedTheme && openTheme(selectedTheme)}>Reprendre <span aria-hidden="true">→</span></button></section>
      <section className={styles.levelRail} aria-label="Progression de niveau"><div><span>Niveau actuel</span><strong>Niveau {model.level}</strong></div><div className={styles.levelTrack}><span style={{ width: `${model.levelPercent}%` }} /><small>NIVEAU {model.level} → NIVEAU {model.level + 1}</small></div><div className={styles.xpBalance}><strong>{model.levelXp} XP</strong><span>/ {levelTarget} XP</span></div><div className={styles.nextLevel}><span>Prochain niveau</span><strong>Maître des lignes</strong><b>+220 XP</b></div></section>
      <section className={styles.pathSection} aria-labelledby="path-title"><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Parcours / couloirs d&apos;apprentissage</p><h2 id="path-title">Progression par paliers</h2></div><span>{model.totalThemes} leçons · {model.masteredThemes} maîtrisées · {model.earnedXp} XP acquis</span></div><div className={styles.lanes}>{tiers.map((lane) => <TierLane key={lane.level} lane={lane} onOpen={openTheme} />)}</div></section>
      <footer className={styles.footer}><strong>Progression sauvegardée</strong><span>Les qualités de coup suivent les mêmes repères que la revue de partie.</span><small>Session locale / prête pour la prochaine session</small></footer>
    </main>
  </div>;
}
