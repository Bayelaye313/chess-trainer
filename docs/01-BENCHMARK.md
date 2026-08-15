# Benchmark — Chess.com Premium vs Noctie.ai vs Lotus Chess

> Document de cadrage. Objectif : identifier ce qui fait la valeur des outils payants,
> mesurer l'écart avec le code base actuel (Flask + Stockfish), et prioriser.
> Date : août 2026.

---

## 1. Le code base actuel — état des lieux

Stack : Flask (797 l.) + JS vanilla (521 l.) + chessboard.js + Stockfish local (binaire), stockage JSON.

### Ce qui existe déjà et qui est bon
| Brique | Fichier | Qualité |
|---|---|---|
| Partie vs Stockfish avec ELO cible (`UCI_LimitStrength`) | [app.py:71](chess-trainer/app.py#L71) | OK |
| Classification des coups en 6 niveaux + « Brillant » sur sacrifice | [app.py:80](chess-trainer/app.py#L80), [app.py:113](chess-trainer/app.py#L113) | Bonne base |
| Détection de motifs tactiques (fourchette, clouage, enfilade, découverte, couloir, pièce en prise) | [app.py:265](chess-trainer/app.py#L265) | **Vrai différenciateur, à garder** |
| Catégorisation auto en 7 decks | [app.py:132](chess-trainer/app.py#L132) | OK |
| Import Chess.com via API publique | [app.py:509](chess-trainer/app.py#L509) | OK mais limité |
| Répétition espacée Leitner 5 boîtes | [app.py:411](chess-trainer/app.py#L411) | À remplacer par FSRS |
| Puzzles du jour non répétés | [app.py:449](chess-trainer/app.py#L449) | OK |

### Les limites structurelles
1. **Analyse synchrone et lente** — chaque coup lance un `popen_uci` (nouveau process Stockfish) puis 2 `analyse()` à profondeur 14. Idem pour l'IA : [app.py:629](chess-trainer/app.py#L629) rouvre un moteur à chaque coup. Coût : ~1–3 s par coup joué.
2. **Import bridé** — 60 demi-coups max, 20 parties max, profondeur 10, séquentiel. Un import de 20 parties = plusieurs minutes bloquantes.
3. **Pas de persistance des parties** — `GAMES = {}` en mémoire : un reload du serveur perd tout. Aucun historique de parties, donc **aucun Insights possible**.
4. **Stockage JSON monolithique** — `load_puzzles()` relit et réécrit tout le fichier à chaque réponse de puzzle. Ne tient pas au-delà de quelques milliers de puzzles.
5. **Puzzle = 1 seul coup** — pas de séquence multi-coups, pas de réplique de l'adversaire.
6. **Pas de notion d'ouverture** — aucun ECO, aucun répertoire, aucune stat par ouverture.
7. **Pas de compte / multi-appareil** — mono-utilisateur, local.
8. **IA non humaine** — Stockfish bridé joue « mal mais bizarrement » (coups aléatoires faibles), là où Noctie joue « comme un humain de 1200 ».

---

## 2. Benchmark fonctionnel

### 2.1 Chess.com Premium (Diamond ~ 14 €/mois)
Le standard du marché, très large mais peu personnalisé.

| Fonctionnalité | Détail |
|---|---|
| **Game Review illimité** | Précision (CAPS2), classification des coups, **Coach Explanations** en langage naturel sur chaque coup |
| **Key Moments** | Parcours guidé des positions critiques : dernier coup de théorie, brillant, gaffe, tactique manquée |
| **Retry Mistakes** | Rejouer la position ratée, feedback immédiat, **score de précision recalculé** |
| **Insights** | Précision globale vs pairs, perf par phase (ouverture/milieu/finale), top 10 ouvertures jouées + résultats, **forks/pins/mats trouvés vs manqués**, pièces laissées en prise, perf par heure du jour / jour de semaine |
| **Puzzles** | Illimités + Puzzle Rush / Battle / Streak + recommandations tactiques personnalisées |
| **Lessons** | Cours GM illimités : ouvertures, stratégie, finales, calcul |
| **Bots** | Bots à personnalité, tous niveaux |
| **Divers** | Sans pub, Friends & Family (6 comptes) |

**À reprendre :** Insights (le plus rentable pour nous — on a déjà la détection de motifs), Key Moments, Retry Mistakes.
**À ignorer :** cours vidéo GM, social, bots à personnalité.

### 2.2 Noctie.ai (~14 €/mois, 8,33 €/mois à l'année)
Le plus proche de notre philosophie. Le produit est mince mais l'IA est le cœur.

| Fonctionnalité | Détail |
|---|---|
| **IA humaine** | Entraînée sur des milliards de parties humaines. Reproduit ouvertures, **erreurs** et **timing** réalistes du débutant au GM. C'est *le* différenciateur. |
| **Feedback temps réel** | Codes couleur excellent → gaffe pendant la partie |
| **Decks de flashcards auto** | Puzzles générés depuis **tes propres erreurs**, en répétition espacée |
| **Opening Practice** | Choisir une ouverture, l'IA répond par les variantes humaines courantes (pas la théorie parfaite) |
| **Répertoire importable** | Importer son opening book et le driller **en partie complète** |
| **Positions custom** | Poser une position/finale et la jouer |
| **100+ leçons** | Finales et thèmes positionnels |
| **Daily puzzles + scénarios hebdo** | |

**À reprendre :** tout le modèle « erreurs → decks → SRS » (déjà en place chez nous), le drill de répertoire en partie complète, les positions custom.
**Le gros chantier :** l'IA humaine.

### 2.3 Lotus Chess (~8 €/mois, 50–70 €/an)
Le plus « rentable » en features par euro. Très orienté ouvertures.

| Fonctionnalité | Détail |
|---|---|
| **Cours d'ouverture personnalisé** | Analyse **jusqu'à 3000 parties** importées (Chess.com/Lichess), identifie les faiblesses, génère un cours sur mesure |
| **Lignes « punitives »** | Enseigne les lignes qui **exploitent les erreurs courantes** de tes adversaires à ton niveau — pas les lignes engine-perfect |
| **Bibliothèque 80+ ouvertures** | |
| **Cours de finales** | 60+ leçons, 180+ positions à jouer contre un moteur humain |
| **100 000+ puzzles** | |
| **Stats & Insights** | Perf par ouverture dans le temps, quelles ouvertures te font gagner |
| **Daily training** | Set d'exercices frais chaque jour |
| **Offline + sync multi-appareils** | |
| Reproche récurrent des users | *« manque d'explications derrière les coups »* + sync défaillante |

**À reprendre :** l'analyse de masse (3000 parties, pas 20), les lignes punitives statistiques, les stats par ouverture.
**Notre angle d'attaque :** leur point faible avoué = **l'explication**. On peut faire mieux avec un coach LLM branché sur nos motifs détectés.

---

## 3. Matrice de synthèse

| Fonctionnalité | Chess.com | Noctie | Lotus | **Nous (actuel)** | Priorité |
|---|:---:|:---:|:---:|:---:|:---:|
| Partie vs IA niveau réglable | ✅ | ✅ | ✅ | ✅ | — |
| **IA au jeu humain (Maia)** | ⚠️ bots | ✅✅ | ✅ | ❌ | **P1** |
| Feedback coup par coup live | ✅ | ✅ | ❌ | ✅ | — |
| Game Review complet | ✅✅ | ⚠️ | ✅ | ❌ | **P1** |
| Explications en langage naturel | ✅ | ⚠️ | ❌ | ❌ | **P1** ⭐ |
| Key Moments / Retry | ✅ | ❌ | ❌ | ❌ | P2 |
| Detection de motifs tactiques | ✅ | ⚠️ | ⚠️ | ✅ | — |
| Puzzles depuis tes erreurs | ⚠️ | ✅ | ✅ | ✅ | — |
| Répétition espacée | ❌ | ✅ | ❌ | ⚠️ Leitner | P2 → FSRS |
| Puzzles multi-coups | ✅ | ✅ | ✅ | ❌ | **P1** |
| Banque de puzzles externe | ✅ 500k+ | ✅ | ✅ 100k | ❌ | P2 (Lichess DB, 4M gratuits) |
| Import masse (1000+ parties) | ✅ | ⚠️ | ✅✅ | ❌ 20 max | **P1** |
| Import Lichess | ❌ | ✅ | ✅ | ❌ | P1 (trivial) |
| **Répertoire d'ouvertures** | ✅ | ✅ | ✅✅ | ❌ | **P1** |
| Drill répertoire en partie | ❌ | ✅ | ⚠️ | ❌ | P2 |
| Stats par ouverture | ✅ | ❌ | ✅✅ | ❌ | P2 |
| **Insights / dashboard** | ✅✅ | ❌ | ✅ | ❌ | **P1** |
| Cours de finales | ✅ | ✅ | ✅✅ | ❌ | P3 |
| Positions custom / sparring | ⚠️ | ✅ | ✅ | ❌ | P2 |
| Sync multi-appareils | ✅ | ✅ | ⚠️ | ❌ | P3 |
| Prix | 14 €/m | 14 €/m | 8 €/m | **0 €** | — |

⭐ = notre opportunité de différenciation la plus forte.

---

## 4. Positionnement retenu

Trois piliers, dans cet ordre :

1. **Adversaire humain crédible** (Maia/lc0) — sinon l'entraînement ne transfère pas en partie réelle. C'est ce que Noctie vend 14 €/mois.
2. **Boucle erreur → puzzle → SRS**, déjà à moitié construite, à industrialiser (FSRS, multi-coups, volume).
3. **Explication** — le trou commun aux trois concurrents. Coach LLM ancré sur les données objectives qu'on produit déjà (motifs, cp_loss, phase, meilleur coup). Pas de LLM qui « invente » l'analyse : le moteur calcule, le LLM verbalise.

Ce qu'on ne fait **pas** : jeu en ligne multijoueur, social, vidéos, apps mobiles natives (PWA suffit).

---

## 5. Décisions techniques structurantes

| Sujet | Choix | Pourquoi |
|---|---|---|
| Framework | **Next.js 15 App Router + TypeScript** | Demandé. Server Actions pour les mutations, RSC pour les dashboards. |
| Moteur — live | **Stockfish 17 WASM (NNUE) en Web Worker** | 0 latence réseau, 0 coût serveur, analyse permanente pendant que tu joues. |
| Moteur — batch | **Stockfish natif côté serveur, en job queue** | Import de 1000 parties = travail de fond, pas une requête HTTP. |
| IA humaine | **Maia (lc0) — maia-1100 → maia-1900** | Réseaux publics, entraînés sur Lichess, prédisent le coup *humain* à un ELO donné. |
| Base de données | **PostgreSQL + Drizzle ORM** | Insights = agrégations SQL. Le JSON actuel ne tient pas. |
| SRS | **FSRS-5** (`ts-fsrs`) | Nettement supérieur à Leitner, standard de fait (Anki). |
| Échiquier | **react-chessboard v5 + chess.js** | Remplace chessboard.js/jQuery. |
| Puzzles externes | **Lichess puzzle DB (4M, CC0)** | Gratuit, thèmes déjà taggés, ratings calibrés. |
| Coach | **Claude API**, ancré sur les données moteur | Verbalise, n'analyse pas. |

---

## 6. Roadmap par étapes

Chaque étape est livrable et testable seule.

| # | Étape | Contenu | Dépend de |
|---|---|---|---|
| **0** | Socle Next.js | Monorepo, TS, Drizzle + Postgres, layout, auth locale | — |
| **1** | Portage du moteur | Stockfish WASM en worker, hook `useEngine`, portage du classifieur et **des détecteurs de motifs** (Python → TS) | 0 |
| **2** | Jouer | Partie vs Stockfish ELO, feedback live, persistance des parties en base | 1 |
| **3** | Import & analyse de masse | Chess.com + Lichess, job queue, 1000+ parties, progression temps réel | 1 |
| **4** | Game Review | Timeline, graphe d'éval, Key Moments, Retry, précision recalculée | 3 |
| **5** | Insights | Dashboard : phases, motifs trouvés/manqués, ouvertures, heures, tendances | 3 |
| **6** | Practice v2 | FSRS, puzzles multi-coups, decks, daily, import Lichess DB | 3 |
| **7** | Répertoire d'ouvertures | Arbre ECO, détection du répertoire réel depuis tes parties, lignes punitives, drill | 5 |
| **8** | IA humaine (Maia) | Service lc0, sélection du réseau par ELO, timing réaliste | 2 |
| **9** | Coach LLM | Explications ancrées sur motifs + cp_loss, plan d'entraînement hebdo | 4, 5 |
| **10** | Finales & sparring | Positions custom, cours de finales, jouer la position jusqu'au gain | 8 |

---

## Sources

- [Chess.com — What does each level of premium membership get me?](https://support.chess.com/en/articles/8562418-what-does-each-level-of-premium-membership-get-me)
- [Chess.com — What is Insights?](https://support.chess.com/en/articles/8708925-what-is-insights-on-chess-com)
- [Chess.com — How does Game Review work?](https://support.chess.com/en/articles/8584089-how-does-game-review-work)
- [Chess.com — Game Review new features](https://www.chess.com/news/view/chesscom-launches-game-review-v2)
- [Noctie.ai](https://noctie.ai)
- [Noctie Chess Trainer — App Store](https://apps.apple.com/us/app/noctie-chess-trainer/id6444289077)
- [Noctie — Review, features & pricing (Aigregator)](https://aigregator.com/tools/noctie)
- [Lotus Chess – Trainer — App Store](https://apps.apple.com/us/app/lotus-chess-trainer/id6738741464)
- [Lotus Chess – Trainer — Google Play](https://play.google.com/store/apps/details?id=com.lotuschess.app&hl=en_US)
