# Inventaire de l'application Chess Trainer — état des lieux avant refonte UX/UI

Relevé du 2026-10-19 (09:00–09:55), branche `feat/middlegame-academy-noseknowsall`, dernier commit `4608cea` (« queens-gambit-declined: cours v2 », 09:07).

**Conditions du relevé**
- L'application a été lancée. 1re tentative (`npx next dev`, Turbopack) : aucune sortie après 5 min, arrêtée. 2e tentative réussie : `next dev --webpack`, Next.js 16.3.0, port 3007.
- Pour ne rien écrire dans le dépôt ni dans la base, le serveur a tourné sur une **copie** du dossier `web/` (hors dépôt, `node_modules` relié par jonction) et sur une **copie** de `data/chess-trainer.db` (sauvegarde SQLite en lecture seule). Raison : plusieurs lectures de page écrivent en base (seed du curriculum dans `server/queries/curriculum.ts`, lot quotidien dans `spaced-repetition.ts`) et `POST /api/sync` est appelé au chargement de chaque page. Pendant les captures, `POST /api/sync` a été intercepté (aucun appel à Chess.com ni à Lichess).
- Les volumes de la section 5 ont été lus en lecture seule dans `web/data/chess-trainer.db`.
- Le dépôt a été modifié pendant le relevé par un autre processus que cet inventaire : commit `4608cea` à 09:07 (cours `queens-gambit-declined`), modifications non commitées de `opening-course-ids.ts` et `opening-course-trees.ts` (enregistrement du cours `sicilian-najdorf`), `pm-les-coups-de-rupture.ts` (+203 lignes), puis vers 09:45 `openings.ts` (nouvelle carte `anti-london-black`, « Anti-Londres (setup Est-Indien) », sans cours) et `opening-commentary.ts`. Les mesures et captures reflètent l'état de 09:00–09:40 : 31 cartes d'ouverture, 11 cours enregistrés. Cet inventaire n'a touché aucun de ces fichiers.
- « Visible sans défiler » = fenêtre de 1440×900 px (desktop) ou 390×844 px (mobile), mesuré 6 s après le chargement. Les 6 liens de l'en-tête (logo + 5 onglets) sont comptés à part. Les cases d'échiquier exposées comme boutons sont comptées à part (« + N cases »).
- Un inventaire du 2026-10-18 existait dans ce fichier ; il a été entièrement revérifié. Corrections apportées : états vides de `/rapport/brillants`, de l'historique d'endurance et de la liste des parties (existent), 7 boutons « Démarrer la révision » et non 6, parties locales avec PGN consultables, comptages d'éléments interactifs (les cases d'échiquier étaient incluses dans les totaux).

---

## 1. STACK ET STYLE ACTUEL

### Technique
| Élément | Valeur |
|---|---|
| Framework | Next.js 16.3.0 (App Router), React 19.2.8, TypeScript 5 |
| Données | SQLite (`better-sqlite3`) + Drizzle ORM 0.45 ; Server Actions (`src/server/actions/`) ; 15 migrations appliquées |
| Échecs | `chess.js` 1.4, `react-chessboard` 5.12, Stockfish 18 (WASM dans le navigateur, build `lite` ; natif côté Node pour l'import), `chess-openings` (base ECO) |
| Répétition espacée | `ts-fsrs` 5.4 (FSRS) |
| Bibliothèque de composants | Aucune bibliothèque complète. Radix UI ponctuel : `@radix-ui/react-accordion` (dans `course-curriculum.tsx`, vue catégorie d'Apprendre) et `@radix-ui/react-dialog` (dans `mission-briefing.tsx`, composant monté nulle part) |
| Animations | `motion` 13 (`move-fx-overlay.tsx`, `games-search-list.tsx`, `academy-puzzle-arena.tsx`, `course-curriculum.tsx`, `mission-briefing.tsx`, `opening-coaching-panel.tsx`) + keyframes CSS dans `globals.css` (`fade-up-in`, `slide-up-in`, `shake-error`, `trap-alert-flash`, `coach-bubble-in`, `coach-word`, `coach-caret`) |
| Icônes | Aucune bibliothèque d'icônes. 5 SVG inline dessinés à la main pour la navigation (`components/ui/nav.tsx`) ; partout ailleurs des emojis (🎮, 📖, ⚡, 🎯, 📊, 🐥, 🛡️, ⚔️, 🦾, 💀, 🗓️, ♚, 🏁, 🧩…) |
| Polices | Geist (sans) et Geist Mono, auto-hébergées (`src/app/fonts/*.woff2`, `next/font/local`, graisse variable 100–900) ; repli `ui-sans-serif, system-ui, Segoe UI, Arial` / `ui-monospace, Cascadia Mono, Consolas` |
| CSS | Tailwind CSS v4 (`@import "tailwindcss"`, `@theme inline`, pas de `tailwind.config.js`) + 3 modules CSS : `components/ui/nav.module.css`, `components/ui/esport-page.module.css`, `client/features/learn/playbook-learn.module.css` |
| Tests | Vitest 4, environnement `node`, 76 fichiers `*.test.ts`, aucun test de rendu de composant |
| Dépendance déclarée sans usage dans `src/` ni `scripts/` | `@qoder-ai/qoder-agent-sdk` |

### Tokens (couleurs)
Deux jeux de jetons coexistent : `:root` (`globals.css`) et une redéfinition locale dans `.canvas` (`esport-page.module.css`), appliquée à toutes les pages enveloppées dans `EsportCanvas` (toutes les routes ; l'en-tête de navigation et la page 404 restent sur `:root`).

| Jeton | `:root` (global) | `.canvas` (pages) |
|---|---|---|
| `--background` | `#020617` | `#0b0c10` |
| `--surface` | `#0f172a` | `#151b23` |
| `--surface-muted` | `#1e293b` | `#1f2833` |
| `--border` | `#334155` | `rgb(255 255 255 / .13)` |
| `--foreground` | `#f1f5f9` | `#f7f9fb` |
| `--foreground-muted` | `#94a3b8` | `#8d98a8` |
| `--accent` | `#38bdf8` | `#66fcf1` |
| `--accent-foreground` | `#04121f` | `#0b0c10` |
| `--es-dim` | — | `#5c6878` |
| `--es-purple` | — | `#8a2be2` |

- Qualité de coup (identiques partout) : brillant `#1baaa6`, critique `#5b8faf`, meilleur `#98bc49`, correct `#97af8b`, imprécision `#f4bf44`, gaffe `#c93230`, théorique `#a88764`.
- Graphe d'évaluation : panneau `#faf9f6`, remplissage blanc `#f2f0e8`, noir `#2b2a25`, ligne `#4a4940`, grille `#ded9cd`, texte `#6b6a63`, mat `#eab308`.
- Flèches moteur : meilleur `#22c55e`, 2e `#38bdf8`, autre `#f4bf44`, coup joué `#f97316`.
- Paliers : bronze `#c2793a`, argent `#b6c2d1`, or `#eab308`. Coach « surprise » `#a78bfa`. Voile `--mission-overlay: rgb(2 6 23 / 92%)`.
- Surface « papier » des textes de cours (`.paper-surface`) : fond `#faf9f6`, texte `#1f2328`, texte secondaire `#5b5a54`, bordure `#d9d5ca`, accent `#0b6aa2`.

### Rayons, ombres, modes
- Rayons : classes Tailwind `rounded-md` / `rounded-lg` / `rounded-xl` / `rounded-full` dans les composants, écrasées dans le canevas : `rounded-lg` et `rounded-xl` → 2 px, `rounded-md` → 1 px. Boutons d'accent (`button.bg-accent`, `a.bg-accent`) biseautés par `clip-path` (8 px), police mono, majuscules. `rounded-full` (pastilles, jauges) non écrasé. Logo de l'en-tête biseauté par `clip-path`.
- Ombres : lueurs colorées — `0 0 12px rgb(102 252 241 / .18)` au survol des cartes, `0 0 15px rgb(102 252 241 / .6)` au survol des boutons d'accent, lueur du logo, de l'onglet actif et de la jauge XP ; `shadow-sm` / `shadow-lg` Tailwind sur quelques cartes et le toast.
- Modes clair/sombre : **un seul thème sombre**, pas de bascule, pas de `prefers-color-scheme`. Zones claires : `.paper-surface` (commentaires de cours), graphe d'évaluation, page 404 (fond blanc par défaut de Next.js).
- `prefers-reduced-motion` : pris en compte dans `nav.module.css`, `esport-page.module.css`, et via `motion-reduce:animate-none` (bulle du coach).
- Fond des pages : dégradés radiaux violet/cyan + grille 48 px + étincelles décoratives (`EsportCanvas`).

### Composants partagés les plus utilisés
| Composant | Occurrences JSX (fichiers) | Usage |
|---|---|---|
| `Link` (next/link) | 38 (24) | navigation interne |
| `EsportCanvas` | 19 (14) | fond e-sport + redéfinition des jetons, sur toutes les routes |
| `Chessboard` (react-chessboard) | 16 (15) | tous les échiquiers |
| `StatTile` / `Stat` / `Tile` | 7 / 4 / 4 | tuiles de chiffres (Rapport, carte Synthèse, bilan) |
| `EsportHeader` | 6 (6) | sur-titre mono + grand titre + chapeau (Accueil, Rapport, Entraîner, Ouvertures, Pièges, Rapport › ouverture) |
| `QualityBadge` | 5 (5) | pastille de qualité (`!!`, `!`, `★`, `📖`…) |
| `CoachBubble` | 5 (3) | 3 implémentations distinctes : `games/coach-bubble.tsx`, `learn/coach-bubble.tsx`, `play/coach-bubble.tsx` (+ `learn/course-coach-bubble.tsx`) |
| `EvaluationBar` | 4 (4) | barre d'évaluation verticale |
| `ProgressRing`, `ProgressBar` | 4 + 4 | progression Académie |
| `BackButton` | 4 (2) | retours internes d'Apprendre |
| `PuzzleBoard` | 3 (3) | résolution de puzzle (decks, recommandations, erreurs) |
| `ExplorePanel` | 3 (3) | mode exploration moteur |
| `CourseTreeViewer` | 2 (2) | lecteur de cours partagé Académie + cours d'ouverture (contient `MoveTreeViewer`) |
| `Toast` | 1 | notification de synchronisation |

Composants présents mais montés nulle part : `PuzzleBankScreen` (`client/features/puzzle-bank/`), `MissionBriefing` (`learn/mission-briefing.tsx`), `ComingSoon` (`components/ui/coming-soon.tsx`).

---

## 2. CARTE DES ÉCRANS

« Interactifs » = éléments cliquables ou saisissables hors en-tête, cases d'échiquier comptées à part. « Sans défiler » = desktop / mobile. `<title>` = « Chess Trainer » sur toutes les routes, sauf la 404 d'une partie inconnue (« 404: This page could not be found. »).

### `/` — Accueil (onglet « Jouer contre des Bots »)
- Titre affiché : sur-titre « Arène / 01 », titre « Défie le moteur. », chapeau « Joue contre des bots, lie ton compte Chess.com ou Lichess pour une synchro automatique, et garde un œil sur ta progression. »
- Rôle : lancer une partie contre un bot et voir les raccourcis vers révisions, rapport, séance du jour et parties récentes.
- Interactifs : 47 (desktop) / 49 (mobile). Sans défiler : **9 / 4**.
  - Desktop : 4 cartes de bot « 🟢 Poussin (Débutant) 1000 », « 🟡 Club (Intermédiaire) 1500 », « 🔴 Champion (Avancé) 2000 », « 💀 Stockfish (Maître) Max » ; liste « Couleur » (« Blancs » / « Noirs ») ; bouton « Commencer » (actif au relevé, « Préparation… » au lancement, désactivé avec « Chargement du moteur… » tant que le moteur charge) ; « Délier » ; carte-lien « Corrigez vos gaffes 1735 cartes à réviser sur tes 7 decks FSRS Réviser maintenant → » ; carte-lien « Synthèse du rapport récent … Voir le rapport complet → ».
  - Mobile : les 4 cartes de bot seulement.
  - Plus bas : carte « Synchronisation automatique » (« Chess.com » / « Lichess » ; pseudo + « (synchronisé 19/10/2026 08:43) » + « Délier », ou champ « ton-pseudo » + « Lier ») ; carte « Séance du jour » (compteur « 4/4 actions », 3 cartes affichées dont une « ×2 » : « Puzzle en retard de 66 j », « Variante d'ouverture à revoir », chaque carte avec « Impact N ») ; formulaire « Plan du jour » (cases « Tactique » 35, « Ouvertures » 25, « Pièges » 25, « Revue » 15 ; jauge « Charge quotidienne » « 60/100 pts · Optimal » ; curseur « Actions par séance » 1–8 ; bouton « Appliquer », ou « Modifier le plan » + « Réalisé aujourd'hui » quand une session est active) ; section « Parties récentes » (recherche « 🔍 Rechercher une partie par pseudo ou nom de bot… », 25 lignes par page avec résultat, adversaire, Elo, source/cadence, date relative, précision ; « ← Plus récentes » / « Voir plus (25/page) → »).
- Partie en cours (même page, sans URL) : échiquier, « À toi de jouer », « ↩️ Annuler le coup », « 🏳️ Abandonner », panneau « Coups », bulle du coach ; bandeau « Plan du jour · ouverture imposé(e) : … » si le plan impose une ligne ; en fin de partie, bilan « 🏆 Victoire ! » / « Défaite » / « Partie nulle », « Précision », « Performance démontrée », et le panneau de lancement réapparaît. 43 interactifs pendant la partie.
- États vides : « Pas encore de partie analysée — les statistiques apparaîtront ici. » ; « Aucune carte due — tout est à jour » ; « Rien de dû pour ces objectifs. Joue une partie, importe un historique, ou élargis le plan ci-dessous. » ; « Aucune partie pour l'instant — joue un bot ci-dessus ou lie ton compte Chess.com/Lichess. » ; « Aucune partie ne correspond à « … ». » ; erreurs « Impossible d'appliquer le plan. Réessaie. », « Impossible de déverrouiller le plan. Réessaie. ».
- Mène vers : `/entrainer`, `/rapport`, `/analyse/<id>`, `/analyse/<id>?reviewPly=<n>`, `/ouvertures/<id>?drill=<clé>`, `/pieges/<id>`, session de puzzle intégrée (sans URL), partie en cours (même page).

### `/rapport` — Rapport
- Titre : « Rapport de performance / 02 », « Lis ton propre jeu. », chapeau « Précision par phase de jeu, fourchettes et clouages trouvés contre manqués, performance par ouverture, pièces laissées en prise. Tout s'agrège depuis la table des coups analysés. »
- Rôle : statistiques agrégées de toutes les parties analysées.
- Interactifs : 11. Sans défiler : **1 / 1** — « 🎯 Lancer le drill Listudy ».
- Contenu : bandeau « ⚠️ Ouverture en difficulté : tu as un taux de réussite de seulement 0% avec Queen's Gambit Declined: Marshall Defense. Tu as tendance à faire des gaffes au coup 8. » ; tuiles « Précision globale » 90 %, « Parties analysées » 422, « Pièces laissées en prise » 41 % ; « Précision par phase de jeu » (Ouverture / Milieu de partie / Finale) ; « Fourchettes et clouages » ; tableau « Performance par ouverture » (Ouverture, Parties, Victoires, Précision, Ply moyen de la 1ère gaffe — 26 lignes, noms en anglais) ; « Mes ouvertures face au cours » (9 lignes : Partie Écossaise, Partie Italienne, Ruy Lopez (Espagnole), Défense Est-Indienne, Défense Caro-Kann, Gambit Écossais, Gambit Dame Refusé, Sicilienne Ouverte (Najdorf & Cie), Sicilienne : Variante du Dragon ; liens « Voir les parties → ») ; « 📊 Tableau statistique » (Brillant 38, Critique 691, Meilleur coup 6014, Imprécision 552, Gaffe 270) + lien « Voir l'historique de mes coups brillants → ».
- États vides : « Aucune partie analysée pour l'instant — joue une partie ou importe-en depuis Chess.com/Lichess pour… » ; « Aucune ouverture identifiée pour l'instant — les parties importées n'ont pas encore de code ECO. » ; « Aucune gaffe analysée » ; « Aucune de tes parties n'entre encore dans un cours d'ouverture. »
- Mène vers : `/ouvertures/<id>?drill=main_line&side=<camp>`, `/rapport/ouvertures/<slug>`, `/rapport/brillants`.

### `/rapport/brillants` — Historique des coups brillants
- Titre : « Historique des coups brillants » ; section « 🏆 Mes Chefs-d'œuvre ».
- Rôle : liste des 30 derniers coups classés Brillant.
- Interactifs : 31. Sans défiler : **10 / 5** — « ← Retour au Rapport » + lignes « !! Rxf2 — contre 🟡 Club (Intermédiaire) 16/10/2026 · coup 29 · a sacrifié la matière pour une attaque gagnante ▼ Revoir »…
- État vide : « Aucun coup Brillant repéré pour l'instant — continue à importer tes parties. »
- Mène vers : `/rapport`, `/analyse/<id>`.

### `/rapport/ouvertures/<slug>` — Rapport › ouverture (relevé sur `scotch-game`)
- Titre : sur-titre « Rapport › ouverture », titre = nom de l'ouverture (« Partie Écossaise »).
- Rôle : rejouer chaque partie de l'utilisateur dans le cours commenté et montrer où il le quitte.
- Interactifs : 81. Sans défiler : **33 / 2** — « ← Retour au Rapport », « Ouvrir le cours », « Voir dans le cours → » (×5), liens « Partie 1 » … « Partie 13 » répétés par groupe.
- Contenu : tuiles « Parties » (46, dont 6 côté adverse du cours), « Sorties du cours » (33, 72 %), « Victoires en suivant le cours » (77 %), « Victoires après l'avoir quitté » (61 %) ; sections « Où tu quittes le cours », « Tes premières gaffes » (ou « Les gaffes que tu répètes »), « Toutes tes parties ».
- États vides : « Aucune gaffe ne se répète encore à la même position : voici les plus précoces. » ; « Aucune gaffe ni imprécision dans ces parties. » ; slug sans cours → 404 (une ouverture avec cours mais sans partie n'est pas en 404 ; rendu non capturé).
- Mène vers : `/rapport`, `/ouvertures/<slug>/cours`, `/ouvertures/<slug>/cours?chapitre=&noeud=`, `/analyse/<id>?course=<slug>&reviewPly=<n>`.

### `/entrainer` — Entraîner
- Titre : « Salle d'entraînement / 03 », « Transforme tes erreurs en réflexes. », chapeau « Sept decks alimentés par tes propres erreurs, en répétition espacée FSRS. »
- Rôle : réviser en répétition espacée les puzzles tirés des erreurs de l'utilisateur.
- Interactifs : 8. Sans défiler : **7 / 1** — 6 × « Démarrer la révision », « 📊 Comprendre mes erreurs » (le 7e « Démarrer la révision » est sous la ligne de flottaison).
- Contenu : 7 cartes de deck avec compteurs « dû/dûs » et « nouveau(x) » : « Puzzles du jour » (0 / 5), « Erreurs d'ouverture » (19 / 310), « Mats manqués » (29 / 41), « Erreurs de finale » (13 / 147), « Tactiques manquées » (7 / 713), « Erreurs tactiques » (2 / 68), « Erreurs positionnelles » (9 / 372) ; badge « À jour ! 👍 » quand rien n'est dû.
- Vues internes sans URL :
  - Session de deck : titre du deck, « Quitter la session », échiquier, consigne « Trouve la suite (3 coups) à jouer. », indices du coach. État vide : « Aucune carte due dans ce deck pour l'instant. »
  - Hub « 📊 Mes erreurs d'ouverture » : « ← Retour aux decks », groupes par ouverture puis sous-variante (« 📂 Ouverture non identifiée 1 sous-variante · 2 erreurs · 1 revue »), boutons « 🔍 Explorer » / « 🎯 S'entraîner » par groupe. **207 interactifs, 14 545 px de haut en desktop**. États : « Chargement… », « Impossible de charger le journal pour l'instant. », « Aucune déviation détectée dans tes parties importées pour l'instant — … ».
- Mène vers : vues internes ; `/analyse/<id>?openingId=&ply=` depuis le hub.

### `/apprendre` — Apprendre (Académie)
- Titre : « Tableau d'entraînement / 04 », « Construis le prochain coup. », chapeau « Des cours commentés coup par coup, puis des exercices réels pour transformer tes décisions en réflexes de partie. »
- Rôle : catalogue de 205 thèmes (cours commentés + exercices) en 15 catégories.
- Interactifs : 236. Sans défiler : **22 / 1** — « Reprendre → » ; 15 ancres de catégorie (« 🧠 Positional Mastery 30 », « 📘 Cours du MI Jesper Hall 25 », « 👑 Checkmate Patterns 30 », « ⚡ Tactical Motifs 36 », « 🏆 Sparring Positions 20 », « ♟️ Endgame Mastery 3 », « 🧱 Structures de pions 9 », « 🩹 Faiblesses de pions 1 », « ⚔️ Milieu de partie 7 », « 🎯 Motifs 13 », « 🧩 Avancé 11 », « 🔢 Mats par coups 5 », « ☠️ Thèmes de mat 6 », « ✨ Coups spéciaux 4 », « 🏛️ Objectifs & Origines 5 ») ; en-tête repliable de la 1re catégorie ; tuiles « Module 1 À découvrir L'avant-poste du cavalier 0 / 15 exercices »… Mobile : « Reprendre → » seul.
- Contenu : légende « Qualité » (« !! Brillant », « ★ Meilleur coup », « ?! Imprécision », « ?? Gaffe ») ; bloc « Mission en cours » (« 🧠 Positional Mastery / Intermédiaire — La tour à la 7e rangée », « Progression 20% ») ; rail « Niveau actuel » (« Niveau 1 ») ; 15 sections repliables avec tuiles par palier ; pied « Progression sauvegardée ».
- État vide : « Aucune mission active » / « Termine une leçon disponible pour ouvrir la prochaine étape. »
- Vues internes :
  - `/apprendre?categoryId=<id>` — thèmes d'une catégorie. Interactifs 34 ; sans défiler **10 / 8** : « ← Retour à l'académie », « 🥉 Palier Bronze — Débutant 10 thèmes — 0 maîtrisé 0% ▾ », tuiles « 1 L'avant-poste du cavalier Reconnaître et exploiter : … 0/15 »… États : « Module introuvable. », « Aucun thème disponible pour l'instant. ».
  - `/apprendre?themeId=<id>` — page de cours du thème. Interactifs 19 (+ 21 cases) ; sans défiler **18 / 10** : « ← Retour aux thèmes », « Lecture » / « Jouer les coups », « Coup précédent », « Coup suivant », 13 chapitres numérotés pour `pm-l-avant-poste-du-cavalier`. États : « Thème introuvable. », « Ouvre le dernier chapitre du cours pour débloquer les exercices. », message technique citant `data/import/academy/` et `npm run db:seed-academy`.
  - Session d'exercices et session de révision du thème : sans URL. États : « Aucun exercice disponible pour l'instant », « Aucun exercice à revoir ».
- Mène vers : vues internes uniquement.

### `/ouvertures` — Ouvertures
- Titre : « Répertoire / 05 », « Prends l'avantage dès le premier coup. », chapeau « Explore 31 ouvertures classiques : rejoue leur ligne de référence coup par coup, ou dévie librement pour voir jusqu'où la théorie te suit. »
- Rôle : catalogue des ouvertures, progression du répertoire, révisions espacées des variantes.
- Interactifs : 40. Sans défiler : **2 / 1** — « ⚡ Lancer les révisions du jour 41 », carte « Partie Italienne ».
- Contenu : barre « Progression Totale du répertoire » (« 6 / 31 maîtrisées (19%) ») ; « Radar de performance » (« 3 sessions Sans Guide analysées », « Profil : Réflexes d'ouverture solides mais sujet à l'essoufflement positionnel vers le coup 6. », piliers « Discipline Théorique », « Endurance Stratégique », « Instinct de Punition », listes « Vos Forteresses » / « Vos Zones de Danger ») ; bannière vers l'historique d'endurance ; recherche « Chercher une ouverture… » ; filtres « Les deux camps » / « Blancs » / « Noirs » ; 31 cartes (nom, ECO, camp, description, badge « À réviser », étoiles, coups).
- États vides : « Aucune ouverture ne correspond à cette recherche. » ; « Aucune ouverture au-dessus de 75 % de ligne tenue pour l'instant. » ; « Aucune zone de danger : toutes tes ouvertures tiennent au moins 75 % de leur ligne. »
- Mène vers : `/ouvertures/<id>`, `/ouvertures/<id>?drill=<clé>` (file des révisions en `sessionStorage`), `/ouvertures/historique-endurance`.
- Aucun lien vers `/pieges` ni vers `/ouvertures/<id>/cours` depuis cet écran.

### `/ouvertures/<id>` — Fiche ouverture (relevé sur `scotch-game` et `lichess-modern-defense`)
- Titre : nom de l'ouverture (« Partie Écossaise », « Modern Defense »).
- Rôle : endurance « Sans Guide », drill de la ligne et des variantes, sparring.
- Interactifs : 18 (+ 32 cases) pour une ouverture curatée ; 57 (+ 32 cases) pour une famille Lichess (69 chapitres). Sans défiler : **8 / 2** (curatée), **19 / 3** (famille Lichess).
  - Curatée avec cours : « Lancer le simulateur de survie (Milieu de jeu) → » (→ `/ouvertures/<id>/cours`), « Classement de mes ouvertures → », « ← Toutes les ouvertures », « 📖 Cours commenté coup par coup », « ← Retour », interrupteur « 👁️ Vision Moteur » (désactivé sans suggestion), sélecteur « Partie Écossaise · ligne principale ★ ★ ★ C45 », « Chercher un chapitre ».
  - Famille Lichess : « Aller au drill → », « ← Toutes les ouvertures », « ← Retour », « 👁️ Vision Moteur », chapitres (« Fianchetto Gambit ★ ★ ★ B06 », « Déplier Lizard Defense », « Lizard Defense (2) »…).
  - Plus bas : « 💡 Afficher l'indice de ce coup ! », « Aléatoire / Surprise », « Test Final », « Historique », bloc « Jouer cette ligne » + « Lancer le sparring ».
- Zones : « Endurance Sans Guide » (« Première gaffe en moyenne », « Robustesse 100 / 100 », « Rang 2 sur 3 (provisoire, moins de 3 sessions). », badge « Mur de briques ») ; en-tête de l'ouverture + « Progression de l'étude » ; « ⚠️ Mes erreurs fréquentes » (« 🎯 M'entraîner ») ; « 🎯 Entraînement — Ligne principale » (échiquier, panneau coach, chapitres) ; « Jouer cette ligne ».
- Paramètres : `?drill=<clé>`, `?side=white|black`, `?mode=sans-guide`, ancre `#drill`.
- États : « Aucune session sur <ouverture> pour l'instant. Le drill de la ligne principale est juste en dessous : … » ; « Aucune gaffe sur toutes tes sessions Sans Guide. » ; « Fin de la théorie cataloguée — bravo d'être allé aussi loin. » ; « Ligne terminée ! » ; « Test Final terminé ! » ; « Pratique d'abord au moins un chapitre pour le débloquer » ; « Aucun chapitre ne correspond à cette recherche. » ; id inconnu → 404.
- Mène vers : `/ouvertures`, `/ouvertures/<id>/cours` (2 liens), `/ouvertures/historique-endurance`.

### `/ouvertures/<id>/cours` — Cours commenté (relevé sur `scotch-game` et `queens-gambit-declined`)
- Titre : « Cours : Partie Écossaise » / « Cours : Gambit Dame Refusé », chapeau « Fiche d'identité, arbre théorique commenté coup par coup, déviations à punir et plans du milieu de jeu. »
- Rôle : lecteur coup par coup avec variantes (arbre RAV), commentaires sur fond papier, barre d'évaluation par nœud, indices, mode jeu.
- Interactifs : 81 (Écossaise) / 76 (GDR), + 32 cases. Sans défiler : **34 / 11** et **35 / 11** — « ← <ouverture> », « Mes parties dans cette ouverture → », « Lecture » / « Jouer les coups », « Coup précédent », « Coup suivant », chapitres numérotés (11 pour l'Écossaise, 8 pour le GDR), coups de la notation (« 1.e4 », « e5 »…). En mode jeu : « Indice », « Montrer le coup ». En bas : volet repliable « Tes écarts au cours dans tes parties (N) ».
- Paramètres : `?chapitre=<n>&noeud=<id>`.
- États : « Ce n'est pas le coup de l'étude — réessaie. », « ✓ Ligne terminée. », « Réponse adverse… », « Trouve la punition : des indices sont disponibles. » ; ouverture sans cours → 404 ; « Aucun cours n'est encore disponible pour cette ouverture. » (composant).
- Mène vers : `/ouvertures/<id>`, `/rapport/ouvertures/<id>`, `/analyse/<id>?course=…`.
- Position de lecture non mémorisée (aucun stockage trouvé) : chaque ouverture repart du chapitre 1 hors paramètres d'URL.

### `/ouvertures/historique-endurance` — Historique d'endurance
- Titre : « Historique d'endurance positionnelle », chapeau « Jusqu'où tiens-tu sans guide avant ta première gaffe ? Chaque Manche 2 terminée s'ajoute ici. »
- Rôle : historique des sessions « Sans Guide » toutes ouvertures.
- Interactifs : 4. Sans défiler : **4 / 1** — « ← Toutes les ouvertures », « Ruy Lopez (Espagnole) », « Partie Écossaise », « Partie Italienne ».
- Contenu : « Statut d'endurance » (« En transition », « Ply record Coup 12 », « Moyenne sur 3 sessions Coup 6,7 »), « Chronologie des progrès », « Classement de mes ouvertures ».
- États vides : « Aucune session Sans Guide pour l'instant. » ; « Aucune gaffe sur toutes tes sessions. » ; « Aucun changement par rapport aux 10 sessions précédentes. »
- Mène vers : `/ouvertures`, `/ouvertures/<id>`.

### `/pieges` — Pièges
- Titre : « Répertoire / 05 / Pièges », « Ne tombe plus dans le piège. », chapeau « 754 puzzles répartis en 84 ouvertures, chacune découpée en séries de gambits. L'ordinateur amène chaque position de manière agressive — à toi de résister à la tentation et de trouver la réfutation précise avant qu'il ne referme le piège. »
- Rôle : bibliothèque de pièges d'ouverture sur 3 niveaux (famille → série → puzzle).
- Interactifs : 84. Sans défiler : **15 / 4** — familles « 🇮🇹 Partie Italienne 0 / 21 résolus 0% », « 🐍 Défense Sicilienne 0 / 4 », « 🛡️ Défense Caro-Kann 0 / 4 », « 🇪🇸 Ruy Lopez 0 / 35 », « ♟️ Partie Écossaise 0 / 2 », « ♛ Gambit Dame 0 / 3 », « ♞ Gambit Contre Albin 0 / 2 », « ⚔️ Débuts Ouverts 0 / 1 », « ♟️ Scotch Game 0 / 19 », « ♟️ Sicilian Defense 0 / 38 », « ♟️ Blackmar-Diemer Gambit 0 / 6 », « ♟️ King's Gambit Declined 0 / 21 », « ♟️ Three Knights Opening 0 / 6 », « ♟️ Italian Game 0 / 42 », « ♟️ Vienna Game 0 / 23 ».
- État vide : « Aucun piège disponible pour l'instant. »
- Mène vers : `/pieges/<id>` (1er piège non résolu de la série).
- Aucune entrée dans la navigation principale (voir section 3).

### `/pieges/<id>` — Drill de piège
- Titre : pas de `<h1>` ; titre de section « ♟️ Scotch Game · Schmidt Variation — Puzzle 1 / 2 », sous-titre « Internet — tu joues les Blancs. Manche 1 / 2 — guidée. »
- Rôle : jouer la ligne du piège (Manche 1 guidée, Manche 2 sans faute), enchaîner la série.
- Interactifs : 3 (+ 30 cases). Sans défiler : **2 / 3** — « ← Retour aux pièges », « ☠️ Incarner la victime (Tomber dans le piège) » (désactivé, info-bulle « Pas encore disponible pour ce piège »), « 💡 Show hints for this move! » (en anglais).
- États : « Mise en place du piège… », « L'IA amène le piège… », « Presque — la Manche 2 doit être parcourue sans AUCUNE faute pour maîtriser ce piège. » ; id inconnu → 404.
- Mène vers : `/pieges`, puzzle suivant de la série (« Suivant → »).

### `/plus` — Plus
- Titre : « Plus », chapeau « Configuration du moteur, comptes liés, informations de version. »
- Rôle : test du moteur, comptes liés, version.
- Interactifs : 3. Sans défiler : **3 / 3** — « Tester » (désactivé, « Chargement de Stockfish… » encore affiché 6 s après le chargement), « Délier » ×2.
- Contenu : carte « Moteur » (« Évaluation », « Meilleur coup », « Profondeur » après test), carte « Synchronisation automatique », « Chess Trainer — v0.1.0 ».
- Aucune entrée dans la navigation ni lien entrant trouvé.

### `/analyse/<id>` — Revue de partie (relevé sur une partie Chess.com et une partie locale contre bot)
- Titre : « Blancs contre Stepan56 » + « 16/10/2026 — précision approximative 90% ».
- Rôle : revue coup par coup avec classification, graphe d'évaluation, moments clés, bilan, rejouer ses erreurs.
- Interactifs : 157 (Chess.com) / 78 (locale), + 32 cases. Sans défiler : **28 / 6** — « ◀ Partie précédente », « Partie suivante ▶ », « ← Retour », « ← Précédent », « Suivant → », « Couper le son des coups », coups du « Fil de notation » (« 📖 e4 », « ★ Nb5 »…).
- Contenu : échiquier + barre d'éval + compteur « 0 / 141 » ; « Fil de notation » ; « 📡 Live Broadcast » ; « Aperçu de la partie » (Toi / adversaire, comptes par qualité) ; graphe « Avantage Blancs » ; « Moments clés » (« ?! Imprécision · coup 29 »…) ; « 🎓 Rapport du coach » (« Lacune détectée : … » + « 🎯 S'exercer sur … (Académie) » → `/apprendre?themeId=`) ; « 📣 Bilan du commentateur » ; « N erreurs à corriger dans cette partie. » + « Rejouer mes erreurs ».
- Paramètres : `?openingId=&ply=`, `?reviewPly=`, `?course=`.
- États : « Analyse partielle — pas assez de coups évalués pour un verdict de précision. » ; « Aucune gaffe recensée : un sang-froid exemplaire du premier au dernier coup. »
- Partie locale **avec** PGN : s'affiche (relevé sur `f849135f-…`). Partie locale **sans** PGN → 404 (relevé sur `a796eb5e-…` ; 14 parties locales sur 22 sans PGN en base).
- Mène vers : `/`, `/analyse/<id voisin>`, `/apprendre?themeId=<id>`.

### Page 404 (route inconnue, id inconnu, partie sans PGN)
- Page Next.js par défaut : « 404 » / « This page could not be found. » (anglais), fond blanc, sans canevas, en-tête sur les jetons `:root`, aucun lien de retour dans le corps.

### `/api/sync` (POST, pas un écran)
- Synchronisation des comptes liés, appelée au chargement puis toutes les 5 minutes par chaque onglet ouvert (`use-sync-notifier.ts`) ; toast « 🎯 Nouvelles parties synchronisées ! Vos statistiques et vos decks FSRS ont été mis à jour. »

---

## 3. NAVIGATION ACTUELLE

```
En-tête (toutes les pages, sticky, 72 px desktop / 118 px mobile)
├─ Logo « Chess Trainer / E-sports academy » ........ → /
├─ 01 « Jouer contre des Bots » ...................... → /
│     ├─ [vue] partie en cours / bilan
│     ├─ « Corrigez vos gaffes … Réviser maintenant → » → /entrainer
│     ├─ « Synthèse du rapport récent … Voir le rapport complet → » → /rapport
│     ├─ cartes « Séance du jour » ................... → puzzle intégré | /ouvertures/<id>?drill= | /pieges/<id> | /analyse/<id>?reviewPly=
│     └─ « Parties récentes » ........................ → /analyse/<id>
├─ 02 « Rapport » .................................... → /rapport
│     ├─ « 🎯 Lancer le drill Listudy » .............. → /ouvertures/<id>?drill=main_line&side=…
│     ├─ « Voir les parties → » ...................... → /rapport/ouvertures/<slug>
│     │     ├─ « Ouvrir le cours » / « Voir dans le cours → » → /ouvertures/<slug>/cours[?chapitre=&noeud=]
│     │     └─ « Partie N » .......................... → /analyse/<id>?course=…
│     └─ « Voir l'historique de mes coups brillants → » → /rapport/brillants → /analyse/<id>
├─ 03 « Entraîner » .................................. → /entrainer
│     ├─ [vue] session de deck (×7)
│     └─ [vue] « 📊 Comprendre mes erreurs » → /analyse/<id>?openingId=&ply=
├─ 04 « Apprendre » .................................. → /apprendre
│     ├─ [vue] catégorie (?categoryId=)
│     ├─ [vue] page de cours du thème (?themeId=)
│     ├─ [vue] session d'exercices (sans URL)
│     └─ [vue] révision du thème (sans URL)
├─ 05 « Ouvertures » ................................. → /ouvertures
│     ├─ carte ....................................... → /ouvertures/<id>
│     │     ├─ « 📖 Cours commenté coup par coup » ... → /ouvertures/<id>/cours
│     │     ├─ « Lancer le simulateur de survie (Milieu de jeu) → » → /ouvertures/<id>/cours
│     │     ├─ « Classement de mes ouvertures → » .... → /ouvertures/historique-endurance
│     │     └─ [vues] drill / Aléatoire / Test Final / Historique / sparring
│     ├─ « ⚡ Lancer les révisions du jour » ......... → /ouvertures/<id>?drill=<clé>
│     └─ bannière d'endurance ........................ → /ouvertures/historique-endurance
└─ Indicateurs non cliquables : « Session locale », « NIV. 07 », jauge XP

Hors navigation : /pieges (atteint seulement depuis une carte « Piège » de la Séance du jour → /pieges/<id> → « ← Retour aux pièges »), /plus (aucun lien)
```

Onglets / bascules internes : Apprendre (15 ancres de catégorie, sections repliables, paliers) ; lecteur de cours (« Lecture » / « Jouer les coups ») ; Ouvertures (filtres « Les deux camps » / « Blancs » / « Noirs ») ; fiche ouverture (chapitres, « Aléatoire / Surprise », « Test Final », « Historique », « Vision Moteur ») ; Entraîner (7 decks + hub). Aucun composant d'onglets (`role=tab`) dans le DOM.

### Doublons
1. Accueil : logo et onglet 01 mènent tous deux à `/`.
2. `/entrainer` : onglet 03 et carte « Corrigez vos gaffes … Réviser maintenant → ».
3. `/rapport` : onglet 02 et carte « Synthèse du rapport récent … Voir le rapport complet → ».
4. Comptes liés (« Synchronisation automatique ») : sur l'Accueil et sur `/plus`.
5. Cours d'ouverture : « 📖 Cours commenté coup par coup » et « Lancer le simulateur de survie (Milieu de jeu) → » sur la même fiche ; « Ouvrir le cours » et « Voir dans le cours → » dans Rapport › ouverture.
6. Historique d'endurance : bannière de `/ouvertures` et « Classement de mes ouvertures → » de la fiche.
7. Révisions d'ouvertures : « ⚡ Lancer les révisions du jour » (`/ouvertures`), cartes « Variante d'ouverture à revoir » (Séance du jour, Accueil), badges « À réviser » des cartes.
8. Erreurs d'ouverture : deck « Erreurs d'ouverture » + « 📊 Comprendre mes erreurs » (`/entrainer`), « ⚠️ Mes erreurs fréquentes » (fiche ouverture), « Où tu quittes le cours » et « Tes écarts au cours dans tes parties » (Rapport › ouverture, cours), bandeau « Ouverture en difficulté » (Rapport).
9. Puzzles : decks FSRS (`/entrainer`), cartes « Puzzle en retard de N j » (Accueil), exercices de l'Académie.
10. Deux retours vers `/ouvertures` sur la fiche : « ← Toutes les ouvertures » et « ← Retour ».

### Impasses
- `/plus` : aucun lien entrant (URL à taper).
- `/pieges` : aucune entrée de navigation ; atteinte seulement par une carte « Piège » de la Séance du jour, puis « ← Retour aux pièges ».
- `/analyse/<id>` d'une partie locale sans PGN → 404 (14 parties), alors que la ligne est cliquable dans « Parties récentes ».
- Page 404 par défaut, en anglais, sans lien de retour dans le corps.
- Vues internes sans URL (partie en cours, sessions de deck, hub d'erreurs, sessions d'Académie) : le bouton Précédent du navigateur quitte la vue et l'état est perdu.

### Libellés ambigus
- « Plus » : nom d'une page de réglages.
- « Entraîner » (onglet) vs « Mode Entraînement » / « 🎯 Entraînement — Ligne principale » (fiche ouverture) vs « Tableau d'entraînement / 04 » (Apprendre) vs « Salle d'entraînement / 03 » (Entraîner).
- « Lancer le simulateur de survie (Milieu de jeu) → » ouvre le cours commenté.
- « Lancer le drill Listudy », « decks FSRS », « Sans Guide », « Manche 2 », « Vision Moteur », « Live Broadcast », « Impact N » : termes non expliqués à l'écran (« Impact » a une info-bulle).
- « Corrigez vos gaffes » (vouvoiement) alors que le reste de l'interface tutoie.
- Onglet « Jouer contre des Bots » vs titre « Défie le moteur. ».
- « NIV. 07 » (en-tête, fixe dans le code) vs « Niveau 1 » (Apprendre, calculé).
- « Puzzles du jour » (deck) vs « Séance du jour » / « Plan du jour » (Accueil) vs « Lancer les révisions du jour » (Ouvertures).
- « 4/4 actions » pour 3 cartes affichées (une carte regroupée « ×2 »).
- Avatar 🦾 et libellé « 💀 Stockfish (Maître) » sur la même carte.
- Mélange de langues : catégories « Positional Mastery », « Checkmate Patterns », « Tactical Motifs », « Sparring Positions », « Endgame Mastery » à côté de « Structures de pions », « Motifs », « Avancé » ; familles de pièges en double (« Partie Italienne » / « Italian Game », « Partie Écossaise » / « Scotch Game », « Défense Sicilienne » / « Sicilian Defense ») ; 11 cartes d'ouvertures au nom anglais (« Modern Defense », « Petrov's Defense »…) ; noms d'ouvertures du Rapport en anglais ; bouton « 💡 Show hints for this move! » (drill de piège, exercice d'erreur) vs « 💡 Afficher l'indice de ce coup ! » (drill d'ouverture) ; page 404 en anglais.
- Orthographe : « dûs » (compteurs des decks).

---

## 4. FONCTIONNALITÉS

Statut : **complète** = branchée à une route et cœur logique couvert par des tests ; **partielle** = branchée avec un manque relevé ; **non branchée** = code présent sans accès dans l'interface.

### Jouer contre un bot
| Fonction | Accès | Ce qu'elle fait | Statut |
|---|---|---|---|
| Partie contre bot | `/` → carte de bot → « Commencer » | Partie contre Stockfish WASM selon 4 profils, couleur au choix | Complète (`bot-profiles.test.ts`) |
| Annuler le coup / Abandonner | pendant la partie | Reprise du dernier tour ; abandon | Complète |
| Coach en direct | pendant la partie | Bulle de commentaire par coup (analyse profondeur 16) | Complète (`coach-narrative`, `live-commentary` testés) |
| Départ imposé par le plan du jour | `/` si plan appliqué avec « Ouvertures »/« Pièges » | Le bot démarre sur une ligne du répertoire (cours hors répertoire exclus) | Complète (`daily-plan.test.ts`) |
| Bilan et performance | fin de partie | « Précision », « Performance démontrée », enregistrement `bot_game_results` | Complète (`performance-rating.test.ts`) |
| Revue d'une partie contre bot | « Parties récentes » | Revue si PGN en base | Partielle : 14 parties locales sur 22 sans PGN → 404 |

### Revue de partie
| Fonction | Accès | Ce qu'elle fait | Statut |
|---|---|---|---|
| Revue coup par coup | `/analyse/<id>` | Classification (brillant, critique, meilleur, correct, imprécision, gaffe, théorique), graphe, moments clés, son | Complète |
| Mode exploration | revue | Lignes moteur en flèches | Complète |
| Rapport du coach | revue | Lacunes détectées + lien vers le thème de l'Académie | Complète |
| Rejouer mes erreurs | « Rejouer mes erreurs » | Drill des erreurs de la partie | Complète |
| Déviation de théorie | `?openingId=&ply=`, `?course=` ou détection auto | Bulle sur le coup où la partie quitte la théorie / le cours | Complète (`course-game-match.test.ts`, `opening-mistakes.test.ts`) |
| Navigation entre parties | « ◀ Partie précédente » / « Partie suivante ▶ » | Voisines chronologiques ou dans la même ouverture | Complète |

### Import de parties (Chess.com / Lichess)
| Fonction | Accès | Ce qu'elle fait | Statut |
|---|---|---|---|
| Lier un compte | Accueil ou `/plus` → pseudo → « Lier » | Enregistre le pseudo (`platform_links`) | Complète ; aucun message d'erreur affiché si le pseudo est invalide |
| Synchronisation automatique | au chargement d'une page puis toutes les 5 min | Importe les nouvelles parties (200 au 1er import, 50 ensuite), analyse (profondeur 12), crée les puzzles, toast | Complète ; ne tourne que si un onglet est ouvert |
| Délier | « Délier » | Supprime le lien | Complète |
| Import manuel (PGN, bouton « Importer », « Synchroniser maintenant ») | — | non trouvé | Absente |

### Révisions espacées / « Entraîner »
| Fonction | Accès | Ce qu'elle fait | Statut |
|---|---|---|---|
| 7 decks FSRS | `/entrainer` → « Démarrer la révision » | Puzzles tirés des erreurs, notation FSRS | Complète (`fsrs.test.ts`, `spaced-repetition.test.ts`, `decks.test.ts`) |
| Puzzles du jour | deck « Puzzles du jour » | Rejoue les lots quotidiens passés | Complète (`daily-puzzles.test.ts`) |
| Comprendre mes erreurs | `/entrainer` → « 📊 Comprendre mes erreurs » | Journal des erreurs d'ouverture groupées, « 🔍 Explorer », « 🎯 S'entraîner », marquage « ✅ Corrigé ! » | Complète (`opening-mistake-groups.test.ts`, `opening-mistake-round.test.ts`) |

### Plan du jour / Séance du jour
| Fonction | Accès | Ce qu'elle fait | Statut |
|---|---|---|---|
| Plan du jour | Accueil → cases + curseur → « Appliquer » | Fige les objectifs du jour (Tactique 35, Ouvertures 25, Pièges 25, Revue 15 pts ; seuil optimal sur 100) ; « Modifier le plan » pour déverrouiller | Complète (`daily-plan.test.ts`) ; dernière session en base : 2026-10-16, donc inactive au relevé |
| Séance du jour | Accueil | Cartes de recommandation avec preuve locale, regroupées « ×N », « Impact N » | Complète (`recommendations.test.ts`, `labels.test.ts`) |
| Suivi de réalisation | Accueil, plan actif | « Réalisé aujourd'hui N/M pts », ✓ par objectif | Complète |

### Ouvertures
| Fonction | Accès | Ce qu'elle fait | Statut |
|---|---|---|---|
| Catalogue | `/ouvertures` | 31 cartes, recherche, filtre par camp, étoiles, « À réviser » | Complète |
| Drill (Mode Entraînement) | `/ouvertures/<id>` | Manche 1 guidée, Manche 2 « Sans Guide », chapitres/variantes, indices | Complète (`drill-engine`, `learning-round`, `chapter-tree` testés) |
| Aléatoire / Surprise, Test Final | fiche ouverture | Suites théoriques au hasard ; positions clés des chapitres pratiqués | Complète (`build-final-test.test.ts`) |
| Révisions espacées des variantes | « ⚡ Lancer les révisions du jour » | File des variantes dues enchaînées | Complète (`opening-repetition.test.ts`) |
| Vision Moteur / coaching d'ouverture | fiche ouverture | Flèche de suggestion, alerte piège documenté | Complète (`opening-trap-alert.test.ts`) |
| Mes erreurs fréquentes | fiche ouverture | Déviations des parties importées + « 🎯 M'entraîner » | Complète |
| Sparring | fiche → « Lancer le sparring » | Joue la ligne contre l'arbre ECO puis Stockfish | Complète (`opponent-policy.test.ts`) |
| Endurance Sans Guide + radar + historique | fiche, `/ouvertures`, `/ouvertures/historique-endurance` | 1re gaffe moyenne, robustesse, classement, chronologie, radar 3 piliers | Complète (`opening-stats`, `opening-endurance-history`, `opening-performance-radar` testés) |
| Cours commenté | `/ouvertures/<id>/cours` | Lecteur coup par coup, variantes, éval par nœud, indices en 3 étapes, mode jeu, écarts « Dans tes parties » | Complète pour 11 ouvertures (`opening-course-trees.test.ts`, 18 tests passés au relevé) ; absente pour 20 |
| Popularité des coups (explorer Lichess) | sparring / drill | Fréquence humaine des coups | Désactivée par défaut (`LICHESS_EXPLORER_ENABLED` doit valoir `true`) |

### Pièges
| Fonction | Accès | Ce qu'elle fait | Statut |
|---|---|---|---|
| Bibliothèque de pièges | `/pieges` (URL) | 754 pièges, 84 familles, séries par gambit | Partielle : aucun accès depuis la navigation |
| Drill de piège | `/pieges/<id>` | Mise en place par l'IA, Manches 1/2, série « Suivant → » | Complète (`trap-round.test.ts`, `traps.test.ts`) ; progression en `localStorage` uniquement ; « ☠️ Incarner la victime » indisponible sur le piège relevé |

### Académie (Apprendre)
| Fonction | Accès | Ce qu'elle fait | Statut |
|---|---|---|---|
| Catalogue de thèmes | `/apprendre` | 205 thèmes, 15 catégories, paliers, XP, niveau, mission en cours | Complète |
| Cours du thème | thème → page de cours | Lecteur `CourseTreeViewer` (23 arbres natifs + leçons converties) | Complète (`course-tree`, `course-lesson`, `course-tree-adapters` testés) |
| Exercices et révision du thème | page de cours → exercices ; « Revoir les puzzles » | Vagues de puzzles, coach | Complète (`master-puzzles-dataset.test.ts`) |
| Deep-link | `?themeId=` / `?categoryId=` | Ouvre la page de cours ou la catégorie | Complète |

### Rapport et statistiques
| Fonction | Accès | Ce qu'elle fait | Statut |
|---|---|---|---|
| Rapport global | `/rapport` | Précision par phase, fourchettes/clouages, performance par ouverture, pièces en prise, tableau des qualités | Complète (`progress-insights.test.ts`) |
| Ouverture en difficulté | bandeau `/rapport` | Lien vers le drill du bon camp | Complète |
| Mes ouvertures face au cours / Rapport › ouverture | `/rapport`, `/rapport/ouvertures/<slug>` | Parties confrontées au cours, sorties, gaffes répétées | Complète (`course-game-match.test.ts`) |
| Coups brillants | `/rapport/brillants` | 30 derniers coups Brillant | Complète |

### Coach
| Fonction | Accès | Ce qu'elle fait | Statut |
|---|---|---|---|
| Coach à règles | partie contre bot, revue, cours, puzzles | Messages générés par règles (bulles, « Bilan du commentateur », « Rapport du coach ») | Complète (`coach-feedback(s)`, `pre-solve-coach`, `progress-coach`, `coach-narrative` testés) |
| Coach LLM | — | `ANTHROPIC_API_KEY` / `COACH_ENABLED` dans `.env.example` seulement ; aucun code ne les lit | Absente |

### Divers
| Fonction | Accès | Ce qu'elle fait | Statut |
|---|---|---|---|
| Test du moteur | `/plus` → « Tester » | Analyse de la position initiale | Complète, page orpheline |
| Recherche de parties | Accueil | Par pseudo ou nom de bot | Complète |
| Banque de puzzles par thème (`PuzzleBankScreen`) | — | Écran et action serveur présents, montés nulle part | Non branchée |
| Mission Briefing | — | Composant présent, monté nulle part | Non branché |

---

## 5. CONTENU ET DONNÉES

### Catalogue d'ouvertures — 31 cartes (11 Blancs, 20 Noirs)
Cours = `OPENING_COURSE_TREES` ; nœuds = coups de l'arbre, variantes comprises. Les 11 cours passent `opening-course-trees.test.ts` et `course-tree.test.ts` (18 tests, relancés sur la copie). « Hors répertoire » = `OFF_REPERTOIRE_COURSE_IDS`.

| Camp | Id | Nom affiché | ECO | Cours | Chapitres | Nœuds |
|---|---|---|---|---|---|---|
| Blancs | ruy-lopez | Ruy Lopez (Espagnole) | C60 | complet | 8 | 244 |
| Blancs | italian-game | Partie Italienne | C50 | complet | 7 | 306 |
| Blancs | scotch-game | Partie Écossaise | C45 | complet | 11 | 697 |
| Blancs | scotch-gambit | Gambit Écossais | C44 | complet | 6 | 300 |
| Blancs | sicilian-alapin | Anti-Sicilienne : Alapine | B22 | complet (hors répertoire) | 5 | 217 |
| Blancs | smith-morra-gambit | Gambit Smith-Morra | B21 | absent | — | — |
| Blancs | queens-gambit | Gambit Dame | D06 | absent | — | — |
| Blancs | london-system | Système Londres | D02 | absent | — | — |
| Blancs | english-opening | Partie Anglaise | A10 | absent | — | — |
| Blancs | lichess-catalan-opening | Catalan Opening | E08 | absent | — | — |
| Blancs | lichess-trompowsky-attack | Trompowsky Attack | A45 | absent | — | — |
| Noirs | sicilian-najdorf | Sicilienne Ouverte (Najdorf & Cie) | B20 | complet ; enregistrement non commité | 8 | 362 |
| Noirs | sicilian-dragon | Sicilienne : Variante du Dragon | B70 | complet (hors répertoire) | 5 | 243 |
| Noirs | caro-kann | Défense Caro-Kann | B10 | complet (hors répertoire) | 7 | 344 |
| Noirs | queens-gambit-declined | Gambit Dame Refusé | D35 | complet (commit `4608cea` du 2026-10-19) | 8 | 378 |
| Noirs | slav-defense | Défense Slave | D10 | complet (hors répertoire) | 5 | 231 |
| Noirs | kings-indian | Défense Est-Indienne | E60 | complet | 5 | 219 |
| Noirs | french-defense | Défense Française | C00 | absent | — | — |
| Noirs | pirc-defense | Défense Pirc | B07 | absent | — | — |
| Noirs | scandinavian | Défense Scandinave | B01 | absent | — | — |
| Noirs | nimzo-indian | Défense Nimzo-Indienne | E20 | absent | — | — |
| Noirs | grunfeld | Défense Grünfeld | D80 | absent | — | — |
| Noirs | dutch-defense | Défense Hollandaise | A80 | absent | — | — |
| Noirs | lichess-modern-defense | Modern Defense | B06 | absent | — | — |
| Noirs | lichess-semi-slav-defense | Semi-Slav Defense | D45 | absent | — | — |
| Noirs | lichess-benoni-defense | Benoni Defense | A43 | absent | — | — |
| Noirs | lichess-alekhine-defense | Alekhine Defense | B02 | absent | — | — |
| Noirs | lichess-petrov-s-defense | Petrov's Defense | C42 | absent | — | — |
| Noirs | lichess-tarrasch-defense | Tarrasch Defense | D34 | absent | — | — |
| Noirs | lichess-benko-gambit | Benko Gambit | A57 | absent | — | — |
| Noirs | lichess-bogo-indian-defense | Bogo-Indian Defense | E11 | absent | — | — |

Total : 11 cours, 75 chapitres, 3 541 nœuds (10 cours commités, 67 chapitres, 3 179 nœuds sans le Najdorf). Aucun cours « partiel ». Après le relevé (vers 09:45), l'arbre de travail ajoute une 32e carte `anti-london-black` « Anti-Londres (setup Est-Indien) », Noirs, A48, sans cours.

Chapitres des cours (nœuds entre parenthèses) :
- **ruy-lopez** : Fiche d'identité et tronc commun (9) ; Branche A : la Fermée, système Chigorine (35) ; Aléatoire surprise 1 : après la Chigorine, la case f5 abandonnée (55) ; Branche B : l'Anti-Marshall (7...O-O 8.h3) (19) ; Branche C : l'Ouverte (5...Nxe4) (25) ; Branche D : la Berlinoise, système 4.d3 (23) ; Aléatoire surprise 2 : après la Berlinoise 4.d3, le fou enterré (43) ; Anti-panique : punir les déviations (35).
- **italian-game** : Fiche d'identité et le piège du Fork Trick (4.Nc3?!) (41) ; La ligne saine : Giuoco Pianissimo (4.d3 avant 5.Nc3) (38) ; La prophylaxie face au clouage : le coup h3 (50) ; Le Gambit Evans (4.b4) (36) ; L'Attaque Fegatello (Fried Liver) : 6.Nxf7! (54) ; Anti-panique : la Défense Polerio et le coup ...Nd4 (50) ; Aléatoire surprise : la Pianissimo après la théorie (37).
- **scotch-game** : Fiche d'identité et réponses au 3e coup (49) ; Le 4e coup noir : tour d'horizon des réponses de club (65) ; Branche A : 4...Nf6 5.Nc3, toutes les réponses noires (166) ; Branche B : 4...Bc5 5.Nxc6 Qf6 6.Qf3, toutes les réponses noires (84) ; Anti-panique : les pièges des coups rares (69) ; Surprise 1 : 12...h6?! 13.Bxh6, la marche du roi noir vers le mat (51) ; Surprise 2 : la finale où le roi noir reste au centre (35) ; Surprise 3 : étouffer un adversaire passif (45) ; Surprise 4 : la finale de la branche B quand les Noirs jouent mou (65) ; Surprise 5 : 3...d6, étouffer puis viser le pion d6 (29) ; Surprise 6 : 4...Qh4, la dame gourmande et la chasse au roi (39).
- **scotch-gambit** : Fiche d'identité et 4...Nf6 (67) ; 4...Bc5, la ligne classique (5.c3) et la Max Lange (71) ; 4...Bb4+, l'échec réflexe (43) ; 4...d6, la réponse passive (25) ; 4...f6?, la faute qui affaiblit le roi (35) ; 4...Qf6 et 4...Qe7, la dame sortie trop tôt (59).
- **sicilian-alapin** : Fiche d'identité, tronc commun et la réponse centrale 2...d5 (31) ; La contre-attaque hypermoderne 2...Nf6 (32) ; La variante fermée de club : 2...e6 et 2...d6 (46) ; Anti-panique : 3...e5, 4...e5 et le faux clouage 8...Bb4 (62) ; Aléatoire Surprise : les coups de pion latéraux et le fou noir abandonné (46).
- **sicilian-najdorf** : Fiche d'identité, tronc commun et l'Attaque Anglaise (6.Be3) (49) ; Aléatoire surprise 1 : après l'Attaque Anglaise, la case f4 (46) ; Branche B : 6.Bg5 et le Pion empoisonné (38) ; Aléatoire surprise 2 : après le Pion empoisonné, le clouage en c3 (42) ; Branche C : 6.Be2, la Classique (40) ; Branche D : 6.Bc4, l'Attaque Sozin-Fischer (42) ; Branche E : 6.f4, la Variante Amsterdam (44) ; Anti-panique : 6.h3, 6.f3, 6.g3, 6.a4 et 6.Nd5? (61).
- **sicilian-dragon** : Fiche d'identité, tronc commun et l'Attaque Yougoslave (49) ; La Variante Classique : 6.Be2 et le levier ...d5 (62) ; Le piège de la fausse variante d'échange : 9.Nxc6?! (43) ; Anti-panique : les attaques prématurées g4 et h4 (47) ; Aléatoire surprise : la course au mat mal calculée (42).
- **caro-kann** : Fiche d'identité, tronc commun et Variante d'Échange (4.Bd3) (70) ; Variante d'Avance : 3.e5 Bf5 4.Nf3 e6 5.Be2 c5, le levier thématique (52) ; Variante d'Avance agressive : 4.h4, le module anti-panique (38) ; Variante Classique : 3.Nc3 dxe4 4.Nxe4 Bf5 (50) ; Anti-panique (1/2) : l'Attaque Panov (38) ; Anti-panique (2/2) : la Variante Fantaisie (3.f3) (60) ; Surprise : le grand roque blanc sans plan, puni par ...c5 (36).
- **queens-gambit-declined** : Fiche d'identité, tronc commun et l'Orthodoxe Lasker (4.Bg5) (57) ; Aléatoire surprise 1 : après la Lasker, le pion d4 qui reste (44) ; Branche B : 4.Nf3 Be7 5.Bg5 h6 6.Bxf6, la paire de fous (49) ; Branche C : la Variante d'Échange 4.cxd5 (43) ; Branche D : le système tranquille 3.e3 (tes parties) (50) ; Aléatoire surprise 2 : après le système tranquille, le fou enterré (50) ; Branche E : 4.Nf3 Be7 5.Bf4, le fou en f4 (38) ; Anti-panique : la Catalane et les ordres de coups (47).
- **slav-defense** : Fiche d'identité et tronc commun : 4...dxc4, la Slave Tchèque (50) ; La Ligne Principale : 5.a4 Bf5 6.e3 e6 7.Bxc4 Bb4 8.O-O O-O (58) ; La Variante d'Échange : 3.cxd5 cxd5 (36) ; Anti-panique : 3.e3, 3.e4 et les gambits précoces (58) ; Aléatoire Surprise : le cavalier qui rejoue, puni par ...c5 (29).
- **kings-indian** : Fiche d'identité, tronc commun et Variante Classique : la tempête de pions (38) ; L'Attaque Bayonnette 9.b4 : la ligne moderne de club (38) ; La Variante d'Échange : 7.dxe5, une finale égale mais vivante (36) ; Anti-panique : la Sämisch 5.f3 et l'Attaque des Quatre Pions 5.f4 (63) ; Aléatoire Surprise : les coups de pion mous punis par le levier ...g4 (44).

### Volumes (base réelle, lecture seule, 2026-10-19)
| Donnée | Volume |
|---|---|
| Parties | 440 : 418 Chess.com (toutes avec PGN), 22 locales contre bot (14 sans PGN, aucune avec `analysed_at`) ; Lichess lié, 0 partie. Le Rapport affiche « Parties analysées 422 » |
| Coups analysés (`moves`) | 30 393 |
| Résultats de parties contre bot (`bot_game_results`) | 7 (Club 6, Champion 1) |
| Puzzles issus des parties (cartes FSRS) | 1 730 : Tactiques manquées 720, Positionnelles 381, Ouverture 329, Finale 160, Mats manqués 70, Tactiques 70 |
| Cartes affichées dans « Entraîner » | 1 735 = 79 dues + 1 656 nouvelles (deck « Puzzles du jour » inclus : 0 + 5) |
| Historique de révisions (`review_logs`) | 81 |
| Lots « Puzzles du jour » (`daily_sets`) | 33 |
| Erreurs d'ouverture marquées revues (`opening_mistake_review`) | 30 |
| Lignes de progression d'ouverture (`opening_progress`) | 54 ; 41 variantes dues (bouton « ⚡ Lancer les révisions du jour 41 ») ; « 6 / 31 maîtrisées » |
| Sessions d'endurance « Sans Guide » | 3 |
| Sessions de sparring | 12, 326 coups |
| Événements d'entraînement / recommandations | 112 / 70 |
| Académie | 205 thèmes, 8 660 puzzles (`curriculum_puzzles`), 35 lignes de progression de thème |
| Pièges | 754 affichés (727 importés en base `imported_traps` + 27 statiques), 84 familles |
| Lignes d'ouverture importées (Lichess) | 3 835 |
| Comptes liés | 2 (Chess.com et Lichess, pseudo identique) |
| Réglages (`settings`) | 2 lignes |

Académie par catégorie : Tactical Motifs 36, Positional Mastery 30, Checkmate Patterns 30, Cours du MI Jesper Hall 25, Sparring Positions 20, Motifs 13, Avancé 11, Structures de pions 9, Milieu de partie 7, Thèmes de mat 6, Mats par coups 5, Objectifs & Origines 5, Coups spéciaux 4, Endgame Mastery 3, Faiblesses de pions 1.

### Bots (`core/chess/bot-profiles.ts`)
| Id | Libellé affiché | Avatar | Elo affiché | Elo nominal (jauge, performance) | Réglage moteur | Texte |
|---|---|---|---|---|---|---|
| poussin | « 🟢 Poussin (Débutant) » | 🐥 | 1000 | 1320 (plancher réel `UCI_Elo`) | `UCI_Elo` 1000, réflexion simulée 1–2 s | « Commence ici ton apprentissage. » |
| club (défaut) | « 🟡 Club (Intermédiaire) » | 🛡️ | 1500 | 1500 | `UCI_Elo` 1500, 0,7–1,4 s | « Un joueur tactique et solide de club. » |
| champion | « 🔴 Champion (Avancé) » | ⚔️ | 2000 | 2000 | `UCI_Elo` 2000, 0,5–1 s | « Calculateur redoutable de tournoi. » |
| stockfish | « 💀 Stockfish (Maître) » | 🦾 | « Max » | 3200 (repère conventionnel) | sans limite d'Elo, profondeur 16 | « Puissance brute, sans aucune bride. » |

Couleur : « Blancs » (défaut) ou « Noirs ». Choix de bot et de couleur non mémorisés. Analyse des coups du joueur en direct : profondeur 16. Sparring d'ouverture : arbre ECO puis Stockfish.

### Paramètres utilisateur existants (liste complète trouvée)
En base :
1. `settings` › `training.preferences` — objectifs (`tactics`, `openings`, `traps`, `review`) et `dailyLimit` (1–8, défaut 3). Valeur actuelle : `{"goals":["tactics","openings"],"dailyLimit":4}`.
2. `settings` › `training.daily-session` — plan du jour figé (jour, objectifs, points, date d'application). Valeur actuelle : jour 2026-10-16, 60 pts.
3. `platform_links` — pseudo Chess.com et pseudo Lichess.

Dans le navigateur :
4. `localStorage` `chess-trainer:move-fx-muted` — son des coups (revue de partie).
5. `localStorage` `chess-trainer:move-success-counter` — compteurs de réussite par coup (drill d'ouverture).
6. `localStorage` `chess-trainer:solved-traps` — pièges maîtrisés.
7. `sessionStorage` `chess-trainer:review-queue` — file des révisions d'ouverture du jour.

Variables d'environnement : `DATABASE_PATH`, `LICHESS_EXPLORER_ENABLED` (lues) ; `ANTHROPIC_API_KEY`, `COACH_ENABLED` (déclarées dans `.env.example`, non lues).
Écran de préférences (thème, langue, profil, Elo cible, orientation, bot par défaut) : non trouvé.

---

## 6. PARCOURS ET MESURES

Clics comptés depuis l'accueil `/` ; saisies clavier et défilements non comptés.

**a) Lancer une partie contre un bot — 1 clic**
`/` → « Commencer » (profil « Club » et « Blancs » par défaut) → partie sur la même page. Avec un autre bot ou les Noirs : 2 à 3 clics (carte de bot, liste « Couleur », « Commencer »). Bouton désactivé tant que le moteur charge.

**b) Reprendre un cours d'ouverture — 3 clics, sans reprise de position**
`/` → onglet « Ouvertures » → carte de l'ouverture (défilement : une seule carte visible sans défiler) → « 📖 Cours commenté coup par coup » (ou « Lancer le simulateur de survie (Milieu de jeu) → ») → `/ouvertures/<id>/cours`, ouvert au chapitre 1, premier coup. Variante : « Rapport » → défiler → « Voir les parties → » → « Ouvrir le cours » (3 clics). Aucune mémorisation du dernier chapitre ou coup lu.

**c) Réviser mes erreurs — 2 clics**
`/` → carte « Corrigez vos gaffes … Réviser maintenant → » (ou onglet « Entraîner ») → « Démarrer la révision » sur un deck → session de puzzles (sans URL). Pour les erreurs d'ouverture détaillées : « Entraîner » → « 📊 Comprendre mes erreurs » → « 🎯 S'entraîner » (3 clics).

**d) Voir mon rapport sur une ouverture — 2 clics + défilement**
`/` → onglet « Rapport » → défiler sous le tableau de 26 lignes jusqu'à « Mes ouvertures face au cours » → « Voir les parties → » → `/rapport/ouvertures/<slug>`. Lien présent seulement pour les 9 ouvertures à cours où l'utilisateur a des parties ; la route existe pour les 11 ouvertures à cours.

**e) Importer mes parties — 1 clic + saisie (une seule fois)**
`/` → défiler jusqu'à « Synchronisation automatique » → saisir le pseudo → « Lier ». Import ensuite au chargement des pages puis toutes les 5 minutes tant qu'un onglet est ouvert. Pas d'import manuel ni de bouton « Synchroniser maintenant ».

**f) Faire le plan du jour — 1 clic pour appliquer, puis 1 clic par action**
`/` → défiler jusqu'à « Séance du jour » → cocher les objectifs, régler « Actions par séance » → « Appliquer » → cliquer chaque carte (puzzle intégré, `/ouvertures/<id>?drill=…`, `/pieges/<id>` ou `/analyse/<id>?reviewPly=…`) → retour manuel à `/` pour la carte suivante (sauf puzzles, dans la page). Avec les objectifs déjà enregistrés : « Appliquer » = 1 clic.

---

## 7. PROBLÈMES REPÉRÉS

### Écrans surchargés (éléments interactifs hors en-tête et hors cases)
| Écran | Total | Cases d'échiquier | Sans défiler desktop / mobile | Hauteur desktop / mobile |
|---|---|---|---|---|
| `/apprendre` | 236 | 0 | 22 / 1 | 3 434 / 8 222 px |
| Hub « Comprendre mes erreurs » (vue de `/entrainer`) | 207 | 0 | 11 / non mesuré | 14 545 px / non mesuré |
| `/analyse/<id>` (Chess.com) | 157 | 32 | 28 / 6 | 1 585 / 2 688 px |
| `/rapport/ouvertures/<slug>` | 81 | 0 | 33 / 2 | 3 884 / 8 027 px |
| `/ouvertures/<id>/cours` (Écossaise) | 81 | 32 | 34 / 11 | 2 002 / 2 796 px |
| `/ouvertures/<id>/cours` (GDR) | 76 | 32 | 35 / 11 | 1 616 / 2 466 px |
| `/pieges` | 84 | 0 | 15 / 4 | 3 414 / 9 444 px |
| `/analyse/<id>` (locale) | 78 | 32 | 27 / 5 | 1 737 / 2 989 px |
| `/ouvertures/lichess-modern-defense` | 57 | 32 | 19 / 3 | 2 159 / 3 225 px |
| `/` | 47 / 49 | 0 | 9 / 4 | 2 867 / 4 458 px |
| `/ouvertures` | 40 | 0 | 2 / 1 | 3 397 / 7 664 px |

- L'accueil empile 7 blocs (partie, synchronisation, gaffes, synthèse, Séance du jour + Plan du jour, parties récentes en 25 lignes).
- La fiche ouverture empile Endurance, en-tête, progression, erreurs fréquentes, drill (échiquier + coach + chapitres), sparring ; 2 liens vers le même cours.
- `/ouvertures` : 3 blocs (progression, radar, bannière) avant la 1re carte ; une seule carte visible sans défiler.
- `/rapport` : tableau « Performance par ouverture » de 26 lignes avant « Mes ouvertures face au cours ».
- Rapport › ouverture : liens « Partie 1 » … « Partie 13 » répétés dans chaque groupe.

### Incohérences visuelles entre écrans
- Deux palettes : jetons `:root` (`#020617`, accent `#38bdf8`) pour l'en-tête et la 404, jetons `.canvas` (`#0b0c10`, accent `#66fcf1`) pour les pages ; l'onglet actif est bleu, les accents des pages cyan.
- Trois styles d'en-tête de page : `EsportHeader` (titre 35–58 px), en-tête de détail (`h1` 24 px + lien retour), en-tête propre à Apprendre (`playbook-learn.module.css`). Drill de piège sans `h1`.
- Boutons d'accent en majuscules mono biseautés (« COMMENCER », « DÉMARRER LA RÉVISION ») à côté de boutons secondaires en casse normale (« 📊 Comprendre mes erreurs », « Délier »).
- Liens de retour sous 7 formes : « ← Retour », « ← Retour au Rapport », « ← Toutes les ouvertures », « ← Retour à l'académie », « ← Retour aux thèmes », « ← Retour aux pièges », « ← Retour aux decks » ; en haut à gauche ou en haut à droite selon l'écran (revue de partie, drill de piège à droite).
- Emojis comme icônes à côté des 5 SVG de la navigation ; un même concept a plusieurs emojis (familles de pièges 🇮🇹, ♟️, 🐍… ; bot Stockfish 🦾 et 💀).
- 3 implémentations de bulle de coach (`games/`, `learn/`, `play/`).
- « NIV. 07 » et jauge XP à 68 % fixes dans l'en-tête ; « Niveau 1 » calculé dans Apprendre.
- Page 404 sur fond blanc dans une application entièrement sombre.
- Moteur : prêt sur l'accueil, encore « Chargement de Stockfish… » sur `/plus` 6 s après le chargement.

### Textes trop longs
- Chapeaux de 2 lignes sous chaque grand titre ; chapeau de `/pieges` sur 3 lignes.
- Profil du radar : « Profil : Réflexes d'ouverture solides mais sujet à l'essoufflement positionnel vers le coup 6. » + paragraphe.
- Cartes de la Séance du jour avec noms de variantes complets (« Partie Italienne · Italian Game: Two Knights Defense, Traxler Counterattack, Bishop Sacrifice Line · 49 j de retard · 100 % au dernier passage »).
- Boutons longs : « ☠️ Incarner la victime (Tomber dans le piège) », « Lancer le simulateur de survie (Milieu de jeu) → », « Suivre mon historique d'endurance positionnelle ».
- Titres de chapitres longs (« Surprise 1 : 12...h6?! 13.Bxh6, la marche du roi noir vers le mat ») ; libellé des cartes de bot lu en entier par les lecteurs d'écran (« 🐥 🟢 Poussin (Débutant) 1000 Commence ici ton apprentissage. »).
- Commentaire d'ouverture de chapitre en un bloc continu (fiche d'identité du GDR : ~20 lignes sur fond papier).
- Message technique destiné au développeur dans l'interface d'Apprendre (`data/import/academy/`, `npm run db:seed-academy`).

### États d'erreur ou vides manquants
- 404 par défaut de Next.js, en anglais, sans canevas ni lien de retour ; pas de `error.tsx`, `loading.tsx` ni `not-found.tsx` dans `src/app`.
- Revue d'une partie locale sans PGN → 404 au lieu d'un message, depuis une ligne cliquable.
- Liaison de compte : aucun message d'erreur si le pseudo est invalide ou si l'appel échoue (`linked-accounts.tsx`).
- Moteur : « Chargement du moteur… » / « Chargement de Stockfish… » sans délai maximal ni message d'échec.
- Synchronisation : échec silencieux (`catch` vide dans `use-sync-notifier.ts`).
- Hub « Comprendre mes erreurs » : « Chargement… » de plusieurs secondes, sans squelette.

### Mobile (390 px)
- Pas de défilement horizontal de page (largeur de document = 390 px sur tous les écrans).
- Navigation : les 5 onglets (148 px chacun) défilent horizontalement sur une 2e ligne, barre de défilement masquée ; « Jouer contre des Bots » et « Rapport » visibles, « Entraîner » coupé à droite, « Apprendre » et « Ouvertures » hors champ. En-tête de 118 px.
- Grands titres à 42 px : sur `/apprendre`, `/entrainer`, `/ouvertures`, `/rapport`, `/ouvertures/historique-endurance`, un seul élément interactif visible sans défiler ; deux sur `/rapport/ouvertures/<slug>` et la fiche ouverture.
- Pages très longues : `/pieges` 9 444 px, `/apprendre` 8 222 px, `/rapport/ouvertures/<slug>` 8 027 px, `/ouvertures` 7 664 px, `/rapport` 5 650 px.
- Cibles tactiles sous 44 px (hors en-tête et hors cases) : revue Chess.com 155, cours Écossaise 81, cours GDR 76, revue locale 76, famille Lichess 55, rapport › ouverture 35, page de cours de thème 19, Apprendre 16, accueil 15, fiche ouverture 15, Entraîner 8, Ouvertures 8, historique 3, piège 3, Plus 3. Cases d'échiquier d'environ 36 px sur mobile.

### Accessibilité évidente
- Contrastes calculés : texte secondaire `#8d98a8` sur `#0b0c10` = 6,69:1, sur `#151b23` = 5,93:1 ; `--es-dim #5c6878` sur fond = 3,45:1, sur surface = 3,06:1 (sous 4,5:1) ; gaffe `#c93230` comme texte sur surface = 3,28:1, sur fond = 3,71:1 (« Gaffes 270 », pourcentages rouges du Rapport) ; bouton d'accent 15,6:1.
- Tailles de police de 9 à 11 px dans l'en-tête (« 01 », « Session locale », « E-sports academy ») et les sur-titres (10 px).
- Cases d'échiquier exposées en boutons sans nom accessible (jusqu'à 32 par écran).
- Noms accessibles des cartes de bot concaténant avatar, emoji, libellé, Elo et texte.
- Couleur seule pour signaler les pourcentages bons/mauvais (vert/jaune/rouge) dans le Rapport.
- Points présents : `aria-label` sur la navigation, `aria-current`, `aria-pressed` sur les filtres et bots, `role=meter` sur la charge quotidienne, `role=status` sur le toast, `lang="fr"`.

---

## 8. CAPTURES

Playwright (Chromium), pleine page, 1440×900 (desktop) et 390×844 (mobile, `isMobile`, tactile), 6 s après chargement, indicateur de développement Next.js masqué, `POST /api/sync` intercepté. Dossier : `docs/screens/current/`.

| Écran | Desktop | Mobile |
|---|---|---|
| `/` | `accueil-desktop.png` | `accueil-mobile.png` |
| `/` — partie en cours (vue) | `accueil-partie-en-cours-desktop.png` | `accueil-partie-en-cours-mobile.png` |
| `/rapport` | `rapport-desktop.png` | `rapport-mobile.png` |
| `/rapport/brillants` | `rapport-brillants-desktop.png` | `rapport-brillants-mobile.png` |
| `/rapport/ouvertures/scotch-game` | `rapport-ouvertures-scotch-game-desktop.png` | `rapport-ouvertures-scotch-game-mobile.png` |
| `/entrainer` | `entrainer-desktop.png` | `entrainer-mobile.png` |
| `/entrainer` — session de deck (vue) | `entrainer-session-deck-desktop.png` | `entrainer-session-deck-mobile.png` |
| `/entrainer` — hub « Comprendre mes erreurs » (vue) | `entrainer-hub-erreurs-ouverture-desktop.png` | `entrainer-hub-erreurs-ouverture-mobile.png` |
| `/apprendre` | `apprendre-desktop.png` | `apprendre-mobile.png` |
| `/apprendre?categoryId=positional_mastery` | `apprendre-categorie-positional_mastery-desktop.png` | `apprendre-categorie-positional_mastery-mobile.png` |
| `/apprendre?themeId=pm-l-avant-poste-du-cavalier` | `apprendre-theme-pm-l-avant-poste-du-cavalier-desktop.png` | `apprendre-theme-pm-l-avant-poste-du-cavalier-mobile.png` |
| `/ouvertures` | `ouvertures-desktop.png` | `ouvertures-mobile.png` |
| `/ouvertures/scotch-game` | `ouvertures-scotch-game-desktop.png` | `ouvertures-scotch-game-mobile.png` |
| `/ouvertures/lichess-modern-defense` | `ouvertures-lichess-modern-defense-desktop.png` | `ouvertures-lichess-modern-defense-mobile.png` |
| `/ouvertures/scotch-game/cours` | `ouvertures-scotch-game-cours-desktop.png` | `ouvertures-scotch-game-cours-mobile.png` |
| `/ouvertures/queens-gambit-declined/cours` | `ouvertures-queens-gambit-declined-cours-desktop.png` | `ouvertures-queens-gambit-declined-cours-mobile.png` |
| `/ouvertures/historique-endurance` | `ouvertures-historique-endurance-desktop.png` | `ouvertures-historique-endurance-mobile.png` |
| `/pieges` | `pieges-desktop.png` | `pieges-mobile.png` |
| `/pieges/<id>` | `pieges-detail-desktop.png` | `pieges-detail-mobile.png` |
| `/plus` | `plus-desktop.png` | `plus-mobile.png` |
| `/analyse/<id>` (Chess.com) | `analyse-partie-chesscom-desktop.png` | `analyse-partie-chesscom-mobile.png` |
| `/analyse/<id>` (locale avec PGN) | `analyse-partie-locale-avec-pgn-desktop.png` | `analyse-partie-locale-avec-pgn-mobile.png` |
| `/analyse/<id>` (locale sans PGN → 404) | `analyse-partie-locale-sans-pgn-desktop.png` | `analyse-partie-locale-sans-pgn-mobile.png` |
| route inconnue (404) | `404-desktop.png` | `404-mobile.png` |

48 fichiers, tous produits le 2026-10-19 (les deux captures `analyse-partie-locale-*.png` du relevé précédent ont été remplacées par les deux variantes avec/sans PGN). Non capturés (vues sans URL) : bilan de fin de partie, session d'exercices et révision d'un thème de l'Académie, sparring, Aléatoire / Test Final, session de puzzle de la Séance du jour. Sur `ouvertures-lichess-modern-defense-mobile.png` et `accueil-desktop.png`, la page n'avait pas atteint l'état « réseau inactif » après 240 s (requêtes en continu) ; la capture a été prise quand même.

---

## 9. CONTRAINTES TECHNIQUES

### Fichiers générés ou produits par script
- `web/src/core/curriculum/course-trees/op-*.ts` (11 cours d'ouverture) : générés par `web/scripts/_tmp-build-opening-course.mts` à partir de `web/scripts/opening-course-src/<id>.pgn` + `<id>.header.txt`, avec évaluations Stockfish par nœud ; chiffres cités vérifiés par `web/scripts/_tmp-check-cited-evals.mts`. Le cours `queens-gambit-declined` a été commité pendant le relevé ; d'autres scripts `_tmp-*` non suivis existent (`_tmp-games-dump.mts`, `_tmp-ui-course.mjs`, `_tmp-drift-w.mts`).
- `web/src/core/curriculum/opening-course-trees.ts` et `opening-course-ids.ts` : deux registres qui doivent rester identiques (test) ; `OFF_REPERTOIRE_COURSE_IDS` lu par le plan du jour.
- `web/src/core/curriculum/course-trees/pm-*.ts` (18 cours de l'Académie) ; 23 arbres natifs enregistrés dans `course-tree.ts`.
- **Module 20** : `web/src/core/curriculum/course-trees/pm-les-coups-de-rupture.ts` (commit `7adefa0` « module 19 AND 20 », +203 lignes non commitées au relevé). Le catalogue contient aussi un « Module 20 : Le roi actif en finale » (Jesper Hall, `catalog.ts`).
- `web/src/core/curriculum/catalog.ts` (205 thèmes, contrôle au démarrage hors production), `master-puzzles-dataset.ts`, `puzzle-alternatives.json`.
- `web/data/import/academy/*.json` et `*.override.json`, alimentés par `scripts/seed-academy.ts` et `scripts/academy-mining/`.
- Base `web/data/chess-trainer.db` + migrations `web/drizzle/` (15 appliquées) ; table `imported_opening_lines` à conserver.
- `web/src/server/curriculum/imported-openings-index.ts` : `DISPLAYED_LICHESS_FAMILIES` détermine les 11 cartes `lichess-*`.
- `web/src/app/fonts/*.woff2`, `web/public/engine/` (Stockfish WASM, recopié par `postinstall`).
- `AGENTS.md` / `CLAUDE.md` : bloc réécrit par `next dev`.

### Routes qui doivent rester valides (liens construits dans le code ou attendus par les tests)
`/`, `/?page=<n>`, `/rapport`, `/rapport/brillants`, `/rapport/ouvertures/<slug>`, `/entrainer`, `/apprendre`, `/apprendre?themeId=`, `/apprendre?categoryId=`, `/ouvertures`, `/ouvertures/<id>`, `/ouvertures/<id>?drill=<clé>&side=white|black&mode=sans-guide#drill`, `/ouvertures/<id>/cours`, `/ouvertures/<id>/cours?chapitre=&noeud=`, `/ouvertures/historique-endurance` (segment statique prioritaire sur `[slug]`), `/pieges`, `/pieges/<id>`, `/plus`, `/analyse/<id>`, `/analyse/<id>?openingId=&ply=`, `/analyse/<id>?reviewPly=`, `/analyse/<id>?course=<id>&reviewPly=`, `POST /api/sync`.
Identifiants : ids de `OPENINGS` + `lichess-<famille>` ; ids de piège `bulk-raw-…` en base.

### Tests qui vérifient des libellés ou des structures d'interface
Aucun test ne rend de composant (environnement `node`). Les tests suivants figent des textes ou des URL affichés :
- `src/lib/labels.test.ts` : titres et preuves des cartes de la Séance du jour (« Motif Fourchette manqué 3 fois », « Erreur décisive (mat ou perte lourde) », « Piège de ton répertoire (Italienne) », « Puzzle en retard de 53 j », « Mat du couloir · deck Mats manqués », « deck Erreurs positionnelles »…).
- `src/client/features/openings/opening-stats.test.ts` : « Verrouiller les réflexes (Mode Sans Guide - Début) », « Lancer le simulateur de survie (Milieu de jeu) », URL `/ouvertures/slav-defense?drill=main_line&side=black&mode=sans-guide#drill` et `/ouvertures/slav-defense/cours`, paliers « fragile » / « moyen » / « solide » / « intact ».
- `src/client/features/openings/opening-performance-radar.test.ts` : niveaux « fort » / « moyen » / « faible », phrases (« Priorité de travail : Dragon, première gaffe au coup 2 en moyenne. »).
- `src/client/features/openings/opening-endurance-history.test.ts` : titres de chronologie (« Hier dans la Caro-Kann », « Il y a 2 jours dans l'Alapine »).
- `src/client/features/openings/chapter-tree.test.ts`, `drill-engine.test.ts`, `learning-round.test.ts`, `build-final-test.test.ts`, `trap-round.test.ts`, `opening-mistake-round.test.ts` : structures du drill, des chapitres, du Test Final et des pièges.
- `src/client/features/learn/course-tree-nav.test.ts` : navigation du lecteur de cours.
- `src/client/features/reviews/opening-mistake-groups.test.ts` : regroupement du hub d'erreurs.
- `src/core/curriculum/opening-course-trees.test.ts` : registres identiques, ouvertures existantes dans `OPENINGS`, chaque chapitre part de la position initiale, titre + introduction + commentaire + évaluation sur chaque nœud, 3 indices sur les fautes du Gambit Écossais.
- `src/core/training/recommendations.test.ts`, `daily-plan.test.ts` (core et server) : regroupement des cartes, points d'effort, structure de la session.
- `src/core/curriculum/coach-feedbacks.test.ts`, `coach-feedback.test.ts`, `core/puzzle/*-coach.test.ts`, `core/analysis/coach-narrative.test.ts`, `live-commentary.test.ts` : textes du coach.
- `src/core/chess/bot-profiles.test.ts` (profils de bots), `src/core/chess/decks.test.ts` (ids et classement des decks).
- `src/core/curriculum/master-puzzles-dataset.test.ts`, `course-tree.test.ts`, `course-lesson.test.ts`, `academy-parser.test.ts`, `traps.test.ts`, `traps-parser.test.ts` : intégrité des contenus.
- `src/core/curriculum/openings.test.ts`, `server/queries/openings.test.ts`, `server/curriculum/imported-openings-index.test.ts` : catalogue d'ouvertures.

Autres contraintes relevées dans le code : `next.config.ts` impose COOP/COEP (toute ressource externe doit être servie en CORS/CORP — police et moteur servis en local) ; `QUALITY_SYMBOL` et jetons `--quality-*` décrits comme invariants dans `CLAUDE.md` ; thème sombre unique exigé par `CLAUDE.md` (« bg-slate-950 ») ; `turbopack.root` fixé dans `next.config.ts`.
