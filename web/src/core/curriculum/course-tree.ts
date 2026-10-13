import { attachEngineSuggestion, parseMoveTree, type ChessMoveNode, type EngineSuggestion } from "@/core/chess/move-tree";
import { AVANT_POSTE_DU_CAVALIER } from "./course-trees/pm-l-avant-poste-du-cavalier";
import { CASE_FAIBLE_DANS_LE_CAMP_ADVERSE } from "./course-trees/pm-la-case-faible-dans-le-camp-adverse";
import { LE_MAUVAIS_FOU } from "./course-trees/pm-le-mauvais-fou";
import { LE_PION_ISOLE_DE_LA_DAME } from "./course-trees/pm-le-pion-isole-de-la-dame";
import { LES_PIONS_PENDANTS } from "./course-trees/pm-les-pions-pendants";
import { CAVALIER_CONTRE_FOU } from "./course-trees/pm-cavalier-contre-fou-qui-domine";
import { DOUBLER_LES_PIONS_ADVERSES } from "./course-trees/pm-doubler-les-pions-adverses";
import { LA_COLONNE_OUVERTE } from "./course-trees/pm-la-colonne-ouverte";
import { LA_TOUR_A_LA_7E_RANGEE } from "./course-trees/pm-la-tour-a-la-7e-rangee";
import { LA_COLONNE_SEMI_OUVERTE } from "./course-trees/pm-la-colonne-semi-ouverte";
import { PROPHYLAXIE } from "./course-trees/pm-prophylaxie-anticiper-le-plan-adverse";
import { L_AVANTAGE_D_ESPACE } from "./course-trees/pm-l-avantage-d-espace";

/**
 * Cours en ARBRE COMPLET façon Lichess Study — cahier des charges du
 * 2026-09-12. Les arbres RAV NATIFS : ceux dont la source publie de vraies
 * variantes. Depuis le 2026-10-09, `CourseTree` est l'unique format
 * d'affichage de l'Académie — les leçons de `course-lesson.ts` et les thèmes
 * sans cours rédigé y sont convertis par `course-tree-adapters.ts` ; ce
 * fichier garde la priorité sur eux. Voir `move-tree-viewer.tsx` pour le
 * rendu, `move-tree.ts` pour le parseur et le type `ChessMoveNode`.
 *
 * ## Pourquoi seulement 5 arbres natifs
 *
 * Un `CourseStep` de `course-lesson.ts` a été aplati À L'ÉCRITURE : les
 * embranchements théoriques réels des parties/études sources n'ont jamais
 * été conservés nulle part. Leur ajouter des variantes qu'aucune source ne
 * fournit serait exactement la fabrication de coups que ce dépôt interdit :
 * la conversion leur donne donc un arbre à une seule branche par chapitre.
 *
 * Les 5 cours ci-dessous (clôture du Palier Or, modules 21-25) sont
 * construits différemment : chaque partie a été retrouvée sous une forme
 * RÉELLEMENT annotée avec de vraies variantes RAV (études Lichess publiques
 * qui reprennent les notes originales des joueurs ou une analyse moteur
 * officielle), pas juste rejouée coup à coup — voir la source citée en tête
 * de chaque `buildXxx()`. Chaque PGN est parsé et vérifié par `chess.js` via
 * `parseMoveTree` (voir `course-tree.test.ts`) : un seul coup illégal fait
 * échouer ce module entier au chargement, jamais un arbre corrompu affiché
 * en silence.
 */

export interface CourseChapterTree {
  title: string;
  root: ChessMoveNode;
}

export interface CourseTree {
  chapters: readonly [CourseChapterTree, ...CourseChapterTree[]];
}

/** Repère de coups (`"<ply>"` ou `"<ply>v<index variante>"`) → nœud, pour poser une `EngineSuggestion` sans dépendre des `id` internes fragiles à un ré-agencement du texte PGN — voir `withEngineSuggestions`. */
function nodeAtSanPath(root: ChessMoveNode, sanPath: readonly string[]): ChessMoveNode {
  let node = root;
  for (const san of sanPath) {
    const next = node.children.find((c) => c.san === san);
    if (!next) throw new Error(`course-tree: chemin SAN introuvable, "${san}" absent des enfants de ${node.id} (${node.children.map((c) => c.san).join(", ")})`);
    node = next;
  }
  return node;
}

function withEngineSuggestions(root: ChessMoveNode, entries: readonly [readonly string[], EngineSuggestion][]): ChessMoveNode {
  for (const [sanPath, suggestion] of entries) {
    const node = nodeAtSanPath(root, sanPath);
    attachEngineSuggestion(root, node.id, suggestion);
  }
  return root;
}

// ---------------------------------------------------------------------------
// Module 21 — Rubinstein – Nimzowitsch, Berlin 1928 (Nimzo-Indienne E32)
// ---------------------------------------------------------------------------
/**
 * Source : étude Lichess https://lichess.org/study/9kND28Fa (chapitre unique,
 * annotateur `achja`) — reprise des notes ORIGINALES de Rubinstein sur sa
 * propre partie (publiées dans « Akiba Rubinstein » de Razuvaev/Murakhveri,
 * Moscou 1980, traduites en anglais par le kibitzer chessgames.com
 * `keypusher`, elles-mêmes reprises et traduites en français ici). Les 3
 * embranchements ci-dessous sont RÉELS, cités dans ces notes — jamais
 * inventés : 13.f4 (Rubinstein explique pourquoi il l'a évité), 22.Bb2?? (la
 * gaffe qu'il signale explicitement), 41.Rxd8?? (le mat perpétuel qu'il note
 * avoir évité).
 */
function buildModule21(): ChessMoveNode {
  const root = parseMoveTree(`
1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. Qc2 { PRO TIP d'ouverture de ce module : dans une structure fermée, aucune pièce ne peut être échangée « pour rien » — chaque camp doit d'abord décider QUELLE aile restera fermée pour toute la partie avant de choisir son plan de manœuvre. } 4... d6 5. e3 c5 6. Bd3 Nc6 7. Ne2 e5
8. d5 { Rubinstein FIXE le centre au lieu d'entretenir la tension. } Bxc3+ 9. Qxc3 { Nimzowitsch cède sa paire de Fous plutôt que de laisser le centre fluide — une chaîne d5-c4 contre c5-e5 verrouillée ainsi désigne pour toute la partie les ailes de chaque camp. } 9... Ne7 10. Qc2 O-O 11. O-O Ng6 12. Ng3 Re8
13. f3 (13. f4 { Prématuré : ouvre la position au profit des pièces noires avant que Blanc n'ait fini de manœuvrer. } exf4 14. exf4 Ng4 { [%csl Gh2][%cal Gg4h2] menace directement ...Nxh2. }) 13... Bd7 14. Bd2 a6 15. h3 b5 16. b3 Qb6 17. Kh2 a5 18. Rab1 b4 { PRO TIP : la patience est elle-même un plan — Rubinstein passe six coups à mettre son roi à l'abri (Kh2) et préparer méthodiquement sa propre avance avant de toucher au centre verrouillé. }
19. f4 { La rupture programmée depuis dix coups de manœuvre patiente : maintenant que le roi est en sécurité, Rubinstein ouvre lui-même la seule aile où son avantage peut s'exprimer. } exf4 20. exf4 Nf8 21. Bc1 Qd8 22. Qf2 (22. Bb2?? { Une gaffe immédiate signalée par Rubinstein lui-même dans ses notes. } Ng4+ 23. hxg4 (23. Kg1 Ne3 { [%csl Gf1,Gc2][%cal Ge3c2,Ge3f1] fourchette Dame/Tour. }) 23... Qh4+ 24. Kg1 Qxg3 { et les Noirs gagnent la Dame blanche. }) 22... a4 23. Bb2 Ng6 24. Rbd1 axb3 25. axb3 Ra7 26. Rde1 Rxe1 27. Rxe1 Nf8
28. Bxf6! { Rubinstein échange précisément le Cavalier noir resté sur sa case de départ depuis le premier coup, qui défendait les cases claires autour du roi. } Qxf6 29. Ne4 Qh6 30. f5 Ra3 31. Rb1 Ra6 32. g4 f6 33. Kg3 Bc8 34. Re1! Bb7 35. Qe2! Nd7
36. Nxd6! { Après vingt coups de manœuvres patientes des deux côtés, la structure autrefois verrouillée cède enfin — au moment et à l'endroit choisis par les Blancs, jamais par accident. } Rxd6 37. Qe8+ Nf8 38. Re7 g6 39. Qf7+ Kh8 40. Re8 Rd8
41. Qxf6+ (41. Rxd8?? Qe3+ { [%csl Gg3][%cal Ge3g3] et les Noirs forcent l'échec perpétuel — Rubinstein note avoir évité ce piège. }) 41... Kg8 42. Qe6+ Kg7 43. f6+ { et les Noirs abandonnent — depuis 8.d5, chaque coup blanc préparait cette case exacte. Jouer une structure fermée, c'est accepter de gagner lentement pour gagner sûrement. }
`);
  return root;
}

// ---------------------------------------------------------------------------
// Module 22 — Botvinnik – Smyslov, Moscou 1954 (16e partie, Est-indienne E60)
// ---------------------------------------------------------------------------
/**
 * Source : étude officielle Lichess « 1954 World Championship: Botvinnik -
 * Smyslov » (https://lichess.org/study/YL4pmkIt), analyse moteur en nuage
 * (`[%eval]`) — les 6 alternatives ci-dessous sont les 6 seules inexactitudes
 * signalées par cette analyse, chacune avec la ligne "meilleure" réelle du
 * moteur (jamais une variante composée à la main) : c'est elle qui alimente
 * les suggestions moteur permanentes (`withEngineSuggestions` plus bas).
 */
function buildModule22(): ChessMoveNode {
  const root = parseMoveTree(`
1. d4 { PRO TIP d'ouverture de ce module : n'affronte JAMAIS un Fou fianchetto en face — vise plutôt la case-clé que son propre camp a dû affaiblir pour l'installer. } Nf6 2. c4 g6 3. g3 Bg7 4. Bg2 O-O 5. Nc3 d6 6. e3 Nbd7 7. Nge2 e5 8. b3 Re8
9. Ba3?! (9. O-O exd4 10. Nxd4 Nc5 11. Qc2 a5 12. Ba3 a4 13. b4 Ne6 14. Nf3 Nf8 15. e4 Be6) 9... Rb8 { L'idée-clé pour affronter un fianchetto : le Fou blanc va lui aussi contrôler la diagonale a3-f8 et immobiliser durablement la case d6, celle que le Fou en g7 ne surveille plus depuis qu'il a quitté sa case d'origine. } { [%csl Rd6][%cal Gc1a3] } 10. O-O a6 11. dxe5 Nxe5 12. c5 dxc5
13. Bxc5 b6?! (13... Bg4 14. Qxd8 Rbxd8 15. Bxb7 Nd3 16. Bd4 c5 17. Bxf6 Bxf6 18. Rab1 Nb4 19. f3 Rxe3 20. fxg4) 14. Qxd8 Rxd8 15. Bd4 Re8
16. e4 Bb7?! (16... Nc6 17. Be3) 17. f4 Neg4?! (17... Nd3 18. Rad1 Nb4 19. Bxf6 Bxf6 20. e5 Bxg2 21. Kxg2 Bg7 22. Rd7 Rbd8 23. Rfd1 Rxd7 24. Rxd7) 18. h3 c5 19. Bxf6 Nxf6 20. e5 Bxg2 21. Kxg2 Nd7 22. Rad1 Nf8 23. Rd6 { La Tour blanche occupe enfin la case ciblée depuis le coup 9. } { [%csl Gd6] } Ne6 24. Ne4 Red8
25. Rfd1 Bf8?! (25... Rxd6 26. Rxd6 Bf8 27. Rc6 Nd8 28. Rc7 Ne6 29. Ra7 b5 30. Rxa6 c4 31. bxc4 bxc4 32. Ra4) 26. Rxd8 Rxd8 27. Rxd8 Nxd8 28. Nf6+ { Le Cavalier blanc fourche depuis la case que la faiblesse chronique de d6/f6 a rendue disponible toute la partie. } Kg7
29. Nd5?! (29. Ne8+ Kg8) 29... b5 30. Nc7 g5 31. Kf3 gxf4 32. gxf4 c4 33. bxc4 bxc4 34. Nxa6 f6 35. Nc7 fxe5 36. fxe5 Kg6 37. Ke4 Kg5 38. a4 Kh4 39. a5 Nc6 40. a6 Kxh3 41. Nb5 c3 42. Nbxc3 Kg4 43. Nd4 Na7 44. Nd5 h5 45. Nf6+ { et les Noirs abandonnent — conclusion technique d'un plan lancé au coup 9. } 1-0
`);
  return withEngineSuggestions(root, [
    [["d4", "Nf6", "c4", "g6", "g3", "Bg7", "Bg2", "O-O", "Nc3", "d6", "e3", "Nbd7", "Nge2", "e5", "b3", "Re8"], { san: "O-O", uci: "e1g1", cp: -15, mate: null }],
    [["d4", "Nf6", "c4", "g6", "g3", "Bg7", "Bg2", "O-O", "Nc3", "d6", "e3", "Nbd7", "Nge2", "e5", "b3", "Re8", "Ba3", "Rb8", "O-O", "a6", "dxe5", "Nxe5", "c5", "dxc5", "Bxc5"], { san: "Bg4", uci: "c8g4", cp: 61, mate: null }],
    [
      ["d4", "Nf6", "c4", "g6", "g3", "Bg7", "Bg2", "O-O", "Nc3", "d6", "e3", "Nbd7", "Nge2", "e5", "b3", "Re8", "Ba3", "Rb8", "O-O", "a6", "dxe5", "Nxe5", "c5", "dxc5", "Bxc5", "b6", "Qxd8", "Rxd8", "Bd4", "Re8", "e4"],
      { san: "Nc6", uci: "e5c6", cp: 100, mate: null },
    ],
    [
      [
        "d4", "Nf6", "c4", "g6", "g3", "Bg7", "Bg2", "O-O", "Nc3", "d6", "e3", "Nbd7", "Nge2", "e5", "b3", "Re8", "Ba3", "Rb8", "O-O", "a6", "dxe5", "Nxe5", "c5", "dxc5", "Bxc5", "b6",
        "Qxd8", "Rxd8", "Bd4", "Re8", "e4", "Bb7", "f4",
      ],
      { san: "Nd3", uci: "e5d3", cp: 137, mate: null },
    ],
    [
      [
        "d4", "Nf6", "c4", "g6", "g3", "Bg7", "Bg2", "O-O", "Nc3", "d6", "e3", "Nbd7", "Nge2", "e5", "b3", "Re8", "Ba3", "Rb8", "O-O", "a6", "dxe5", "Nxe5", "c5", "dxc5", "Bxc5", "b6",
        "Qxd8", "Rxd8", "Bd4", "Re8", "e4", "Bb7", "f4", "Neg4", "h3", "c5", "Bxf6", "Nxf6", "e5", "Bxg2", "Kxg2", "Nd7", "Rad1", "Nf8", "Rd6", "Ne6", "Ne4", "Red8", "Rfd1",
      ],
      { san: "Rxd6", uci: "d8d6", cp: 264, mate: null },
    ],
    [
      [
        "d4", "Nf6", "c4", "g6", "g3", "Bg7", "Bg2", "O-O", "Nc3", "d6", "e3", "Nbd7", "Nge2", "e5", "b3", "Re8", "Ba3", "Rb8", "O-O", "a6", "dxe5", "Nxe5", "c5", "dxc5", "Bxc5", "b6",
        "Qxd8", "Rxd8", "Bd4", "Re8", "e4", "Bb7", "f4", "Neg4", "h3", "c5", "Bxf6", "Nxf6", "e5", "Bxg2", "Kxg2", "Nd7", "Rad1", "Nf8", "Rd6", "Ne6", "Ne4", "Red8", "Rfd1", "Bf8",
        "Rxd8", "Rxd8", "Rxd8", "Nxd8", "Nf6+", "Kg7",
      ],
      { san: "Ne8+", uci: "f6e8", cp: 221, mate: null },
    ],
  ]);
}

// ---------------------------------------------------------------------------
// Module 23 — Alekhine – Euwe, Amsterdam 1935 (1re partie, Slave D17)
// ---------------------------------------------------------------------------
/**
 * Source : étude Lichess « Alekhine - Euwe World Championship Match (1935) »
 * (https://lichess.org/study/tM3dv6wi, chapitre 1, annotateur `Boezem`) —
 * reprend les propres notes d'Alekhine sur cette partie. Les 2 embranchements
 * ci-dessous sont réels (24.Nxd5, 29...gxh6).
 */
function buildModule23(): ChessMoveNode {
  const root = parseMoveTree(`
1. d4 { PRO TIP d'ouverture de ce module : contrôler le centre ne veut pas dire l'occuper avec des pions à tout prix — une case centrale tenue par une pièce bien placée compte autant qu'un pion qui s'y trouve, tant que rien ne peut la déloger. } d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 dxc4 5. a4 Bf5 6. Ne5 Nbd7
7. Nxc4 Qc7 8. g3 e5 { Noir rompt lui-même au centre — la seule façon de contester la suprématie blanche qui s'annonçait. } 9. dxe5 Nxe5 10. Bf4 { Alekhine attaque immédiatement le Cavalier qui vient d'occuper le centre. } Nfd7 11. Bg2 Be6 12. Nxe5 Nxe5
13. O-O { [%cal Gc2c7,Gc3b5,Gd1c2] } Be7 { [%cal Gd1c2] } 14. Qc2 { [%csl Ge5][%cal Gc2c7,Gc3b5] } Rd8 15. Rfd1 O-O 16. Nb5 Rxd1+ 17. Rxd1 { [%csl Ge5] } Qa5 { [%csl Ge5,Gc6] }
18. Nd4 Bc8 19. b4 { Le début spectaculaire d'une attaque de minorité dont le résultat immédiat sera l'obtention de la case d5, extrêmement importante. } { [%csl Gd5] } Qc7 20. b5 c5 { d5 est désormais libre pour les Blancs. } { [%csl Gd5] }
21. Nf5 f6? { Après ce coup, la faiblesse des cases claires sera bientôt fatale. } 22. Ne3 Be6 { On voit ici l'importance qu'a prise d5 : trois attaquants, un seul défenseur. } { [%csl Gd5][%cal Ge3d5] } 23. Bd5 { Le défenseur, Alekhine l'élimine directement. } Bxd5 24. Rxd5 (24. Nxd5 Qd6 25. Nxe7+ Qxe7) 24... Qa5 { Il ne reste plus de défense. }
25. Nf5 Qe1+ 26. Kg2 Bd8 27. Bxe5 fxe5 28. Rd7 Bf6 29. Nh6+ Kh8 (29... gxh6) 30. Qxc5 { 1-0 Les Blancs gagnent. } 1-0
`);
  return root;
}

// ---------------------------------------------------------------------------
// Module 24 — Sämisch – Nimzowitsch, Copenhague 1923 (« l'Immortelle du Zugzwang »)
// ---------------------------------------------------------------------------
/**
 * Source : étude Lichess « Saemisch-Nimzowitsch 1923 Copenaghen annotated »
 * (https://lichess.org/study/jx31GCZA, annotateur `ChessAlekhing98GB_A`,
 * lui-même appuyé sur l'analyse historique de la partie sur chessgames.com) —
 * ARBRE le plus profond des 5 après le module 25 : 9 embranchements réels,
 * dont un imbriqué sur 2 niveaux (13.Nxd5). Le commentaire final (« si Kh2 ou
 * g4, alors R5f3 ») vient des notes ORIGINALES de Nimzowitsch lui-même
 * (Wiener Schachzeitung, 1925) — la seule ligne posthume ajoutée à un jeu
 * déjà terminé (les Blancs ont abandonné sans jouer ces coups), conservée
 * pour montrer CONCRÈTEMENT pourquoi la position est un zugzwang et pas
 * seulement une formule.
 */
function buildModule24(): ChessMoveNode {
  const root = parseMoveTree(`
1. d4 { PRO TIP d'ouverture de ce module : le zugzwang positionnel n'est presque jamais le fruit d'un seul coup spectaculaire — c'est le résultat de dizaines de petits coups qui, un par un, retirent à l'adversaire une case ou une pièce utile. } Nf6 2. c4 e6 3. Nf3 b6 4. g3 Bb7 5. Bg2 Be7 6. Nc3 O-O 7. O-O d5 8. Ne5 c6
9. cxd5?! (9. e4 dxc4) 9... cxd5 10. Bf4 a6 11. Rc1 b5 12. Qb3 Nc6 { Le fantôme, avec des pas silencieux, se dirige vers c4 (Nimzowitsch). }
13. Nxc6 (13. Nxd5 Nxd4 (13... Nxd5 14. Nxc6 Bxc6 15. Rxc6 Nxf4 16. gxf4 Qxd4 17. Rxe6 fxe6 18. Qxe6+ Kh8 19. Bxa8 Rxa8 20. Qxe7 Qxb2 { un pion d'avance pour les Blancs mais structure abîmée, finale probablement nulle. }) 14. Nxe7+ Qxe7 15. Qe3 Nf5) 13... Bxc6 14. h3?! (14. Ne4 dxe4 15. Rxc6 Qxd4 16. Rd1 Qb4 17. Qxb4 Bxb4 18. Bg5 Rfc8 19. Rdc1 Rxc6 20. Rxc6 Bf8) 14... Qd7
15. Kh2?! (15. a3 Rfc8 16. Na2 a5 17. Rc2 Qb7 18. Rfc1 Nd7 19. Qf3 Nb6 20. Nc3 b4 21. Nb1 bxa3) 15... Nh5 (15... Qb7 { L'alternative que Nimzowitsch signale lui-même dans ses notes : « J'aurais pu lui fournir un second fantôme par ...Qb7 et ...Cd7-b6-c4, mais j'ai préféré tourner mon attention vers l'aile Roi. » })
16. Bd2 f5? (16... b4 { [%cal Gc3b1] } 17. Nd1 (17. Nb1 a5 18. a3 Ba4 19. Qf3 Nf6 20. b3 Bc6 21. a4 Ne4 { le Noir obtient un puissant avant-poste pour le Cavalier. }) 17... a5 18. a3 (18. Qe3 Bb5) 18... bxa3 19. bxa3 a4 20. Qa2 Rfb8 (20... Bb5)) 17. Qd1? (17. Nb1) (17. a3 a5 18. Nb1 a4 19. Qf3 { le Blanc tient bon. }) 17... b4 18. Nb1 Bb5
19. Rg1?! (19. a3 a5) 19... Bd6?! (19... a5 20. Bf3 Nf6 21. a3 Rfc8 22. Bf4 Ne4 23. Rxc8+ Rxc8 24. Bxe4 dxe4 25. axb4 axb4 26. Be5) 20. e4?? (20. Bf3 Nf6 21. Bf4 Ne4 22. Kg2 Rac8 23. Bxd6 Qxd6 24. Nd2 a5 25. e3 Rxc1 26. Qxc1 Qa6) 20... fxe4 { Ce sacrifice, qui aurait un effet surprenant, se fonde sur ce calcul froid : deux pions, la 7e traversée, et une aile Dame adverse totalement paralysée, pour une simple pièce ! }
21. Qxh5 Rxf2 22. Qg5?! (22. Be3 Rxb2) 22... Raf8 23. Kh1?! (23. Qh4) 23... R8f5 24. Qe3 Bd3 25. Rce1 h6!! { Un coup magnifique qui annonce le Zugzwang. } 26. Kh2 (26. g4) 26... R5f3 { Nimzowitsch le note lui-même dans ses annotations originales : « si par exemple Kh2 ou g4, alors R5f3 » — les Blancs n'ont plus une seule case sûre, quel que soit le coup d'attente tenté. } 0-1
`);
  return root;
}

// ---------------------------------------------------------------------------
// Module 25 — Kasparov – Topalov, Wijk aan Zee 1999 (« l'Immortelle de Kasparov »)
// ---------------------------------------------------------------------------
/**
 * Source : annotations ORIGINALES de Garry Kasparov lui-même (publiées sur
 * gameknot.com, importées dans l'étude Lichess « Kasparov vs Topalov 1999
 * annotated », https://lichess.org/study/2dSemwq2) — chaque embranchement
 * ci-dessous est une ligne EXPLICITEMENT donnée par Kasparov dans ses propres
 * notes (ou, pour 28.Ra7!, par Lubomir Kavalek, cité et repris par Kasparov
 * lui-même comme objectivement plus fort que son propre 28.Qc3). L'arbre de
 * variantes le plus profond du catalogue — jusqu'à 4 niveaux d'imbrication
 * autour du sacrifice 24.Rxd4!!.
 */
function buildModule25(): ChessMoveNode {
  const root = parseMoveTree(`
1. e4 { PRO TIP d'ouverture de ce module : ce module n'a plus de plan unique à enseigner — c'est une synthèse. Calcul profond, sacrifices en cascade, technique de conversion : tout ce que le cursus a montré séparément, cette seule partie le réunit. } d6 2. d4 Nf6 3. Nc3 g6 4. Be3 Bg7 5. Qd2 c6 6. f3 b5 7. Nge2 Nbd7 8. Bh6 Bxh6 9. Qxh6 Bb7
10. a3 e5 11. O-O-O Qe7 12. Kb1 a6 13. Nc1 O-O-O 14. Nb3 exd4 15. Rxd4 c5 16. Rd1 Nb6
17. g3 (17. a4 b4 18. a5 bxc3 19. axb6 Nd7) (17. Na5 d5 18. Nxb7 Kxb7 19. exd5 Nbxd5 20. Nxd5 Nxd5 21. Bd3 f5 22. Rhe1 Qc7 23. Bf1 c4 { position compliquée aux chances mutuelles. }) 17... Kb8 18. Na5 Ba8 19. Bh3 d5
20. Qf4+ Ka7 21. Rhe1 d4 22. Nd5 (22. Na2 Rhe8) 22... Nbxd5 23. exd5 Qd6
24. Rxd4!! 24... cxd4 { Kasparov : « Topalov aurait été mieux avisé de décliner le sacrifice par Kb6 !, la partie serait alors tombée dans l'oubli. » } (24... Kb6 25. Nb3 Bxd5 (25... cxd4 26. Qxd4+ Kc7 27. Qa7+ Bb7 28. Nc5 Rb8 29. Re7+) 26. Qxd6+ Rxd6 27. Rd2 Rhd8 28. Red1 { et les Blancs gardent l'égalité, sans plus. })
25. Re7+ (25. Qxd4+ Qb6 26. Re7+ Nd7 { et l'attaque blanche s'éteint. }) 25... Kb6 (25... Kb8 26. Qxd4! Nd7 27. Bxd7 Bxd5 28. c4! Qxe7 29. Qb6+ Ka8 30. Qxa6+ Kb8 31. Qb6+ Ka8 32. Bc6+ Bxc6 33. Nxc6 { les Noirs perdent par force. })
26. Qxd4+ Kxa5 (26... Qc5 27. Qxf6+ Qd6 28. Be6 Bxd5 (28... Rhe8 29. b4!) 29. b4! Ba8 30. Qxf7 Qd1+ 31. Kb2 Qxf3 32. Bf5 { menaces de mat inévitables. }) 27. b4+ Ka4
28. Qc3 (28. Ra7! { Trouvé par Lubomir Kavalek — objectivement plus fort que le 28.Qc3 réellement joué, mais la beauté de la combinaison n'en est pas moindre (Kasparov). } Bb7 (28... Nxd5 29. Rxa6+! Qxa6 30. Qb2 Nc3+ 31. Qxc3 Bd5 32. Kb2) (28... Bxd5 29. Qc3 Rhe8 30. Kb2 Re2 31. Qc7! Qxc7 32. Rxa6+) 29. Rxb7 Qxd5) 28... Qxd5 (28... Bxd5 29. Kb2 { et mat est inévitable. })
29. Ra7 Bb7 30. Rxb7 (30. Qc7 Qd1+ 31. Kb2 Qd4+ 32. Kb1) 30... Qc4 (30... Rhe8 31. Rb6 Ra8 32. Bf1!! (32. Be6 Rxe6 33. Rxe6 Qc4 34. Qxc4 bxc4 35. Rxf6 Kxa3 36. Rxf7 Re8 { les Noirs gardent de bonnes chances. }))
31. Qxf6 Kxa3 (31... Rd1+ 32. Kb2 Ra8 33. Qb6! Qd4+ (33... a5 34. Bd7) 34. Qxd4 Rxd4 35. Rxf7 (35. Bd7 Rd2 36. Bc6 f5 37. Rb6 Ra7 38. Be8 Rd4 39. f4 Rc4 40. Bf7 Rxb4+ 41. axb4 Rxf7 42. c3 Ra7 43. Re6 a5 44. Re1) 35... a5 36. Be6 axb4 37. Bb3+ Ka5 38. axb4+ Kb6 (38... Rxb4 39. c3) 39. Rxh7 Rc8 40. h4) 32. Qxa6+ Kxb4 33. c3+ Kxc3 34. Qa1+ Kd2 (34... Kb4 35. Qb2+ Ka5 36. Qa3+ Qa4 37. Ra7+)
35. Qb2+ Kd1 (35... Ke3 36. Re7+ Kxf3 37. Qg2#) 36. Bf1!! Rd2 (36... Qxf1 37. Qc2+ Ke1 38. Re7+) (36... Qc5 37. Qe2#) (36... Qe6 37. Qc1#)
37. Rd7! (37. Qxh8 Qa2#) (37. Bxc4 Rxb2+ 38. Kxb2 bxc4 39. Kc3) 37... Rxd7 38. Bxc4 bxc4
39. Qxh8 Rd3 40. Qa8 c3 41. Qa4+ Ke1 42. f4 f5 43. Kc1 Rd2 44. Qa7 { Topalov abandonne. } 1-0
`);
  return root;
}

export const COURSE_TREES: Record<string, CourseTree> = {
  // Refonte « un commentaire par coup » (2026-10-09) — voir `course-trees/`.
  "pm-l-avant-poste-du-cavalier": AVANT_POSTE_DU_CAVALIER,
  "pm-la-case-faible-dans-le-camp-adverse": CASE_FAIBLE_DANS_LE_CAMP_ADVERSE,
  "pm-les-pions-pendants": LES_PIONS_PENDANTS,
  "pm-cavalier-contre-fou-qui-domine": CAVALIER_CONTRE_FOU,
  "pm-le-mauvais-fou": LE_MAUVAIS_FOU,
  "pm-le-pion-isole-de-la-dame": LE_PION_ISOLE_DE_LA_DAME,
  "pm-doubler-les-pions-adverses": DOUBLER_LES_PIONS_ADVERSES,
  "pm-la-colonne-ouverte": LA_COLONNE_OUVERTE,
  "pm-la-colonne-semi-ouverte": LA_COLONNE_SEMI_OUVERTE,
  "pm-la-tour-a-la-7e-rangee": LA_TOUR_A_LA_7E_RANGEE,
  "pm-prophylaxie-anticiper-le-plan-adverse": PROPHYLAXIE,
  "pm-l-avantage-d-espace": L_AVANTAGE_D_ESPACE,
  "jh-module-21-jouer-les-structures-fermees": { chapters: [{ title: "Rubinstein – Nimzowitsch, Berlin 1928", root: buildModule21() }] },
  "jh-module-22-affronter-le-fianchetto": { chapters: [{ title: "Botvinnik – Smyslov, Moscou 1954 (16e partie)", root: buildModule22() }] },
  "jh-module-23-le-controle-du-centre": { chapters: [{ title: "Alekhine – Euwe, Amsterdam 1935 (1re partie)", root: buildModule23() }] },
  "jh-module-24-le-zugzwang-positionnel": { chapters: [{ title: "Sämisch – Nimzowitsch, Copenhague 1923 — « l'Immortelle du Zugzwang »", root: buildModule24() }] },
  "jh-module-25-synthese-parties-commentees": { chapters: [{ title: "Kasparov – Topalov, Wijk aan Zee 1999 — « l'Immortelle de Kasparov »", root: buildModule25() }] },
};
