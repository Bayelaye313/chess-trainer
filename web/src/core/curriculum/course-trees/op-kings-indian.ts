import { parseMoveTree } from "@/core/chess/move-tree";
import type { CourseChapterTree, CourseTree } from "../course-tree";

/**
 * Cours d'ouverture « Défense Est-Indienne (avec les Noirs) » : 1.d4 Nf6
 * 2.c4 g6 3.Nc3 Bg7 4.e4 d6 — onglet Ouvertures, format « un commentaire par
 * coup » de l'Académie, lu par `CourseTreeViewer` (route
 * `/ouvertures/kings-indian/cours`). Public visé : 1500-1800 Elo, joueur
 * tactique qui a besoin de plans stricts.
 *
 * ## Contenu (2026-10-12)
 *
 * 1. Fiche d'identité et Variante Classique 5.Nf3 O-O 6.Be2 e5 7.O-O Nc6
 *    8.d5 Ne7 9.Ne1 Nd7 10.Nd3 f5 11.Bd2 f4 12.f3 g5 jusqu'au coup 15, avec
 *    11.f3 (le coup principal) et le piège 13.c5? Nxc5.
 * 2. Attaque Bayonnette 9.b4 Nh5 10.Re1 f5 11.Ng5 Nf6 12.Bf3 c6 jusqu'à
 *    18...d5 (Xu Jun-Ponomariov 2000, environ +0.2), avec 12.f3 Kh8.
 * 3. Variante d'Échange 7.dxe5 dxe5 8.Qxd8 Rxd8 (0.00) : 9.Bg5 Re8, 9.Be3 Nc6
 *    10.O-O Nd4 (la case d4) et le coup de club 9.Nxe5? Nxe4.
 * 4. Anti-panique : Sämisch 5.f3 O-O 6.Be3 c5! (et 6...e5) puis Quatre
 *    Pions 5.f4 O-O 6.Nf3 c5 7.d5 e6 8.Be2 exd5 9.cxd5 Re8.
 * 5. Aléatoire surprise : 13.h3 et 14.a3 (deux coups de pion mous) punis
 *    par ...Nf6, ...h5 et le levier ...g4 (8 coups après la faute).
 *
 * Indices progressifs : chaque faute blanche porte trois balises `[%hint]`
 * (1. principe violé, 2. zone faible, 3. levier de pion) et une balise
 * `[%hintcsl]` (cases allumées à partir du 2e indice).
 *
 * Sources : Andrew Martin, « Classical King's Indian E90-E99 » (ChessPub
 * 2002, `docs/`, couche texte) pour les lignes 9.Ne1 et 9.b4 ; Anatoli
 * Vaisser, « Beating the King's Indian and Benoni » (Batsford 1997, `docs/`)
 * pour la ligne principale des Quatre Pions 9...Re8. Toutes les lignes sont
 * arbitrées par Stockfish 18 natif (profondeur 16) ; le moteur a nuancé le
 * cahier des charges : 6...c5 est meilleur que 6...e5 contre la Sämisch
 * (+0.4 contre +0.9), et le levier ...g4 n'est bon qu'APRÈS ...h5 et
 * ...Nf6 (poussé trop tôt, il ne donne rien). Toute la prose est originale.
 *
 * ## Architecture technique des nœuds
 *
 * Voir `op-scotch-game.ts` : `evaluationScore` / `evaluationMate` (balise
 * `[%eval]`), `showEvalBar`, `freeze` (balise `[%txt "…"]` sur CHAQUE
 * commentaire), plus `hints` / `hintHighlights`.
 *
 * Fichier GÉNÉRÉ : ne pas l'éditer à la main. Source commentée :
 * `scripts/opening-course-src/kings-indian.pgn` (et l'en-tête
 * `kings-indian.header.txt`) ; regénérer avec
 * `node --import tsx scripts/_tmp-build-opening-course.mts <source> <en-tête> <sortie> 16 [pgn compilé]`.
 * Règles de l'utilisateur : SAN en texte brut uniquement (jamais de figurine
 * Unicode), pas de guillemet droit dans un `[%txt]` ni un `[%hint]`.
 */

function chapter(title: string, pgn: string): CourseChapterTree {
  return { title, root: parseMoveTree(pgn, START) };
}

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const OP_KINGS_INDIAN: CourseTree = {
  chapters: [
    chapter(
      "Fiche d'identité, tronc commun et Variante Classique : la tempête de pions",
      `{ [%txt "LA DÉFENSE EST-INDIENNE, AVEC LES NOIRS.

Le vrai enjeu : on laisse les Blancs prendre le centre avec c4, d4 et e4, on met le roi à l'abri derrière le fou g7, puis on frappe le centre avec ...e5. Quand les Blancs ferment par d5, le centre est BLOQUÉ et la partie devient une course : les Blancs attaquent à l'aile dame, nous attaquons le roi.

Les deux plans à connaître par coeur :
- Plan blanc : la poussée c4-c5 (préparée par b4 ou Nd3), pour ouvrir la colonne c et frapper notre pion d6.
- Plan noir : ...Ne7, ...Nd7 (ou ...Ne8), puis ...f5, ...f4, ...g5 et ...g4. Le pion f4 enferme le fou blanc des cases noires, le pion g4 ouvre la route du roi blanc.

La règle d'or du joueur de club : à l'aile dame, on ne défend pas, on CONTRE-ATTAQUE plus vite. Chaque coup noir à l'aile dame est un coup de moins pour l'attaque.

Honnêteté moteur : l'Est-Indienne ne réfute rien. Stockfish 18 donne aux Blancs environ +0.6 dans la ligne principale, un peu plus que dans les défenses classiques. C'est le prix d'une position déséquilibrée où celui qui connaît son plan gagne souvent avant le moteur.

Les structures types (relevées sur la position finale de chaque chapitre) :
- Classique fermée (chapitres 1, 2 et 5) : Blancs b4-c5-d5-e4-f3 contre Noirs c7-d6-e5-f4-g5 ; deux chaînes en sens opposé, chacun attaque à la base de la chaîne adverse.
- Échange (chapitre 3) : colonne d ouverte, pions e4 contre e5 ; la case d4 est un trou pour nos pièces.
- Anti-panique (chapitre 4) : on frappe le centre blanc avec ...c5 avant qu'il soit soutenu."] [%eval 0.39] }
1. d4 { [%txt "Les Blancs occupent le centre avec le pion dame."] [%eval 0.33] }
1... Nf6 { [%txt "Le cavalier contrôle e4 et ne s'engage encore sur aucune structure."] [%eval 0.29] [%cal Gf6e4,Gf6d5] }
2. c4 { [%txt "Les Blancs prennent de l'espace et visent d5."] [%eval 0.32] }
2... g6 { [%txt "On prépare le fianchetto : le fou ira en g7, sur la grande diagonale."] [%eval 0.47] [%cal Gf8g7] }
3. Nc3 { [%txt "Le cavalier prépare e4."] [%eval 0.43] }
3... Bg7 { [%txt "Le fou g7 est la pièce la plus importante de l'Est-Indienne : il vise d4 et toute la diagonale a1-h8."] [%eval 0.56] [%csl Gg7] [%cal Gg7a1] }
4. e4 { [%txt "Les Blancs construisent le grand centre c4-d4-e4."] [%eval 0.55] }
4... d6 { [%txt "On contrôle e5 et on prépare ...e5. On ne se bat pas pour e4 : on va frapper la base d4."] [%eval 0.60] [%csl Gd6,Ge5] [%cal Gd6e5] }
5. Nf3 { [%txt "La Variante Classique : développement naturel, le cavalier contrôle e5 et d4."] [%eval 0.58] }
5... O-O { [%txt "Le roi à l'abri avant de toucher au centre."] [%eval 0.56] [%csl Gg8] }
6. Be2 { [%txt "Développement sobre, les Blancs préparent leur propre roque."] [%eval 0.61] }
6... e5 { [%txt "LE COUP DE L'EST-INDIENNE : on frappe d4. Les Blancs doivent choisir : fermer (d5), échanger (dxe5, chapitre 3) ou maintenir."] [%eval 0.62] [%csl Ge5,Rd4] [%cal Ge5d4] }
7. O-O { [%txt "Les Blancs roquent et maintiennent la tension."] [%eval 0.69] }
7... Nc6 { [%txt "On ajoute une troisième pression sur d4 : les Blancs sont obligés de se décider. Le moteur préfère légèrement 7...Na6, mais 7...Nc6 donne les plans les plus clairs."] [%eval 0.76] [%cal Gc6d4,Ge5d4] }
8. d5 { [%txt "Les Blancs ferment le centre avec gain de temps sur le cavalier. À partir d'ici, plus aucun pion central ne s'échangera vite : c'est une course d'ailes."] [%eval 0.72] [%csl Gd5] }
8... Ne7 { [%txt "Le cavalier recule vers l'aile roi : il soutiendra ...f5 et pourra aller en g6."] [%eval 0.66] [%cal Ge7g6,Gf7f5] }
9. Ne1 { [%txt "L'ancienne ligne principale (Mar del Plata) : le cavalier va en d3 pour soutenir c5, et il libère le pion f pour f3. La Bayonnette 9.b4 est au chapitre 2."] [%eval 0.68] [%cal Ge1d3] }
9... Nd7 { [%txt "Le cavalier f6 libère le pion f. Tout notre plan commence par ...f5."] [%eval 0.75] [%cal Gf7f5] }
10. Nd3 { [%txt "Le cavalier vise c5 et protège e5... et f4."] [%eval 0.68] [%cal Gd3c5] }
10... f5 { [%txt "LA PREMIÈRE VAGUE : on attaque e4, base de la chaîne blanche."] [%eval 0.72] [%csl Gf5,Re4] [%cal Gf5e4] }
11. Bd2 { [%txt "Un coup de développement : le fou soutiendra b4 et ira en e1 défendre l'aile roi."] [%eval 0.28] }
(11. f3 { [%txt "Le coup le plus fréquent et le préféré du moteur : les Blancs soutiennent e4 tout de suite."] [%eval 0.76] }
  11... f4 { [%txt "On ferme : le fou c1 n'a plus la diagonale c1-h6."] [%eval 0.77] [%csl Gf4] }
  12. Bd2 { [%txt "Le fou se développe."] [%eval 0.50] }
  12... g5 { [%txt "Même position que la ligne principale par une autre route."] [%eval 0.56] [%csl Gg5] [%cal Gg5g4] })
11... f4 { [%txt "LA DEUXIÈME VAGUE : on ferme l'aile roi. Le pion f4 coupe le fou d2 de l'aile roi et prépare ...g5-g4. Le moteur préfère 11...fxe4 (+0.3), mais 11...f4 est le plan de la tempête, tout aussi jouable (+0.55)."] [%eval 0.61] [%csl Gf4] [%cal Gg7g5,Gg5g4] }
12. f3 { [%txt "Les Blancs bloquent : le pion f3 empêchera ...f3 et soutient e4. Il deviendra aussi la cible de ...g4."] [%eval 0.56] [%csl Rf3] }
12... g5 { [%txt "LA TROISIÈME VAGUE : g5 prépare ...g4 pour ouvrir la colonne g contre le roi blanc."] [%eval 0.56] [%csl Gg5] [%cal Gg5g4,Rg4f3] }
13. b4 { [%txt "Le plan blanc : b4 prépare c5 pour ouvrir la colonne c."] [%eval 0.58] [%cal Gb4c5] }
(13. c5 { [%txt "Trop pressé : les Blancs oublient que le pion c5 n'est soutenu que par le cavalier d3."] [%hint "Les Blancs poussent c5 avant de l'avoir préparé par b4."] [%hint "Le pion c5 : attaqué par le cavalier d7 et le pion d6, défendu par le seul cavalier d3."] [%hint "Nxc5 ! On prend le pion : la poussée blanche n'a rien ouvert."] [%hintcsl Rc5] [%eval -0.29] }
  13... Nxc5 { [%txt "On prend gratuitement."] [%eval -0.28] [%csl Gc5] [%cal Gd7c5] }
  14. Nxc5 { [%txt "Les Blancs récupèrent avec le cavalier."] [%eval -0.17] }
  14... dxc5 { [%txt "Reprise : un pion de plus pour les Noirs, environ -0.2. Retenir : la poussée c5 n'est dangereuse que préparée par b4."] [%eval -0.25] [%csl Gc5] })
13... Nf6 { [%txt "Le cavalier revient : il attaque e4 et prépare ...h5 et ...g4."] [%eval 0.58] [%cal Gf6e4,Gh7h5] }
14. c5 { [%txt "La poussée c5 est lancée : les Blancs menacent cxd6 et Nb5 vers c7."] [%eval 0.47] [%cal Gc5d6,Rc3b5] }
14... Ng6 { [%txt "Le deuxième cavalier rejoint l'attaque : g6 soutient ...h5-h4 et ...g4."] [%eval 0.55] [%cal Gg6h4,Gg5g4] }
15. Rc1 { [%txt "La tour se place sur la future colonne c ouverte."] [%eval 0.31] }
15... Rf7 { [%txt "RETENIR (

PRO TIP : la tour f7 défend c7 (la case d'invasion blanche) et pourra aller en g7 ou h7 pour soutenir ...g4. Position autour de +0.3 : les Blancs avancent à l'aile dame, nous avons le temps de préparer ...h5 et ...g4. Ne jamais répondre aux pions blancs à l'aile dame : compter les coups et attaquer."] [%eval 0.30] [%csl Gc7] [%cal Gf7g7,Gg5g4] } *`,
    ),
    chapter(
      "L'Attaque Bayonnette 9.b4 : la ligne moderne de club",
      `{ [%txt "L'ATTAQUE BAYONNETTE.

Au lieu de 9.Ne1, les Blancs poussent tout de suite b4 : ils gagnent un temps pour c5 et menacent d'ouvrir l'aile dame avant que notre attaque arrive.

Notre réponse : 9...Nh5 ! Le cavalier libère le pion f, regarde la case f4 et accélère ...f5. Les Blancs répondent par 10.Re1 (la découverte de Kramnik), qui libère f1 pour le fou e2 et défend e4.

Honnêteté moteur : Stockfish 18 préfère légèrement 9...a5 (+0.6), mais 9...Nh5 est dans l'esprit de l'Est-Indienne et la ligne finit en quasi-égalité (environ +0.2)."] [%eval 0.39] }
1. d4 { [%txt "Le pion dame."] [%eval 0.33] }
1... Nf6 { [%txt "Le cavalier."] [%eval 0.29] [%cal Gf6e4] }
2. c4 { [%txt "L'espace."] [%eval 0.32] }
2... g6 { [%txt "Fianchetto."] [%eval 0.47] [%cal Gf8g7] }
3. Nc3 { [%txt "Le cavalier dame."] [%eval 0.43] }
3... Bg7 { [%txt "Le fou sur la grande diagonale."] [%eval 0.56] [%csl Gg7] }
4. e4 { [%txt "Le grand centre."] [%eval 0.55] }
4... d6 { [%txt "Le contrôle de e5."] [%eval 0.60] [%csl Ge5] }
5. Nf3 { [%txt "La Classique."] [%eval 0.58] }
5... O-O { [%txt "Le roque."] [%eval 0.56] [%csl Gg8] }
6. Be2 { [%txt "Développement."] [%eval 0.61] }
6... e5 { [%txt "La frappe sur d4."] [%eval 0.62] [%cal Ge5d4] }
7. O-O { [%txt "Le roque blanc."] [%eval 0.69] }
7... Nc6 { [%txt "Pression sur d4."] [%eval 0.76] [%cal Gc6d4] }
8. d5 { [%txt "La fermeture."] [%eval 0.72] [%csl Gd5] }
8... Ne7 { [%txt "Le cavalier vers l'aile roi."] [%eval 0.66] [%cal Ge7g6] }
9. b4 { [%txt "LA BAYONNETTE : les Blancs prennent l'espace à l'aile dame tout de suite, pour c5 au coup suivant."] [%eval 0.67] [%cal Gb4c5,Gc4c5] }
9... Nh5 { [%txt "Le cavalier libère le pion f et vise f4 : la poussée ...f5 arrive un coup plus tôt qu'avec ...Nd7."] [%eval 0.73] [%cal Gh5f4,Gf7f5] }
10. Re1 { [%txt "L'idée de Kramnik : la tour défend e4 et libère f1, d'où le fou e2 protégera g2 contre ...Nf4."] [%eval 0.79] [%cal Ge1e4] }
10... f5 { [%txt "On attaque e4 tout de suite."] [%eval 0.76] [%csl Gf5,Re4] [%cal Gf5e4] }
11. Ng5 { [%txt "Le cavalier bondit vers e6, la case faible créée par ...f5."] [%eval 0.54] [%csl Re6] [%cal Rg5e6] }
11... Nf6 { [%txt "Le cavalier revient défendre : il défend h7 et attaque e4. La case e6 reste le point à surveiller."] [%eval 0.64] [%cal Gf6e4,Gf6h7] }
12. Bf3 { [%txt "Le fou renforce e4 et la diagonale vers h5."] [%eval 0.50] }
(12. f3 { [%txt "Le coup le plus sûr pour les Blancs (+0.6) : e4 est consolidé."] [%eval 0.53] }
  12... Kh8 { [%txt "Le roi quitte la diagonale g1-a7 et la case g8 sera libre pour un cavalier ou une tour. Plan : ...Nh5 et ...f4 plus tard."] [%eval 0.56] [%csl Gh8] [%cal Gf5f4] })
12... c6 { [%txt "On ouvre une deuxième front : la colonne c, pour que les Blancs ne soient pas seuls à l'aile dame."] [%eval 0.36] [%csl Gc6] [%cal Gc6d5] }
13. Be3 { [%txt "Le fou se développe et vise a7 et c5."] [%eval 0.26] }
13... cxd5 { [%txt "On ouvre la colonne c."] [%eval 0.57] [%cal Gc8c1] }
14. cxd5 { [%txt "Les Blancs reprennent avec le pion c : le pion d5 reste solide."] [%eval 0.21] }
14... h6 { [%txt "On chasse le cavalier g5 : il doit choisir tout de suite."] [%eval 0.24] [%cal Gh6g5] }
15. Ne6 { [%txt "Le cavalier s'installe en e6, attaque la dame et la tour f8."] [%eval 0.23] [%csl Re6] [%cal Re6d8,Re6f8] }
15... Bxe6 { [%txt "On échange le cavalier gênant contre le fou c8 : le pion e6 sera isolé."] [%eval 0.23] [%cal Gc8e6] }
16. dxe6 { [%txt "Le pion e6 est avancé mais coupé de sa chaîne."] [%eval 0.18] [%csl Re6] }
16... fxe4 { [%txt "On ouvre la colonne f et on élimine un pion central."] [%eval 0.26] [%cal Gf5e4,Gf8f3] }
17. Nxe4 { [%txt "Les Blancs reprennent."] [%eval 0.16] }
17... Nxe4 { [%txt "On échange les pièces."] [%eval 0.18] [%cal Gf6e4] }
18. Bxe4 { [%txt "Le fou reprend."] [%eval 0.11] }
18... d5 { [%txt "RETENIR (

PRO TIP : on reprend le centre avec gain de temps sur le fou e4 (Xu Jun-Ponomariov 2000). Quasi-égalité (environ +0.2) : le pion e6 isolé compense tout juste le centre noir. Contre la Bayonnette, la règle : ...Nh5, ...f5, puis ouvrir la colonne c par ...c6 pour ne pas subir."] [%eval 0.18] [%csl Gd5,Re6] [%cal Gd5e4] } *`,
    ),
    chapter(
      "La Variante d'Échange : 7.dxe5, une finale égale mais vivante",
      `{ [%txt "LA VARIANTE D'ÉCHANGE.

Très fréquente à 1500 Elo : les Blancs ont peur de l'attaque noire et échangent les dames dès le coup 8. Beaucoup de joueurs noirs croient alors la partie nulle et morte. C'est faux : la finale est égale (0.00 au moteur), mais elle reste dynamique.

Nos atouts dans cette finale :
- La case d4 : aucun pion blanc ne peut plus la chasser (plus de pion d, le pion c4 et le pion e4 ne la couvrent pas). Un cavalier noir en d4 y sera intouchable.
- Le fou g7 : rien ne l'obstrue après ...c6 et un futur ...Bf8 ou ...Bh6, et il pèse sur la grande diagonale.
- Le roi : sans les dames, il n'y a plus de danger, il se centralise en f8 ou e7.

Le piège à éviter : se précipiter sur le pion e5 de façon naïve (voir 9.Nxe5 Nxe4)."] [%eval 0.39] }
1. d4 { [%txt "Le pion dame."] [%eval 0.33] }
1... Nf6 { [%txt "Le cavalier."] [%eval 0.29] [%cal Gf6e4] }
2. c4 { [%txt "L'espace."] [%eval 0.32] }
2... g6 { [%txt "Fianchetto."] [%eval 0.47] [%cal Gf8g7] }
3. Nc3 { [%txt "Le cavalier dame."] [%eval 0.43] }
3... Bg7 { [%txt "La grande diagonale."] [%eval 0.56] [%csl Gg7] }
4. e4 { [%txt "Le grand centre."] [%eval 0.55] }
4... d6 { [%txt "Le contrôle de e5."] [%eval 0.60] [%csl Ge5] }
5. Nf3 { [%txt "La Classique."] [%eval 0.58] }
5... O-O { [%txt "Le roque."] [%eval 0.56] [%csl Gg8] }
6. Be2 { [%txt "Développement."] [%eval 0.61] }
6... e5 { [%txt "La frappe sur d4."] [%eval 0.62] [%cal Ge5d4] }
7. dxe5 { [%txt "L'ÉCHANGE : les Blancs liquident la tension. Le moteur le juge déjà moins bon pour eux (+0.1 contre +0.6 après 7.O-O)."] [%eval 0.10] [%cal Gd4e5] }
7... dxe5 { [%txt "Reprise obligatoire : la colonne d s'ouvre."] [%eval 0.04] [%csl Ge5,Gd4] }
8. Qxd8 { [%txt "Les Blancs échangent les dames."] [%eval 0.00] }
8... Rxd8 { [%txt "La tour reprend et occupe la colonne d. Égalité : 0.00."] [%eval 0.00] [%cal Gd8d1] }
9. Bg5 { [%txt "Le coup le plus piquant : le fou cloue le cavalier f6 contre la tour d8 et menace Nd5."] [%eval 0.02] [%cal Rg5f6,Rf6d8] }
(9. Nxe5 { [%txt "Le coup de club naïf : les Blancs prennent le pion e5."] [%hint "Les Blancs prennent un pion alors que leur propre pion e4 n'est défendu que par le cavalier c3."] [%hint "Le pion e4 : attaqué par le cavalier f6 et défendu une seule fois."] [%hint "Nxe4 ! On rend le pion tout de suite, et la grande diagonale du fou g7 s'ouvre sur e5 et b2."] [%hintcsl Re4] [%eval -0.04] }
  9... Nxe4 { [%txt "On récupère le pion."] [%eval -0.03] [%cal Gf6e4] }
  10. Nxe4 { [%txt "Les Blancs échangent."] [%eval -0.07] }
  10... Bxe5 { [%txt "Le fou g7 reprend et vise b2 : égalité, et c'est plutôt aux Blancs de faire attention à leur pion b2."] [%eval -0.03] [%csl Rb2] [%cal Ge5b2] })
(9. Be3 { [%txt "Le coup que le moteur préfère (0.00) : le fou surveille d4 et c5."] [%eval 0.03] }
  9... Nc6 { [%txt "Le cavalier vise directement la case d4."] [%eval -0.15] [%csl Gd4] [%cal Gc6d4] }
  10. O-O { [%txt "Les Blancs roquent sans se soucier de d4."] [%eval -0.29] }
  10... Nd4 { [%txt "Le cavalier s'installe en d4, menace Nxe2+ et l'échange du fou e2."] [%eval -0.30] [%csl Gd4] [%cal Gd4e2,Gd4f3] }
  11. Nxd4 { [%txt "Les Blancs échangent pour chasser le cavalier."] [%eval -0.29] }
  11... exd4 { [%txt "RETENIR : la reprise ouvre la grande diagonale du fou g7 et le pion d4 gêne le cavalier c3 et le fou e3. Environ -0.2, les Noirs sont déjà un peu mieux."] [%eval -0.24] [%csl Gd4] [%cal Gg7b2,Gd4c3] })
9... Re8 { [%txt "La tour reste sur la grande colonne et défend e5, et le clouage disparaît."] [%eval 0.06] [%cal Ge8e5] }
10. Nd5 { [%txt "Le cavalier s'installe au centre et attaque c7 et f6."] [%eval 0.05] [%cal Rd5c7] }
10... Nxd5 { [%txt "On échange ce cavalier gênant."] [%eval 0.00] [%cal Gf6d5] }
11. cxd5 { [%txt "Les Blancs reprennent : le pion d5 est avancé."] [%eval -0.02] }
11... c6 { [%txt "On attaque d5 tout de suite : sans pion c, le pion d5 sera isolé."] [%eval -0.01] [%cal Gc6d5] }
12. Bc4 { [%txt "Le fou défend d5."] [%eval 0.01] }
12... cxd5 { [%txt "On échange."] [%eval -0.03] [%cal Gc6d5] }
13. Bxd5 { [%txt "Le fou reprend et occupe le centre."] [%eval -0.03] }
13... Nd7 { [%txt "RETENIR (

PRO TIP : le cavalier va en c5 (cible e4) ou en f6 ; le fou g7 n'a plus d'obstacle sur sa diagonale. Égalité (0.00), mais les Noirs jouent avec plaisir : le pion e4 est fixé, nos pièces ont des cases. Dans la finale d'Échange, on joue pour la case d4 et pour le fou g7, jamais pour la nulle."] [%eval 0.00] [%csl Gg7] [%cal Gd7c5,Gc5e4] } *`,
    ),
    chapter(
      "Anti-panique : la Sämisch 5.f3 et l'Attaque des Quatre Pions 5.f4",
      `{ [%txt "ANTI-PANIQUE : QUAND LES BLANCS PRENNENT TOUT LE CENTRE.

Deux systèmes font peur au joueur de l'Est-Indienne :
- La Sämisch 5.f3 : les Blancs soutiennent e4 par f3, puis jouent Be3, Qd2 et souvent O-O-O avec g4 et h4 contre notre roi. Le prix : le cavalier g1 n'a plus la case f3 et se développe lentement (Nge2).
- Les Quatre Pions 5.f4 : quatre pions au centre (c4, d4, e4, f4). Impressionnant, mais personne ne les soutient encore.

La règle unique pour les deux : frapper le centre avec ...c5 AVANT que les Blancs aient fini leur développement. Un centre non soutenu explose."] [%eval 0.39] }
1. d4 { [%txt "Le pion dame."] [%eval 0.33] }
1... Nf6 { [%txt "Le cavalier."] [%eval 0.29] [%cal Gf6e4] }
2. c4 { [%txt "L'espace."] [%eval 0.32] }
2... g6 { [%txt "Fianchetto."] [%eval 0.47] [%cal Gf8g7] }
3. Nc3 { [%txt "Le cavalier dame."] [%eval 0.43] }
3... Bg7 { [%txt "La grande diagonale."] [%eval 0.56] [%csl Gg7] }
4. e4 { [%txt "Le grand centre."] [%eval 0.55] }
4... d6 { [%txt "Le contrôle de e5."] [%eval 0.60] [%csl Ge5] }
5. f3 { [%txt "LA SÄMISCH : f3 soutient e4 et prépare Be3, Qd2 et g4. Le défaut : le cavalier g1 n'a plus f3."] [%eval 0.33] [%csl Rg1,Gf3] }
(5. f4 { [%txt "LES QUATRE PIONS : les Blancs prennent tout le centre. Aucune pièce ne soutient ces pions : on va les attaquer."] [%eval 0.25] [%csl Rc4,Rd4,Re4,Rf4] }
  5... O-O { [%txt "Le roque d'abord : on ne frappe pas le centre avec le roi au milieu."] [%eval 0.33] [%csl Gg8] }
  6. Nf3 { [%txt "Le cavalier soutient d4."] [%eval 0.25] }
  6... c5 { [%txt "LE LEVIER : on attaque d4, la base du centre. Si les Blancs avancent d5, la case e5 et la diagonale du fou g7 nous appartiennent."] [%eval 0.31] [%csl Gc5,Rd4] [%cal Gc5d4] }
  7. d5 { [%txt "Les Blancs avancent."] [%eval 0.31] }
  (7. dxc5 { [%txt "Les Blancs prennent, mais leur centre perd sa base."] [%eval -0.14] }
    7... Na6 { [%txt "Le meilleur coup : le cavalier récupérera c5. Le moteur préfère légèrement les Noirs (-0.1)."] [%eval -0.13] [%cal Ga6c5] }
    8. cxd6 { [%txt "Les Blancs gardent le pion un moment."] [%eval -0.12] }
    8... exd6 { [%txt "Reprise : notre pion d6 contrôle e5, la diagonale du fou g7 est ouverte."] [%eval -0.15] [%cal Gg7c3] })
  7... e6 { [%txt "On ouvre le centre tout de suite : la colonne e s'ouvrira face au roi blanc encore au centre."] [%eval 0.34] [%cal Ge6d5] }
  8. Be2 { [%txt "Les Blancs se développent."] [%eval 0.18] }
  8... exd5 { [%txt "On échange."] [%eval 0.27] [%cal Ge6d5] }
  9. cxd5 { [%txt "Les Blancs reprennent avec le pion c."] [%eval 0.15] }
  9... Re8 { [%txt "La ligne principale de Vaisser : la tour vise le pion e4 et la colonne e."] [%eval 0.19] [%cal Ge8e4] }
  10. e5 { [%txt "Les Blancs tentent la percée."] [%eval 0.23] }
  (10. Nd2 { [%txt "Le coup prudent : le cavalier soutient e4 et vise c4."] [%eval -0.01] }
    10... Na6 { [%txt "Le cavalier vers c7 ou b4 : on soutient ...b5."] [%eval -0.02] [%cal Ga6c7,Ga6b4] })
  10... dxe5 { [%txt "On prend."] [%eval 0.17] [%csl Ge5] }
  11. fxe5 { [%txt "Les Blancs reprennent."] [%eval 0.17] }
  11... Ng4 { [%txt "Le cavalier attaque e5 trois fois avec la tour et le fou."] [%eval 0.15] [%cal Gg4e5,Ge8e5,Gg7e5] }
  12. Bg5 { [%txt "Le fou attaque la dame."] [%eval -0.10] }
  12... Qb6 { [%txt "RETENIR : la dame attaque b2 et prépare ...Nxe5. Égalité (0.00) : le grand centre blanc a explosé. Contre les Quatre Pions, ...c5 et ...e6 au plus vite."] [%eval -0.10] [%csl Re5] [%cal Gb6b2] })
5... O-O { [%txt "Le roque. Contre la Sämisch, le roi noir est en sécurité tant que la colonne h reste fermée."] [%eval 0.36] [%csl Gg8] }
6. Be3 { [%txt "Le fou soutient d4 et prépare Qd2 et Bh6 pour échanger notre fou g7."] [%eval 0.41] [%cal Re3h6] }
6... c5 { [%txt "LE LEVIER ANTI-SÄMISCH : on frappe d4 avant que le cavalier g1 soit sorti. C'est le meilleur coup du moteur (+0.4)."] [%eval 0.39] [%csl Gc5,Rd4] [%cal Gc5d4] }
(6... e5 { [%txt "Le coup classique de l'Est-Indienne, jouable mais moins précis (+0.9) : on garde les plans connus du chapitre 1."] [%eval 0.89] [%cal Ge5d4] }
  7. d5 { [%txt "Les Blancs ferment."] [%eval 0.87] }
  7... Nh5 { [%txt "Le cavalier libère le pion f."] [%eval 0.84] [%cal Gf7f5] }
  8. Qd2 { [%txt "La dame prépare O-O-O."] [%eval 0.82] }
  8... f5 { [%txt "La poussée f5."] [%eval 0.83] [%cal Gf5e4] }
  9. O-O-O { [%txt "Les rois sont de côtés opposés."] [%eval 0.79] }
  9... Nd7 { [%txt "RETENIR : le cavalier soutient ...Ndf6 et ...f4. Position tranchante, environ +0.8 : les Blancs attaquent par g4, nous par ...a6 et ...b5."] [%eval 0.75] [%cal Gd7f6,Ga7a6] })
7. dxc5 { [%txt "Les Blancs acceptent. Le cavalier g1 n'est toujours pas sorti."] [%eval 0.12] }
(7. d5 { [%txt "Les Blancs ferment : on obtient une Benoni où leur cavalier g1 est mal placé."] [%eval -0.19] }
  7... e6 { [%txt "On frappe d5 tout de suite."] [%eval 0.07] [%cal Ge6d5] }
  8. Qd2 { [%txt "La dame se développe."] [%eval 0.28] }
  8... exd5 { [%txt "On ouvre la colonne e."] [%eval 0.26] [%cal Ge8e4] }
  9. cxd5 { [%txt "Reprise."] [%eval 0.31] }
  9... a6 { [%txt "RETENIR : on prépare ...b5, l'aile dame est à nous."] [%eval 0.23] [%cal Gb7b5] })
(7. Nge2 { [%txt "Le cavalier sort enfin."] [%eval 0.32] }
  7... Nc6 { [%txt "Le cavalier attaque d4 une deuxième fois."] [%eval 0.42] [%cal Gc6d4] }
  8. d5 { [%txt "Les Blancs avancent avec gain de temps."] [%eval 0.46] }
  8... Ne5 { [%txt "Le cavalier s'installe en e5, une case forte devant le pion d6."] [%eval 0.51] [%csl Ge5] }
  9. Ng3 { [%txt "Les Blancs défendent c4 et f5."] [%eval 0.50] }
  9... e6 { [%txt "RETENIR : on frappe d5, le fou g7 respire."] [%eval 0.44] [%cal Ge6d5] })
7... dxc5 { [%txt "On reprend : les dames vont s'échanger."] [%eval 0.14] [%cal Gd6c5] }
8. Qxd8 { [%txt "Les Blancs échangent les dames."] [%eval 0.08] }
8... Rxd8 { [%txt "La tour prend la colonne d."] [%eval 0.11] [%cal Gd8d1] }
9. Bxc5 { [%txt "Les Blancs gagnent un pion..."] [%eval 0.13] }
9... Nc6 { [%txt "...mais nous sommes en avance de développement : le cavalier g1 et le fou f1 dorment encore."] [%eval 0.14] [%csl Rg1,Rf1] [%cal Gc6d4,Gc6b4] }
10. Nge2 { [%txt "Le cavalier sort enfin."] [%eval 0.07] }
10... b6 { [%txt "On chasse le fou c5."] [%eval 0.04] [%cal Gb6c5] }
11. Ba3 { [%txt "Le fou recule au bord."] [%eval 0.05] }
11... Ba6 { [%txt "RETENIR (

PRO TIP : le fou a6 cloue le pion c4 et vise le roi blanc resté au centre. Un pion de moins, mais égalité parfaite (0.00) : développement, colonnes ouvertes, fou g7 libre. Contre la Sämisch, un pion vaut moins que trois temps."] [%eval 0.05] [%csl Rc4,Re1] [%cal Ga6c4,Gg7b2] } *`,
    ),
    chapter(
      "Aléatoire Surprise : les coups de pion mous punis par le levier ...g4",
      `{ [%txt "MODULE ALÉATOIRE SURPRISE.

Une partie de club typique : les Blancs suivent la ligne du chapitre 1 jusqu'au coup 12, puis jouent deux coups de pion « prudents » : 13.h3 et 14.a3. Ils ne préparent ni c5 ni la défense de l'aile roi. Pire : le pion h3 devient un CROCHET pour notre levier ...g4.

À toi de trouver la punition. Utilise les indices dans l'ordre : 1. le principe violé, 2. la zone faible, 3. le levier de pion.

La méthode à retenir (

PRO TIP : on ne pousse pas ...g4 tout de suite. On prépare d'abord : ...Nf6 (contrôle de g4), ...h5 (deuxième soutien), puis ...g4 ouvre les colonnes g et h contre le roi blanc. Poussé trop tôt, le levier ne donne rien."] [%eval 0.39] }
1. d4 { [%txt "Le pion dame."] [%eval 0.33] }
1... Nf6 { [%txt "Le cavalier."] [%eval 0.29] [%cal Gf6e4] }
2. c4 { [%txt "L'espace."] [%eval 0.32] }
2... g6 { [%txt "Fianchetto."] [%eval 0.47] [%cal Gf8g7] }
3. Nc3 { [%txt "Le cavalier dame."] [%eval 0.43] }
3... Bg7 { [%txt "La grande diagonale."] [%eval 0.56] [%csl Gg7] }
4. e4 { [%txt "Le grand centre."] [%eval 0.55] }
4... d6 { [%txt "Le contrôle de e5."] [%eval 0.60] [%csl Ge5] }
5. Nf3 { [%txt "La Classique."] [%eval 0.58] }
5... O-O { [%txt "Le roque."] [%eval 0.56] [%csl Gg8] }
6. Be2 { [%txt "Développement."] [%eval 0.61] }
6... e5 { [%txt "La frappe sur d4."] [%eval 0.62] [%cal Ge5d4] }
7. O-O { [%txt "Le roque blanc."] [%eval 0.69] }
7... Nc6 { [%txt "Pression sur d4."] [%eval 0.76] [%cal Gc6d4] }
8. d5 { [%txt "La fermeture."] [%eval 0.72] [%csl Gd5] }
8... Ne7 { [%txt "Vers l'aile roi."] [%eval 0.66] [%cal Ge7g6] }
9. Ne1 { [%txt "Le cavalier vers d3."] [%eval 0.68] }
9... Nd7 { [%txt "Le pion f est libre."] [%eval 0.75] [%cal Gf7f5] }
10. Nd3 { [%txt "Le cavalier soutient c5."] [%eval 0.68] }
10... f5 { [%txt "La première vague."] [%eval 0.72] [%cal Gf5e4] }
11. Bd2 { [%txt "Développement."] [%eval 0.28] }
11... f4 { [%txt "La deuxième vague."] [%eval 0.61] [%csl Gf4] }
12. f3 { [%txt "Le blocage : fin du terrain connu, environ +0.6."] [%eval 0.56] }
12... g5 { [%txt "La troisième vague."] [%eval 0.56] [%cal Gg5g4] }
13. h3 { [%txt "PREMIER COUP MOU : les Blancs veulent empêcher ...g4. En réalité, ils donnent une cible : le pion h3 est un crochet pour ...h5 et ...g4. Le plan c5 (b4 était le bon coup) n'avance pas. Environ +0.2 au lieu de +0.55."] [%hint "Les Blancs jouent un coup de pion sur l'aile où ils sont attaqués, au lieu de poursuivre leur plan c5 à l'aile dame."] [%hint "Le pion h3 : il sert de crochet. Un pion noir en g4 l'attaquera et ouvrira une colonne vers le roi."] [%hint "On prépare le levier ...g4 : d'abord les cavaliers en g6 et f6, puis ...h5."] [%hintcsl Rh3,Rg4] [%eval 0.04] [%csl Rh3] }
13... Ng6 { [%txt "Le cavalier rejoint l'aile roi et soutient ...h5-h4."] [%eval 0.15] [%cal Ge7g6,Gg6h4] }
14. a3 { [%txt "DEUXIÈME COUP MOU : a3 ne prépare rien que b4 n'aurait fait en un coup. Les Blancs ont perdu deux temps : environ -0.45, les Noirs sont mieux."] [%hint "Deuxième coup de pion inutile : a3 ne fait rien que b4 n'aurait fait directement. Deux temps perdus dans une course d'ailes."] [%hint "L'aile roi blanche : g4 et h3 ne sont défendus que par des pions, aucune pièce blanche ne la protège."] [%hint "Nf6 ! Le cavalier contrôle g4 et h5 ; ensuite ...h5 et le levier ...g4."] [%hintcsl Rg4,Rh3] [%eval -0.42] [%csl Ra3] }
14... Nf6 { [%txt "Le cavalier contrôle g4 : c'est la première pièce du levier."] [%eval -0.57] [%cal Gf6g4,Gf6h5] }
15. Be1 { [%txt "Le fou rentre pour défendre l'aile roi (il pourra aller en f2)."] [%eval -0.71] }
15... h5 { [%txt "Le deuxième soutien : le pion h5 pousse ...g4 et ouvrira la colonne h."] [%eval -0.67] [%csl Gh5] [%cal Gh5g4,Gg5g4] }
16. a4 { [%txt "Les Blancs continuent lentement à l'aile dame."] [%eval -0.65] }
16... g4 { [%txt "LE LEVIER, préparé : g4 est soutenu par le pion h5 et le cavalier f6. Les colonnes g et h vont s'ouvrir."] [%eval -0.73] [%csl Gg4,Rh3] [%cal Gg4h3,Gg4f3] }
17. fxg4 { [%txt "Les Blancs prennent."] [%eval -0.63] }
17... hxg4 { [%txt "On reprend avec le pion h : la colonne h s'entrouvre."] [%eval -0.66] [%cal Gh5g4] }
18. hxg4 { [%txt "Les Blancs prennent encore."] [%eval -0.51] }
18... Bh6 { [%txt "Le fou sort par h6 vers g5 et e3 : il récupérera le pion g4 avec le cavalier."] [%eval -0.48] [%cal Gh6g5,Gh6e3] }
19. Bf3 { [%txt "Le fou défend g4."] [%eval -0.46] }
19... Kg7 { [%txt "Le roi libère la colonne h pour une tour : Rh8 arrive."] [%eval -0.36] [%cal Gf8h8] }
20. Bd2 { [%txt "Le fou revient en d2 pour attaquer notre pion f4 : trop lent."] [%eval -0.36] }
20... Bd7 { [%txt "Le dernier développement : la tour a8 pourra rejoindre l'aile roi."] [%eval -0.30] [%cal Ga8h8] }
21. a5 { [%txt "Les Blancs n'ont toujours pas ouvert de colonne à l'aile dame."] [%eval -0.43] }
21... a6 { [%txt "On fige l'aile dame : la poussée a6 est stoppée, b5 aussi."] [%eval -0.46] [%csl Ga6] }
22. Kf2 { [%txt "Le roi blanc tente de fuir."] [%eval -0.42] }
22... Nxg4+ { [%txt "RETENIR (

PRO TIP : on récupère le pion avec échec, la colonne h est ouverte et le roi blanc est exposé. Environ -0.5, et c'est la position la plus facile à jouer : nos pièces attaquent, les leurs défendent. Deux coups de pion mous à l'aile roi se punissent par un levier PRÉPARÉ (...Nf6, ...h5, puis ...g4), jamais improvisé."] [%eval -0.49] [%csl Rf2] [%cal Gg4f2,Gf8h8] } *`,
    ),
  ],
};
