"use client";

import { useMemo } from "react";
import { QUALITY_LABEL, QUALITY_SYMBOL } from "@/lib/labels";
import type { CurriculumCategoryOverview } from "@/server/queries/curriculum";
import { moduleIcon } from "./module-icon";
import { buildPlaybookModel, formatSectionProgress, formatThemeProgress, LEVEL_LABEL, type PlaybookCategorySection, type PlaybookThemeRow } from "./playbook-model";
import styles from "./playbook-learn.module.css";

const qualityNotation = [
  { key: "brilliant", color: "brilliant" },
  { key: "best", color: "best" },
  { key: "inaccuracy", color: "inaccuracy" },
  { key: "blunder", color: "blunder" },
] as const;

function SectionDial({ percent }: { percent: number }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  return <div className={styles.sectionDial} aria-label={`${percent}% maîtrisé`}>
    <svg viewBox="0 0 52 52" role="img" aria-hidden="true"><circle className={styles.dialTrack} cx="26" cy="26" r={radius} /><circle className={styles.dialValue} cx="26" cy="26" r={radius} style={{ strokeDasharray: circumference, strokeDashoffset: circumference - (percent / 100) * circumference }} /></svg>
    <strong>{percent}%</strong>
  </div>;
}

function ThemeCard({ theme, index, onOpen }: { theme: PlaybookThemeRow; index: number; onOpen: (theme: PlaybookThemeRow) => void }) {
  const stateLabel = theme.state === "completed" ? "✓ Maîtrisé" : theme.state === "active" ? "● À reprendre" : theme.completedCount > 0 ? "En cours" : "À découvrir";
  return <button type="button" onClick={() => onOpen(theme)} className={`${styles.lessonFile} ${styles[`state${theme.state}`]}`}>
    <span className={styles.fileTop}><span>{String(index + 1).padStart(2, "0")} · {stateLabel}</span><em className={styles[`level${theme.level}`]}>{LEVEL_LABEL[theme.level]}</em></span>
    <strong>{theme.title}</strong>
    <span className={styles.fileBottom}><span>{formatThemeProgress(theme)} exercices</span><span className={styles.miniBar} aria-hidden="true"><span style={{ width: `${theme.progressPercent}%` }} /></span></span>
  </button>;
}

function CategorySection({ section, onOpen }: { section: PlaybookCategorySection; onOpen: (theme: PlaybookThemeRow) => void }) {
  return <section id={`categorie-${section.id}`} className={styles.categorySection} aria-labelledby={`titre-${section.id}`}>
    <header className={styles.categoryHeader}>
      <span className={styles.categoryIcon} aria-hidden="true">{moduleIcon(section.id)}</span>
      <div className={styles.categoryText}>
        <h3 id={`titre-${section.id}`}>{section.label}{section.author && <small> — {section.author}</small>}</h3>
        <p>{section.description}</p>
      </div>
      <div className={styles.categoryStats}><SectionDial percent={section.percent} /><span>{formatSectionProgress(section)}<br />{section.totalCount} thème{section.totalCount > 1 ? "s" : ""}</span></div>
    </header>
    <div className={styles.cardGrid}>{section.themes.map((theme, index) => <ThemeCard key={theme.id} theme={theme} index={index} onOpen={onOpen} />)}</div>
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
  // Les thèmes « 0 exercice » sont déjà écartés des sections par `buildPlaybookModel`.
  const model = useMemo(() => buildPlaybookModel(categories), [categories]);
  const selectedTheme = model.activeTheme;
  const openTheme = (theme: PlaybookThemeRow) => onOpenTheme(theme.categoryId, theme.id);
  const levelTarget = model.nextLevelXp;
  return <div className={styles.canvas}>
    <div className={styles.ambientLine} aria-hidden="true" /><span className={styles.spark} aria-hidden="true" /><span className={`${styles.spark} ${styles.sparkPurple}`} aria-hidden="true" />
    <main className={styles.inner}>
      <header className={styles.overviewHeader}><div><p className={styles.eyebrow}>Tableau d&apos;entraînement / 03</p><h1>Construis le prochain coup.</h1><p className={styles.lede}>Des cours commentés coup par coup, puis des exercices réels pour transformer tes décisions en réflexes de partie.</p></div><div className={styles.qualityStrip} aria-label="Légende des qualités de coup"><span>Qualité</span>{qualityNotation.map(({ key, color }) => <span key={key} className={styles.qualityItem}><b className={styles[color]}>{QUALITY_SYMBOL[key]}</b>{QUALITY_LABEL[key]}</span>)}</div></header>
      <section className={styles.mission} aria-labelledby="mission-title"><div className={styles.missionLabel}><span>Mission en cours</span><b>{selectedTheme ? moduleIcon(selectedTheme.categoryId) : "—"}</b></div><div className={styles.missionBody}><p className={styles.kicker}>{selectedTheme ? `${selectedTheme.categoryLabel} / ${LEVEL_LABEL[selectedTheme.level]}` : "Parcours prêt"}</p><h2 id="mission-title">{selectedTheme?.title ?? "Aucune mission active"}</h2><p>{selectedTheme?.description ?? "Termine une leçon disponible pour ouvrir la prochaine étape."}</p></div><div className={styles.missionProgress}><div><span>Progression</span><b>{selectedTheme ? `${selectedTheme.progressPercent}%` : "0%"}</b></div><div className={styles.progressBar}><span style={{ width: `${selectedTheme?.progressPercent ?? 0}%` }} /></div></div><button className={styles.primaryAction} type="button" disabled={!selectedTheme} onClick={() => selectedTheme && openTheme(selectedTheme)}>Reprendre <span aria-hidden="true">→</span></button></section>
      <section className={styles.levelRail} aria-label="Progression de niveau"><div><span>Niveau actuel</span><strong>Niveau {model.level}</strong></div><div className={styles.levelTrack}><span style={{ width: `${model.levelPercent}%` }} /><small>NIVEAU {model.level} → NIVEAU {model.level + 1}</small></div><div className={styles.xpBalance}><strong>{model.levelXp} XP</strong><span>/ {levelTarget} XP</span></div><div className={styles.nextLevel}><span>Prochain niveau</span><strong>Maître des lignes</strong><b>+220 XP</b></div></section>
      <section className={styles.pathSection} aria-labelledby="path-title"><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Académie / {model.sections.length} catégories</p><h2 id="path-title">Choisis un thème</h2></div><span>{model.totalThemes} thèmes · {model.masteredThemes} maîtrisés · {model.earnedXp} XP acquis</span></div><nav className={styles.categoryNav} aria-label="Catégories">{model.sections.map((section) => <a key={section.id} href={`#categorie-${section.id}`}><span aria-hidden="true">{moduleIcon(section.id)}</span>{section.label}<b>{section.totalCount}</b></a>)}</nav><div className={styles.sections}>{model.sections.map((section) => <CategorySection key={section.id} section={section} onOpen={openTheme} />)}</div></section>
      <footer className={styles.footer}><strong>Progression sauvegardée</strong><span>Les qualités de coup suivent les mêmes repères que la revue de partie.</span><small>Session locale / prête pour la prochaine session</small></footer>
    </main>
  </div>;
}
