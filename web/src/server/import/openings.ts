import "server-only";
import { eco } from "chess-openings/dist/chess/openings/eco";

/**
 * Détection de théorie d'ouverture, pour la qualité « Théorique ».
 *
 * S'appuie sur `chess-openings` (WTFPL — domaine public de fait), une base de
 * 3600 positions ECO dérivée d'un livre d'ouvertures Polyglot : pour chaque
 * position cataloguée, la liste des coups qui restent « dans le livre ».
 * Couvre en moyenne une trentaine de coups par position — cette diversité est
 * normale : depuis le premier coup, quasiment toute réponse a un nom ECO. La
 * vraie valeur vient de la profondeur : une fois sorti d'un répertoire connu,
 * les positions cessent d'être cataloguées et la théorie s'arrête d'elle-même.
 *
 * Aucune requête réseau : le paquet embarque les données, chargées une seule
 * fois par le module resolver de Node (voir `serverExternalPackages` dans
 * next.config.ts — ~3 Mo qu'on ne veut surtout pas voir dans le bundle client).
 */

export interface OpeningMatch {
  eco: string;
  name: string;
}

/** EPD : le FEN sans les compteurs de coups (les 4 premiers champs seulement). */
function epdOf(fen: string): string {
  return fen.split(" ").slice(0, 4).join(" ");
}

/**
 * Un coup est-il théorique — la position qu'il atteint a-t-elle un nom ECO ?
 *
 * Attention au sens : la base catalogue les positions APRÈS un coup, jamais
 * la position de départ elle-même (elle n'a pas de nom). Vérifier `fenAfter`
 * plutôt que « ce coup figure-t-il dans les continuations de `fenBefore` »
 * couvre donc aussi le tout premier coup de la partie — et gère les
 * transpositions pour ce qu'elles sont : la théorie se définit par la
 * position atteinte, pas par la séquence de coups qui y mène.
 */
export function findBookMove(fenAfter: string): OpeningMatch | null {
  const entry = eco[epdOf(fenAfter)];
  return entry ? { eco: entry.eco, name: entry.name } : null;
}
