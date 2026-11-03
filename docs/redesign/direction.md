# Refonte UX/UI — direction

Branche `redesign`, partie de `origin/feat/middlegame-academy-noseknowsall` (60ae588) : ce commit contient
`main` (main n'a en plus que le commit de fusion) et correspond à l'état décrit par `docs/app-inventory.md`
(route `/rapport/ouvertures/<slug>`, 13 cours d'ouverture). Les décisions prises seul sont consignées en fin
de fichier.

## 1. Architecture

```
Rail (desktop) / barre inférieure (mobile)            En-tête : logo · pastille de synchro · ⚙ Réglages
├─ Aujourd'hui   /            Continuer · cartes à réviser · Jouer · Réviser · 5 parties récentes
│                └─ /parties  toutes les parties (recherche, pagination ; /?page=n redirige ici)
├─ Jouer         /jouer       niveau du bot, couleur, Commencer ; partie en cours ; bilan
├─ Ouvertures    /ouvertures  Mon répertoire (Blancs / Noirs) · Autres ouvertures (replié) · Mon niveau (replié)
│                ├─ /ouvertures/<id>          onglets Cours · Drill · Mes parties · Mes erreurs
│                ├─ /ouvertures/<id>/cours    lecteur (échiquier en vedette, reprise du dernier nœud)
│                └─ /ouvertures/historique-endurance
├─ S'entraîner   sélecteur de section : Réviser /entrainer · Académie /apprendre · Pièges /pieges
└─ Progrès       /rapport     3 chiffres · précision par phase · Mes ouvertures face au cours · tableau
                 ├─ /rapport/ouvertures/<slug>, /rapport/brillants
                 └─ accès à l'endurance et aux parties
Réglages        /plus        comptes liés · moteur · plan du jour · version
```

## 2. Glossaire (un mot = un sens)

| Mot | Sens unique | Ne plus dire |
|---|---|---|
| **S'entraîner** | La destination qui regroupe Réviser, Académie et Pièges. | « Entraîner » (onglet), « Salle / Tableau d'entraînement » |
| **Révisions** / **Réviser** | Répétition espacée : cartes tirées de tes erreurs (7 decks) et variantes d'ouverture dues. | « decks FSRS », « Corrigez vos gaffes » |
| **Drill** | Rejouer de mémoire une ligne (ouverture ou piège), Manche 1 guidée puis Manche 2 sans aide. | « Mode Entraînement », « drill Listudy », « simulateur de survie » |
| **Séance** | La liste concrète d'actions proposées aujourd'hui. | « 4/4 actions » sans contexte |
| **Plan** | Tes réglages qui produisent la séance : objectifs + nombre d'actions. | — |
| **Académie** | Thèmes commentés + exercices, par catégorie. | « Apprendre » comme nom de section |
| **Cours** | Lecteur commenté coup par coup d'une ouverture. | « Cours commenté coup par coup », « simulateur » |
| **Carte** | Une position à réviser dans un deck. | « puzzle FSRS » |
| **Exercice** | Une position à résoudre dans l'Académie ou un piège. | — |
| **Sans aide** | Manche 2 d'un drill, sans indices (« Sans Guide » dans les données). | « Sans Guide » en libellé d'interface |

Tutoiement partout. Une phrase de contexte maximum sous chaque titre, jamais de surtitre numéroté.

## 3. Direction visuelle (en 5 lignes)

1. **Salle d'étude de nuit** : fond ardoise profonde dérivé de la case foncée de l'échiquier (`#4e6a84`, teinte 209°), trois paliers de surface, aucune décoration (ni grille, ni lueur, ni dégradé).
2. **Un seul accent, « ivoire d'acier » `#c9d6e2`**, tiré de la case claire (`#c7d3df`) : boutons principaux pleins, onglet actif, focus. Toute autre couleur vient de l'échiquier et des qualités de coup.
3. **Couleur = sens** : jetons `--quality-*` et flèches moteur inchangés ; chaque statut porte une icône lucide ET un libellé.
4. **Typographie de livre d'échecs** : Fraunces (titres, axe optique) + IBM Plex Sans (texte) + IBM Plex Mono (notation, évaluations, Elo, chronos — chiffres tabulaires), auto-hébergées.
5. **Hiérarchie par taille et poids**, séparateurs fins plutôt que cartes imbriquées ; rayons 4/6/10 px, élévation réservée aux tiroirs et menus, mouvements de 120 à 200 ms désactivés par `prefers-reduced-motion`.

## 4. Jetons (`src/app/globals.css`)

Un seul jeu, déclaré sur `:root` avec `color-scheme: dark` ; un futur thème clair redéfinira les mêmes noms
sous `[data-theme="light"]`.

| Famille | Jetons |
|---|---|
| Fonds | `--background #0d1217`, `--surface #141b22`, `--surface-muted #1b242d`, `--surface-raised #233040` |
| Bords | `--border #2b3744`, `--border-strong #3d4c5c` |
| Texte | `--foreground #e9eef3`, `--foreground-muted #a7b3bf`, `--foreground-subtle #8f9cab` (remplace `--es-dim`) |
| Accent | `--accent #c9d6e2`, `--accent-hover #e0e8f0`, `--accent-foreground #0d1217` |
| Échiquier | `--board-light #c7d3df`, `--board-dark #4e6a84` |
| Statut (texte) | `--status-success` = best, `--status-warning` = inaccuracy, `--status-danger #f07a76` (le rouge de gaffe `#c93230` reste pour les fonds et pastilles), `--status-info #8fb3cf` |
| Typo | `--font-display`, `--font-sans`, `--font-mono` ; tailles Tailwind ; titres de page ≤ 28 px sur mobile |
| Espacement | échelle Tailwind (4 px) ; `--space-page` (gouttière), `--header-h` 56 px, `--rail-w` 88 px, `--tabbar-h` 64 px |
| Rayons | `--radius-sm 4px`, `--radius-md 6px`, `--radius-lg 10px`, `--radius-xl 12px` (via `@theme`, plus d'écrasement global) |
| Élévation | `--shadow-overlay` (tiroirs, menus, toast) uniquement |
| Mouvement | `--duration-fast 120ms`, `--duration-base 180ms`, `--ease-standard` |

Conservés tels quels : `--quality-*`, `QUALITY_SYMBOL`, `--engine-arrow-*`, `--eval-*`, `--tier-*`.

## 5. Primitives (`src/components/ui/`)

`Button` / `ButtonLink` (primary, secondary, ghost ; 44 px de haut par défaut), `Card`, `Chip` (icône + libellé,
tons neutre/succès/alerte/danger/info), `Tabs` (Radix), `PageHeader` (titre + une phrase + action), `Disclosure`
(`<details>` stylé), `EmptyState`, `Stat`, `Sheet` (tiroir latéral Radix Dialog), `SectionSwitcher` (sélecteur de
section de S'entraîner), `BackLink` (un seul style de retour, toujours en haut à gauche).

## 6. Décisions prises seul

Voir le rapport final ; la liste est tenue à jour dans `docs/redesign/decisions.md`.
