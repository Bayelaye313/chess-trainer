import { Chess } from "chess.js";
import { describe, expect, it } from "vitest";
import { uciSequenceToSan } from "@/core/chess/replay";
import { describeMatePatterns, type MatePattern } from "@/core/chess/mate-patterns";
import { CURRICULUM_THEMES } from "./catalog";
import { MASTER_PUZZLES_DATASET } from "./master-puzzles-dataset";

/**
 * Thèmes de mat nommé (`cm-*`) → le motif que `mate-patterns.ts` doit
 * RECALCULER sur la position finale. Filet de non-régression : une position
 * composée à la main pour "Mat de Boden" doit rester, coup après coup, un
 * vrai mat de Boden — jamais un mat générique déguisé en mat nommé.
 * `cm-mat-du-moulin` en est absent : ce thème repose sur `tactical-signals.ts`
 * (`windmill`), pas sur un `MatePattern`.
 */
const EXPECTED_MATE_PATTERN: Record<string, MatePattern> = {
  "cm-mat-du-couloir": "back_rank",
  "cm-mat-de-l-escalier": "ladder",
  "cm-mat-d-anastasia": "anastasia",
  "cm-mat-arabe": "arabian",
  "cm-mat-de-boden": "boden",
  "cm-mat-de-damiano": "damiano",
  "cm-mat-de-blackburne": "blackburne",
  "cm-mat-de-l-epaulette": "epaulette",
  "cm-mat-de-greco": "greco",
  "cm-mat-du-crochet": "hook",
  "cm-mat-de-legall": "legall",
  "cm-mat-de-lolli": "lolli",
  "cm-mat-de-morphy": "morphy",
  "cm-mat-de-l-opera": "opera",
  "cm-mat-de-pillsbury": "pillsbury",
  "cm-mat-de-reti": "reti",
  "cm-mat-etouffe": "smothered",
  "cm-mat-de-la-queue-d-aronde": "dovetail",
  "cm-mat-de-vukovic": "vukovic",
  "cm-mat-des-deux-fous": "double_bishop",
  "cm-mat-de-la-boite": "box",
  "cm-mat-du-triangle": "triangle",
  "cm-mat-dame-et-tour": "queen_rook",
  "cm-mat-des-deux-tours": "two_rooks",
  "cm-mat-roi-et-dame-contre-roi": "king_queen",
  "cm-mat-de-cozio": "cozio",
  "cm-mat-du-fou-de-damiano": "damiano_bishop",
  "cm-mat-de-max-lange": "max_lange",
  "cm-mat-du-filet": "net",
};

/**
 * Les 6 catégories `lichess_*` (`catalog.ts`, « Saturation Lichess ») sont des
 * réservoirs purs alimentés par le pipeline d'import, jamais par ce dataset
 * statique — voir leur docstring. La bijection stricte ci-dessous ne porte
 * donc que sur les 161 thèmes curatés (144 d'origine + les 9 `pawn_structures`
 * + le thème `pawn_weaknesses` + les 7 `middlegame`).
 */
const LICHESS_TAG_CATEGORIES = new Set([
  "lichess_motifs",
  "lichess_advanced",
  "lichess_mate_in",
  "lichess_mate_themes",
  "lichess_special_moves",
  "lichess_goals_origin",
]);
const CURATED_THEME_IDS = new Set(
  CURRICULUM_THEMES.filter((t) => !LICHESS_TAG_CATEGORIES.has(t.category)).map((t) => t.id),
);

describe("MASTER_PUZZLES_DATASET", () => {
  it("couvre les 161 thèmes CURATÉS du catalogue, au moins une entrée chacun", () => {
    // Depuis le 2026-09-10, `themeId` n'est plus forcément unique dans le
    // tableau : `pm-le-mauvais-fou` et `pm-l-avant-poste-du-cavalier` portent
    // chacun 8 entrées (une vague de puzzles, voir le docstring d'en-tête)
    // plutôt qu'1 — la COUVERTURE (chaque thème curaté représenté) reste
    // l'invariant, pas la longueur ligne-à-ligne.
    const datasetIds = new Set(MASTER_PUZZLES_DATASET.map((p) => p.themeId));
    expect(datasetIds.size).toBe(161);
    for (const id of CURATED_THEME_IDS) expect(datasetIds.has(id)).toBe(true);
    for (const id of datasetIds) expect(CURATED_THEME_IDS.has(id)).toBe(true);
  });

  it("650 entrées au total — 129 thèmes à 1 exercice + 32 vagues", () => {
    // Vagues 2026-09-10 : `pm-le-mauvais-fou`/`pm-l-avant-poste-du-cavalier`
    // (8 chacun) puis un 2e lot de 5 thèmes convertis « au format Lichess »
    // (tutoriel + vague de puzzles) — `pm-la-tour-a-la-7e-rangee`,
    // `pm-la-securite-du-roi-en-milieu-de-partie`, `pm-la-centralisation-des-pieces`
    // et `pm-la-paire-de-fous` (15 chacun), `pm-la-chaine-de-pions` (17, une
    // partie source plus riche en points de décision réels) — puis un 3e lot
    // de 6 thèmes de plus, sourcés depuis les derniers fichiers PILOT
    // `positional_mastery` restés inutilisés : `pm-l-avantage-d-espace` (12),
    // `pm-le-complexe-de-cases-faibles` (15, 2 parties réelles du même
    // fichier PILOT), `pm-les-coups-de-rupture` (12),
    // `pm-prophylaxie-anticiper-le-plan-adverse` (15),
    // `pm-activite-des-pieces-contre-materiel` (13),
    // `pm-evaluer-un-echange-de-pieces` (12) — puis un 1er lot « Palier Or »
    // (2026-09-11, aucun fichier PILOT disponible pour ces thèmes : parties
    // de maîtres réelles sourcées sur le web) : `pm-la-restriction-des-pieces-adverses`
    // (13, Botvinnik–Sorokin, URSS 1931), `pm-la-surprotection-nimzowitsch`
    // (14, Nimzowitsch–Salwe, Karlsbad 1911) et `pm-le-blocus-du-pion-passe`
    // (13, Sämisch–Nimzowitsch, Copenhague 1923, « The Immortal Zugzwang
    // Game ») — puis un 2e lot « Palier Or » (même jour, même méthode) :
    // `pm-transformer-un-avantage` (13, Caruana–Shankland, Sinquefield Cup
    // 2021), `pm-la-technique-de-simplification` (14, Carlsen–Nepomniachtchi,
    // Championnat du Monde 2021 partie 6) et `pm-le-complexe-de-cases-de-couleur`
    // (13, Pachman–Fischer, Olympiade de La Havane 1966) — puis un 3e et
    // dernier lot « Palier Or » (même jour, même méthode) :
    // `pm-le-fou-contre-trois-pions` (13, Fischer–Spassky, Reykjavik 1972
    // partie 1), `pm-la-forteresse-defensive` (13, Hawkins–Gormally, 2008)
    // et `pm-la-superiorite-de-l-aile-dame` (14, Marshall–Capablanca, New
    // York 1909 partie 23) — ce qui clôt le Palier Or (10/10 thèmes avancés
    // en vague). Enfin, sprint de clôture du 2026-09-11 : 4 des 8 thèmes
    // `positional_mastery` du Palier BRONZE encore à 1 seul exercice
    // reçoivent eux aussi leur vague, sourcés depuis la MÊME partie déjà
    // citée dans leur `COURSE_LESSONS` existant (aucune nouvelle recherche) :
    // `pm-cavalier-contre-fou-qui-domine` (13, Karpov–Unzicker, Nice 1974,
    // « Squeeze Play »), `pm-les-pions-pendants` (15, Petrosian–Geller,
    // Amsterdam Candidates 1956, ronde 10 — partie nulle réelle, PAS un
    // abandon noir malgré une note antérieure), `pm-doubler-les-pions-adverses`
    // (13, Lasker–Capablanca, Saint-Petersbourg 1914) et
    // `pm-le-pion-passe-protege` (14, Aronian–Anand, Morelia-Linares 2007,
    // « Levon For Good ») — puis, premier chantier du cursus Jesper Hall
    // (même jour) : `jh-module-1-structures-de-pions-symetriques` (15,
    // Rubinstein–Salwe, Lodz 1908, « The Backward Pawn »), qui remplace son
    // unique ligne théorique générique par une vague réelle, sourcée sur le
    // web faute de fichier PILOT pour ce cursus. Puis, second chantier
    // `jesper_hall_course` (2026-09-11, « Lot 2 » — structures de pions du
    // milieu de partie) : `jh-module-2-jouer-contre-l-isolani` (14,
    // Portisch-Karpov, Milan 1975, la partie isolani/E54 authentique — pas
    // celle initialement citée par erreur), `jh-module-3-la-structure-carlsbad`
    // (14, Petrosian-Krogius, URSS ch26 Tbilisi 1959, le modèle d'attaque de
    // minorité déjà cité par l'article Wikipédia « Minority attack ») et
    // `jh-module-4-la-structure-maroczy` (14, Lutz-Vokac, Dortmund-B 1991,
    // sourcée via l'étude Lichess S5BJsGLV) remplacent chacune leur unique
    // ligne théorique par une vague réelle de 14 puzzles. Puis Lot 3
    // (2026-09-11, même jour, clôture des structures de pions du milieu de
    // partie) : `jh-module-5-le-herisson-hedgehog` (14, Fischer-Andersson,
    // Siegen 1970 — « Belgrade 1970 » du cahier des charges n'existe pas,
    // même partie gardée ville corrigée, LA partie fondatrice du Hérisson
    // selon Wikipédia), `jh-module-6-la-chaine-de-pions-en-francais` (14 de
    // plus, Nimzowitsch-Salwe Karlsbad 1911 — même partie que le tutoriel
    // ajouté à `COURSE_LESSONS` et que `pm-la-surprotection-nimzowitsch`,
    // plis distincts, aucune collision de FEN) et
    // `jh-module-7-structures-a-pions-doubles` (14, Nimzowitsch-Capablanca,
    // Saint-Pétersbourg 1914 — « Botvinnik-Vidmar Nottingham 1936 » du
    // cahier des charges est exactement la partie déjà écartée pour Carlsbad
    // au Lot 2, un isolani et non des pions doublés) remplacent chacune leur
    // unique ligne théorique par une vague réelle de 14 puzzles. Puis Lot 4
    // (2026-09-11, même jour, dynamique pure/roques opposés/déséquilibres) :
    // `jh-module-8-le-roque-oppose-et-l-attaque-de-pions` (14, Karpov-Korchnoi,
    // Finale des Candidats Moscou 1974 partie 2, B77 Dragon Attaque
    // Yougoslave — partie assignée déjà exacte, vérifiée avant rédaction),
    // `jh-module-9-la-minorite-d-attaque` (14 de plus, Karpov-Lautier,
    // Dortmund 1995, une des 3 parties canoniques citées par l'article
    // Wikipédia « Minority attack » — « Pillsbury-Lasker Nuremberg 1896 » du
    // cahier des charges est une partie inexistante dans ce sens, remplacée
    // après validation utilisateur ; puzzles en plus des 23 steps de
    // tutoriel déjà présents pour ce thème) et
    // `jh-module-10-le-sacrifice-positionnel-de-qualite` (14, Reshevsky-Petrosian,
    // Zurich Candidates 1953, LA référence historique du sacrifice
    // positionnel de qualité 25...Re6!! — « Petrosian-Reshevsky » du cahier
    // des charges avait les couleurs inversées, citation corrigée, même
    // partie conservée) remplacent chacune leur unique ligne théorique par
    // une vague réelle de 14 puzzles. Puis Lot 5 (2026-09-12, technique de
    // finales pures) : `jh-module-11-les-finales-de-tours-pratiques` (12,
    // aucun nouveau tutoriel — « Rubinstein-Vidmar San Sebastian 1911 » du
    // cahier des charges est une nulle rapide en 22 coups sans contenu de
    // finale de tours ; puzzles tirés des 3 parties déjà réelles du tutoriel
    // existant : Alekhine-Capablanca 1927, Capablanca-Tartakower 1924,
    // Rubinstein-Lasker 1909), `jh-module-12-les-finales-de-fous-de-couleurs-opposees`
    // (14 de plus, Topalov-Shirov, Linares 1998 — « Shirov-Topalov » du
    // cahier des charges avait les couleurs inversées ; LA partie du
    // sacrifice 47...Bh3!!, la plus célèbre finale de Fous opposés de
    // l'histoire) et `jh-module-13-transition-milieu-de-partie-vers-finale`
    // (14, Capablanca-Yates, Hastings 1930/31 — « Capablanca-Nimzowitsch
    // Saint-Pétersbourg 1914 » du cahier des charges est une partie
    // inexistante dans ce sens (seule variante réelle, Nimzowitsch-Capablanca,
    // déjà utilisée dans jh-module-7, ne comporte aucun échange de Dames) ;
    // premier tutoriel réel de ce thème, 8 CourseSteps) remplacent chacune
    // leur unique ligne théorique par une vague réelle. Puis Lot 6
    // (2026-09-12, clôture du Palier Argent du cursus Jesper Hall) :
    // `jh-module-14-l-art-de-la-conversion` (14, Fischer-Taimanov, Vancouver
    // 1971 Candidats partie 4, 71 coups — la plus longue partie du cursus,
    // premier tutoriel réel de ce thème, 7 CourseSteps) et
    // `jh-module-15-fou-contre-cavalier-mode-d-emploi` (13, Capablanca-Steiner,
    // exhibition d'échecs vivants de Los Angeles 1933, mat en 25 coups —
    // premier tutoriel réel de ce thème, 6 CourseSteps ; cette partie alimente
    // déjà 5 puzzles de `pm-la-securite-du-roi-en-milieu-de-partie` sous un
    // angle différent, chaque position choisie ici vérifiée sans collision de
    // FEN avec ce thème) remplacent chacune leur unique ligne théorique par
    // une vague réelle. `jh-module-11`, `jh-module-12` et `jh-module-13`
    // (Lot 5, voir plus haut) manquaient de leur taille attendue dans ce
    // dictionnaire depuis leur ajout — corrigé ici au passage, aucun contenu
    // changé. Puis Lot 7 (2026-09-12, ouverture du Palier Or « Avancé » du
    // cursus Jesper Hall) : `jh-module-16-construire-un-plan-a-long-terme`
    // (13, Nimzowitsch-Rubinstein, Dresde 1926 — « Rubinstein-Nimzowitsch San
    // Sebastian 1912 » du cahier des charges existe bien mais est une mêlée
    // tactique tranchée par un double aveuglement mutuel, aucun plan à long
    // terme, remplacée après validation utilisateur par le propre « meilleur
    // jeu de sa carrière » de Nimzowitsch), `jh-module-17-calcul-et-intuition-positionnelle`
    // (13, Fischer-Myagmarsuren, Interzonal de Sousse 1967 — partie assignée
    // déjà exacte), `jh-module-18-evaluation-dynamique-contre-statique` (14,
    // Deep Blue-Kasparov, Philadelphie 1996 Partie 1 — couleurs corrigées par
    // rapport au cahier des charges, c'est Deep Blue qui a les Blancs),
    // `jh-module-19-les-cases-de-couleur-au-milieu-de-partie` (14,
    // Karpov-Kasparov, Championnat du Monde Moscou 1985 Partie 16 — partie
    // assignée déjà exacte) et `jh-module-20-le-roi-actif-en-finale` (13,
    // Alekhine-Yates, Londres 1922 — « Short-Timman Tilburg 1991 » du cahier
    // des charges est bien LA fameuse marche de roi mais en plein milieu de
    // partie, pas en finale ; remplacée après validation utilisateur par le
    // contre-exemple « en finale » cité par l'article Wikipédia « King
    // walk » lui-même) remplacent chacune leur unique ligne théorique par une
    // vague réelle — premier tutoriel réel pour ces 5 thèmes (5 à 8
    // CourseSteps chacun), zéro collision de FEN avec le reste du dataset.
    // Enfin Lot 8 (2026-09-12, clôture intégrale du cursus Jesper Hall) :
    // `jh-module-21-jouer-les-structures-fermees` (13, Rubinstein-Nimzowitsch,
    // Berlin 1928 — « Nimzowitsch-Rubinstein Berlin 1928 » du cahier des
    // charges existe bien mais est une partie OUVERTE et tactique, sans
    // rapport avec des structures fermées ; remplacée après validation
    // utilisateur par l'AUTRE partie du même mini-match, couleurs inversées,
    // seule des deux à verrouiller réellement le centre dès 8.d5),
    // `jh-module-22-affronter-le-fianchetto` (14, Botvinnik-Smyslov, Moscou
    // 1954 ronde 16 — partie précise choisie dans le match assigné pour son
    // 9.Ba3! caractéristique), `jh-module-23-le-controle-du-centre` (13,
    // Alekhine-Euwe, Amsterdam 1935 partie 1 — partie précise choisie dans le
    // match assigné, remportée « avec brio » par Alekhine dès la première
    // partie), `jh-module-24-le-zugzwang-positionnel` (14, Sämisch-Nimzowitsch,
    // Copenhague 1923, « The Immortal Zugzwang Game » — partie assignée déjà
    // exacte ; partage sa partie source avec `pm-le-blocus-du-pion-passe`
    // mais aucune des 14 positions ci-dessous ne recoupe les 13 déjà utilisées
    // par ce thème-là) et `jh-module-25-synthese-parties-commentees` (14,
    // Kasparov-Topalov, Wijk aan Zee 1999, « Kasparov's Immortal » — partie
    // assignée déjà exacte) remplacent chacune leur unique ligne théorique par
    // une vague réelle — premier tutoriel réel pour ces 5 derniers thèmes du
    // cursus (5 à 8 CourseSteps chacun), zéro collision de FEN avec le reste
    // du dataset. Le cursus Jesper Hall (25 modules) est désormais intégralement
    // hydraté.
    expect(MASTER_PUZZLES_DATASET).toHaveLength(800);
    const expectedWaveSize: Record<string, number> = {
      "pm-le-mauvais-fou": 8,
      "pm-l-avant-poste-du-cavalier": 8,
      "pm-la-tour-a-la-7e-rangee": 15,
      "pm-la-securite-du-roi-en-milieu-de-partie": 15,
      "pm-la-centralisation-des-pieces": 15,
      "pm-la-chaine-de-pions": 17,
      "pm-la-paire-de-fous": 15,
      "pm-l-avantage-d-espace": 12,
      "pm-le-complexe-de-cases-faibles": 15,
      "pm-les-coups-de-rupture": 12,
      "pm-prophylaxie-anticiper-le-plan-adverse": 15,
      "pm-activite-des-pieces-contre-materiel": 13,
      "pm-evaluer-un-echange-de-pieces": 12,
      "pm-la-restriction-des-pieces-adverses": 13,
      "pm-la-surprotection-nimzowitsch": 14,
      "pm-le-blocus-du-pion-passe": 13,
      "pm-transformer-un-avantage": 13,
      "pm-la-technique-de-simplification": 14,
      "pm-le-complexe-de-cases-de-couleur": 13,
      "pm-le-fou-contre-trois-pions": 13,
      "pm-la-forteresse-defensive": 13,
      "pm-la-superiorite-de-l-aile-dame": 14,
      "pm-cavalier-contre-fou-qui-domine": 13,
      "pm-les-pions-pendants": 15,
      "pm-doubler-les-pions-adverses": 13,
      "pm-le-pion-passe-protege": 14,
      "jh-module-1-structures-de-pions-symetriques": 15,
      "jh-module-2-jouer-contre-l-isolani": 14,
      "jh-module-3-la-structure-carlsbad": 14,
      "jh-module-4-la-structure-maroczy": 14,
      "jh-module-5-le-herisson-hedgehog": 14,
      "jh-module-6-la-chaine-de-pions-en-francais": 14,
      "jh-module-7-structures-a-pions-doubles": 14,
      "jh-module-8-le-roque-oppose-et-l-attaque-de-pions": 14,
      "jh-module-9-la-minorite-d-attaque": 14,
      "jh-module-10-le-sacrifice-positionnel-de-qualite": 14,
      "jh-module-11-les-finales-de-tours-pratiques": 12,
      "jh-module-12-les-finales-de-fous-de-couleurs-opposees": 14,
      "jh-module-13-transition-milieu-de-partie-vers-finale": 14,
      "jh-module-14-l-art-de-la-conversion": 14,
      "jh-module-15-fou-contre-cavalier-mode-d-emploi": 13,
      "jh-module-16-construire-un-plan-a-long-terme": 13,
      "jh-module-17-calcul-et-intuition-positionnelle": 13,
      "jh-module-18-evaluation-dynamique-contre-statique": 14,
      "jh-module-19-les-cases-de-couleur-au-milieu-de-partie": 14,
      "jh-module-20-le-roi-actif-en-finale": 13,
      "jh-module-21-jouer-les-structures-fermees": 13,
      "jh-module-22-affronter-le-fianchetto": 14,
      "jh-module-23-le-controle-du-centre": 13,
      "jh-module-24-le-zugzwang-positionnel": 14,
      "jh-module-25-synthese-parties-commentees": 14,
    };
    for (const [themeId, size] of Object.entries(expectedWaveSize)) {
      const wave = MASTER_PUZZLES_DATASET.filter((p) => p.themeId === themeId);
      expect(wave, themeId).toHaveLength(size);
    }
  });

  it("n'a AUCUNE entrée pour les 44 thèmes `lichess_*` — réservoirs purs, alimentés seulement par le pipeline d'import", () => {
    const datasetIds = new Set(MASTER_PUZZLES_DATASET.map((p) => p.themeId));
    const lichessTagThemeIds = CURRICULUM_THEMES.filter((t) => LICHESS_TAG_CATEGORIES.has(t.category)).map((t) => t.id);
    // 58 tags Lichess officiels → 44 thèmes : 2 doublons volontairement
    // fusionnés (queue d'aronde/d'hirondelle, capture/élimination du
    // défenseur — voir catalog.ts, « Saturation Lichess ») + 12 tags de mat
    // désormais couverts par les thèmes `cm-*` homonymes (purge « thèmes vides
    // ou redondants », feuille de route Zone 1 — voir LICHESS_MATE_THEME_TAGS).
    expect(lichessTagThemeIds.length).toBe(44);
    for (const id of lichessTagThemeIds) expect(datasetIds.has(id)).toBe(false);
  });

  it("n'a aucune FEN dupliquée — 161 positions distinctes, pas de rotation d'une même base", () => {
    const fens = MASTER_PUZZLES_DATASET.map((p) => p.fen);
    expect(new Set(fens).size).toBe(fens.length);
  });

  it.each(MASTER_PUZZLES_DATASET.map((p) => [p.themeId, p] as const))(
    "%s : FEN légale, solution intégralement rejouable, solutionSan cohérent",
    (_themeId, puzzle) => {
      expect(() => new Chess(puzzle.fen)).not.toThrow();
      expect(puzzle.solution.length).toBeGreaterThanOrEqual(1);
      const sans = uciSequenceToSan(puzzle.fen, puzzle.solution);
      expect(sans).toEqual(puzzle.solutionSan);
    },
  );

  it.each(Object.entries(EXPECTED_MATE_PATTERN))(
    "%s : la position finale est un vrai mat, et RECONNUE comme %s par mate-patterns.ts",
    (themeId, pattern) => {
      const puzzle = MASTER_PUZZLES_DATASET.find((p) => p.themeId === themeId);
      expect(puzzle, `${themeId} absent du dataset`).toBeDefined();
      const board = new Chess(puzzle!.fen);
      for (const uci of puzzle!.solution) {
        board.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci.slice(4, 5) || undefined });
      }
      expect(board.isCheckmate(), `${themeId} : la solution ne mate pas`).toBe(true);
      expect(describeMatePatterns(board.fen())).toContain(pattern);
    },
  );
});
