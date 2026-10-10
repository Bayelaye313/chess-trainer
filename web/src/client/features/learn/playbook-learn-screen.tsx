"use client";

import { useMemo, useState } from "react";
import { QUALITY_LABEL, QUALITY_SYMBOL } from "@/lib/labels";
import type { CurriculumCategoryOverview } from "@/server/queries/curriculum";
import { moduleIcon } from "./module-icon";
import { buildPlaybookModel, formatSectionProgress, formatThemeProgress, LEVEL_LABEL, type PlaybookCategorySection, type PlaybookLevelGroup, type PlaybookThemeRow } from "./playbook-model";
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

function ThemeCard({ theme, onOpen }: { theme: PlaybookThemeRow; onOpen: (theme: PlaybookThemeRow) => void }) {
  const stateLabel = theme.state === "completed" ? "✓ Maîtrisé" : theme.state === "active" ? "● À reprendre" : theme.completedCount > 0 ? "En cours" : "À découvrir";
  return <button type="button" onClick={() => onOpen(theme)} className={`${styles.lessonFile} ${styles[`state${theme.state}`]}`}>
    <span className={styles.fileTop}><span>Module {theme.moduleNumber}</span><span>{stateLabel}</span></span>
    <strong>{theme.title}</strong>
    <span className={styles.fileBottom}><span>{formatThemeProgress(theme)} exercices</span><span className={styles.miniBar} aria-hidden="true"><span style={{ width: `${theme.progressPercent}%` }} /></span></span>
  </button>;
}

function LevelGroup({ group, onOpen }: { group: PlaybookLevelGroup; onOpen: (theme: PlaybookThemeRow) => void }) {
  return <div className={`${styles.levelGroup} ${styles[`level${group.level}`]}`}>
    <h4 className={styles.levelHeading}><span>{group.label}</span><small>{group.masteredCount} / {group.themes.length} maîtrisé{group.masteredCount > 1 ? "s" : ""}</small></h4>
    <div className={styles.cardGrid}>{group.themes.map((theme) => <ThemeCard key={theme.id} theme={theme} onOpen={onOpen} />)}</div>
  </div>;
}

function CategorySection({ section, open, onToggle, onOpen }: { section: PlaybookCategorySection; open: boolean; onToggle: (open: boolean) => void; onOpen: (theme: PlaybookThemeRow) => void }) {
  return <details id={`categorie-${section.id}`} className={styles.categorySection} open={open} onToggle={(event) => onToggle(event.currentTarget.open)}>
    <summary className={styles.categoryHeader}>
      <span className={styles.categoryIcon} aria-hidden="true">{moduleIcon(section.id)}</span>
      <div className={styles.categoryText}>
        <h3>{section.label}{section.author && <small> — {section.author}</small>}</h3>
        <p>{section.description}</p>
      </div>
      <div className={styles.categoryStats}><SectionDial percent={section.percent} /><span>{formatSectionProgress(section)}<br />{section.totalCount} thème{section.totalCount > 1 ? "s" : ""}</span><b className={styles.chevron} aria-hidden="true">▾</b></div>
    </summary>
    {section.levels.map((group) => <LevelGroup key={group.level} group={group} onOpen={onOpen} />)}
  </details>;
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
  // Catégories repliables : seule celle du thème « Reprendre » est ouverte au départ.
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(() => new Set(selectedTheme ? [selectedTheme.categoryId] : model.sections.slice(0, 1).map((section) => section.id)));
  const setOpen = (id: string, open: boolean) => setOpenIds((previous) => {
    if (previous.has(id) === open) return previous;
    const next = new Set(previous);
    if (open) next.add(id); else next.delete(id);
    return next;
  });
  return <div className={styles.canvas}>
    <div className={styles.ambientLine} aria-hidden="true" /><span className={styles.spark} aria-hidden="true" /><span className={`${styles.spark} ${styles.sparkPurple}`} aria-hidden="true" />
    <main className={styles.inner}>
      <header className={styles.overviewHeader}><div><p className={styles.eyebrow}>Tableau d&apos;entraînement / 04</p><h1>Construis le prochain coup.</h1><p className={styles.lede}>Des cours commentés coup par coup, puis des exercices réels pour transformer tes décisions en réflexes de partie.</p></div><div className={styles.qualityStrip} aria-label="Légende des qualités de coup"><span>Qualité</span>{qualityNotation.map(({ key, color }) => <span key={key} className={styles.qualityItem}><b className={styles[color]}>{QUALITY_SYMBOL[key]}</b>{QUALITY_LABEL[key]}</span>)}</div></header>
      <section className={styles.mission} aria-labelledby="mission-title"><div className={styles.missionLabel}><span>Mission en cours</span><b>{selectedTheme ? moduleIcon(selectedTheme.categoryId) : "—"}</b></div><div className={styles.missionBody}><p className={styles.kicker}>{selectedTheme ? `${selectedTheme.categoryLabel} / ${LEVEL_LABEL[selectedTheme.level]}` : "Parcours prêt"}</p><h2 id="mission-title">{selectedTheme?.title ?? "Aucune mission active"}</h2><p>{selectedTheme?.description ?? "Termine une leçon disponible pour ouvrir la prochaine étape."}</p></div><div className={styles.missionProgress}><div><span>Progression</span><b>{selectedTheme ? `${selectedTheme.progressPercent}%` : "0%"}</b></div><div className={styles.progressBar}><span style={{ width: `${selectedTheme?.progressPercent ?? 0}%` }} /></div></div><button className={styles.primaryAction} type="button" disabled={!selectedTheme} onClick={() => selectedTheme && openTheme(selectedTheme)}>Reprendre <span aria-hidden="true">→</span></button></section>
      <section className={styles.levelRail} aria-label="Progression de niveau"><div><span>Niveau actuel</span><strong>Niveau {model.level}</strong></div><div className={styles.levelTrack}><span style={{ width: `${model.levelPercent}%` }} /><small>NIVEAU {model.level} → NIVEAU {model.level + 1}</small></div><div className={styles.xpBalance}><strong>{model.levelXp} XP</strong><span>/ {levelTarget} XP</span></div><div className={styles.nextLevel}><span>Prochain niveau</span><strong>Maître des lignes</strong><b>+220 XP</b></div></section>
      <section className={styles.pathSection} aria-labelledby="path-title"><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Académie / {model.sections.length} catégories</p><h2 id="path-title">Choisis un thème</h2></div><span>{model.totalThemes} thèmes · {model.masteredThemes} maîtrisés · {model.earnedXp} XP acquis</span></div><nav className={styles.categoryNav} aria-label="Catégories">{model.sections.map((section) => <a key={section.id} href={`#categorie-${section.id}`} onClick={() => setOpen(section.id, true)}><span aria-hidden="true">{moduleIcon(section.id)}</span>{section.label}<b>{section.totalCount}</b></a>)}</nav><div className={styles.sections}>{model.sections.map((section) => <CategorySection key={section.id} section={section} open={openIds.has(section.id)} onToggle={(open) => setOpen(section.id, open)} onOpen={openTheme} />)}</div></section>
      <footer className={styles.footer}><strong>Progression sauvegardée</strong><span>Les qualités de coup suivent les mêmes repères que la revue de partie.</span><small>Session locale / prête pour la prochaine session</small></footer>
    </main>
  </div>;
}
