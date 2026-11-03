/**
 * Contenu pédagogique « pourquoi ce coup ? » (approche Jeremy Silman) pour la
 * ligne principale des ouvertures du catalogue (`core/curriculum/openings.ts`)
 * — affiché sous l'échiquier à chaque coup dans l'écran « Études & Chapitres »
 * (voir `client/features/openings/move-commentary.tsx`).
 *
 * Un tableau par `openingId`, ALIGNÉ sur `OpeningLine.moves` (même index,
 * 1-based via `getMoveCommentary`) : l'entrée `i` commente le `i`-ème coup de
 * `opening.moves`, quel que soit le camp qui le joue.
 *
 * `comment` explique le motif positionnel/tactique du coup — jamais un simple
 * constat ("développe une pièce"), toujours le POURQUOI. `hint` est l'indice
 * du bouton « Afficher l'indice » en Mode Entraînement : il oriente vers
 * l'IDÉE du coup (quelle pièce, quel motif) SANS jamais nommer la case
 * d'arrivée ni le coup lui-même — même invariant que `hintSquare` dans
 * `use-opening-drill.ts` (« jamais la réponse soufflée directement »).
 *
 * Pure donnée, comme `openings.ts` : aucune dépendance serveur, importable
 * aussi bien côté client (Mode Entraînement) que serveur.
 *
 * Scope volontairement limité à la ligne PRINCIPALE (pas aux variantes
 * nommées de `listOpeningVariations`, calculées dynamiquement) — un chapitre
 * sans contenu dédié retombe sur `GENERIC_BOOK_COMMENT`.
 */

/** Une flèche tactique explicative (idée positionnelle/menace), PAS le coup à jouer — voir `annotationArrows`. */
export interface CommentaryArrow {
  from: string;
  to: string;
}

export interface MoveCommentary {
  comment: string;
  hint: string;
  /**
   * Flèches graphiques explicatives (idées/menaces annexes — ex. une case
   * faible visée, une pièce sous pression), PAS le coup théorique lui-même
   * (déjà indiqué par la flèche d'indice, voir `use-opening-drill.ts`) : le
   * Mode Entraînement les restitue en semi-transparent (`OpeningDrill`),
   * exactement comme Listudy distingue ses flèches d'indice (pleines) de ses
   * flèches de commentaire (transparentes). Optionnel — vide/absent tant
   * qu'aucune entrée du catalogue n'en fournit.
   */
  annotationArrows?: readonly CommentaryArrow[];
}

const OPENING_COMMENTARY: Readonly<Record<string, readonly MoveCommentary[]>> = {
  "ruy-lopez": [
    {
      comment: "Occupe le centre et ouvre d'un coup les diagonales du fou-roi et de la dame.",
      hint: "Avance ton pion central de deux cases.",
    },
    {
      comment: "Les Noirs répondent symétriquement au centre, refusant de céder l'initiative territoriale.",
      hint: "Réponds au centre par le pion symétrique.",
    },
    {
      comment: "Développe un cavalier tout en attaquant le pion e5, forçant les Noirs à le défendre.",
      hint: "Développe une pièce mineure en attaquant un pion adverse.",
    },
    {
      comment: "Défend le pion e5 en développant une pièce — la réponse la plus naturelle et la plus solide.",
      hint: "Défends le pion attaqué en développant une pièce mineure.",
    },
    {
      comment:
        "Le coup signature de l'ouverture : le fou vise le cavalier c6, seul défenseur du pion e5 — pression indirecte et durable sur le centre noir.",
      hint: "Développe ton fou-roi vers l'aile dame pour clouer le défenseur du pion e5.",
    },
  ],
  "berlin-black": [
    {
      comment: "Les Blancs occupent le centre et libèrent le fou f1 et la dame.",
      hint: "Avance ton pion roi de deux cases.",
    },
    {
      comment: "Symétrie : le pion e5 conteste le centre et ouvre la diagonale du fou f8.",
      hint: "Réponds par la poussée symétrique de ton pion roi.",
    },
    {
      comment: "Le cavalier se développe en attaquant e5.",
      hint: "Développe ton cavalier-roi en attaquant le pion central adverse.",
    },
    {
      comment: "Le cavalier défend e5 en se développant vers le centre.",
      hint: "Défends ton pion central avec un cavalier.",
    },
    {
      comment: "L'Espagnole : le fou attaque le défenseur de e5.",
      hint: "Attaque la pièce qui défend le pion e5.",
    },
    {
      comment:
        "La Berlinoise : au lieu de chasser le fou, on contre-attaque e4. Si 4.O-O, ...Nxe4 prend le pion et mène à la solide finale berlinoise.",
      hint: "Contre-attaque le pion e4 avec ton second cavalier.",
    },
  ],
  "kings-gambit-vienna-black": [
    {
      comment: "Les Blancs occupent le centre et libèrent le fou f1 et la dame.",
      hint: "Avance ton pion roi de deux cases.",
    },
    {
      comment: "Symétrie : le pion e5 conteste le centre et ouvre la diagonale du fou f8.",
      hint: "Réponds par la poussée symétrique de ton pion roi.",
    },
    {
      comment:
        "Le Gambit du Roi : les Blancs offrent le pion f pour ouvrir la colonne f vers f7 et prendre le centre par d4. On l'accepte, puis la chaîne ...d6 et ...g5 le garde.",
      hint: "Les Blancs offrent un pion de l'aile roi pour détourner ton pion central.",
    },
  ],
  "italian-game-black": [
    {
      comment: "Les Blancs occupent le centre et libèrent le fou f1 et la dame.",
      hint: "Avance ton pion roi de deux cases.",
    },
    {
      comment: "Symétrie : le pion e5 conteste le centre.",
      hint: "Réponds par la poussée symétrique de ton pion roi.",
    },
    {
      comment: "Le cavalier se développe en attaquant e5.",
      hint: "Développe ton cavalier-roi en attaquant le pion central adverse.",
    },
    {
      comment: "Le cavalier défend e5 en se développant vers le centre.",
      hint: "Défends ton pion central avec un cavalier.",
    },
    {
      comment: "L'Italienne : le fou vise f7, le point faible du roque noir.",
      hint: "Place ton fou-roi sur la diagonale qui vise f7.",
    },
    {
      comment:
        "Les Deux Cavaliers : on contre-attaque e4 au lieu de protéger f7. Contre 4.Ng5, la réponse est ...d5 puis ...Na5, un pion contre l'initiative.",
      hint: "Contre-attaque le pion e4 avec ton second cavalier.",
    },
  ],
  "scotch-four-knights-black": [
    {
      comment: "Les Blancs occupent le centre et libèrent le fou f1 et la dame.",
      hint: "Avance ton pion roi de deux cases.",
    },
    {
      comment: "Symétrie : le pion e5 conteste le centre et ouvre la diagonale du fou f8.",
      hint: "Réponds par la poussée symétrique de ton pion roi.",
    },
    {
      comment: "Le cavalier se développe en attaquant e5.",
      hint: "Développe ton cavalier-roi en attaquant le pion central adverse.",
    },
    {
      comment:
        "Le cavalier défend e5. Contre 3.d4 (Écossaise), on prend puis ...Nf6 ; contre 3.Nc3 (Quatre Cavaliers), ...Nf6 aussi, et ...Nb4 si le cavalier saute en d5.",
      hint: "Défends ton pion central avec un cavalier.",
    },
  ],
  "french-white": [
    {
      comment: "On occupe le centre et on libère le fou f1 et la dame.",
      hint: "Avance ton pion roi de deux cases.",
    },
    {
      comment:
        "La Française : les Noirs préparent ...d5. Notre plan est l'Avance (2.d4 d5 3.e5), qui enferme le fou c8 noir, ou l'ordre 2.Nf3 suivi de 3.Nc3.",
      hint: "Les Noirs préparent la poussée de leur pion dame.",
    },
  ],
  "caro-kann-white": [
    {
      comment: "On occupe le centre et on libère le fou f1 et la dame.",
      hint: "Avance ton pion roi de deux cases.",
    },
    {
      comment: "La Caro-Kann : les Noirs préparent ...d5 sans enfermer leur fou c8.",
      hint: "Les Noirs préparent la poussée de leur pion dame.",
    },
    {
      comment: "Le centre idéal : deux pions côte à côte en d4 et e4.",
      hint: "Complète ton centre avec le pion dame.",
    },
    {
      comment:
        "Les Noirs attaquent e4. Nos quatre systèmes : l'Avance 3.e5, la Classique 3.Nc3, l'Échange 3.exd5 avec 4.Bd3, et la Panov 4.c4.",
      hint: "Les Noirs frappent ton pion e4 : choisis de l'avancer, de le défendre ou de l'échanger.",
    },
  ],
  "scandinavian-white": [
    {
      comment: "On occupe le centre et on libère le fou f1 et la dame.",
      hint: "Avance ton pion roi de deux cases.",
    },
    {
      comment: "La Scandinave : les Noirs attaquent e4 tout de suite.",
      hint: "Les Noirs frappent ton pion e4 avec leur pion dame.",
    },
    {
      comment:
        "On prend : la pièce noire qui reprendra en d5 (dame ou cavalier) sera chassée avec gain de temps par Nc3 ou c4.",
      hint: "Prends le pion qui attaque e4.",
    },
  ],
  "italian-game": [
    {
      comment: "Occupe le centre et ouvre les diagonales du fou-roi et de la dame dès le premier coup.",
      hint: "Avance ton pion central de deux cases.",
    },
    {
      comment: "Les Noirs répondent symétriquement au centre.",
      hint: "Réponds au centre par le pion symétrique.",
    },
    {
      comment: "Développe un cavalier en attaquant le pion e5, forçant une réponse immédiate.",
      hint: "Développe une pièce mineure en attaquant un pion adverse.",
    },
    {
      comment: "Défend le pion e5 en développant une pièce.",
      hint: "Défends le pion attaqué en développant une pièce mineure.",
    },
    {
      comment:
        "Le fou vise directement f7, la case la plus fragile du camp noir (seulement défendue par le roi) — développement rapide et agressif.",
      hint: "Développe ton fou-roi vers la diagonale qui pointe sur la case la plus faible du camp adverse.",
    },
  ],
  "scotch-game": [
    {
      comment: "Occupe le centre et ouvre les diagonales du fou-roi et de la dame.",
      hint: "Avance ton pion central de deux cases.",
    },
    {
      comment: "Les Noirs répondent symétriquement au centre, refusant de céder l'espace sans contester.",
      hint: "Réponds au centre par le pion symétrique.",
    },
    {
      comment: "Développe un cavalier en attaquant le pion e5 — un tempo gratuit avant même de fixer sa structure.",
      hint: "Développe une pièce mineure en attaquant un pion adverse.",
    },
    {
      comment: "Défend e5 en développant une pièce plutôt qu'en le poussant ou le protégeant par un pion — Nc6 garde toutes les options ouvertes (Écossaise, Italienne, Espagnole...).",
      hint: "Défends le pion attaqué en développant une pièce mineure.",
    },
    {
      comment:
        "L'idée qui distingue l'Écossaise : au lieu de développer le fou-roi (Italienne) ou de clouer le cavalier (Espagnole), les Blancs défient tout de suite le centre noir — position plus ouverte et plus concrète, où le meilleur développement compte davantage que le plan à long terme.",
      hint: "Pousse ton second pion central pour défier directement le pion e5 adverse.",
    },
    {
      comment: "Les Noirs acceptent l'échange plutôt que de le laisser filer : refuser (par ...exd4 différé) céderait le centre sans rien obtenir en retour.",
      hint: "Le pion attaqué doit décider s'il capture la pièce qui le défie.",
    },
    {
      comment:
        "Nxd4 recentralise le cavalier sur la case la plus dominante de l'échiquier tout en gagnant le temps de développement que le pion e5 venait de payer — d'ici, trois plans distincts attendent les Noirs : Bc5 (Classique), Nf6 (Schmidt/Mieses) ou une déviation blanche par 4.Bc4 (Gambit Écossais).",
      hint: "Reprends le pion avec la pièce déjà développée, en te centralisant.",
    },
  ],
  "sicilian-najdorf": [
    {
      comment: "Occupe le centre et ouvre les diagonales du fou-roi et de la dame.",
      hint: "Avance ton pion central de deux cases.",
    },
    {
      comment:
        "Combat asymétrique du centre : plutôt que de répondre au centre, les Noirs prennent de l'espace à l'aile dame et déséquilibrent immédiatement la partie.",
      hint: "Réponds au centre par un pion d'aile qui contrôle une case centrale clé.",
    },
    {
      comment: "Développement naturel, préparant d4 pour ouvrir le centre.",
      hint: "Développe un cavalier en préparant la poussée centrale.",
    },
    {
      comment: "Soutient une future poussée ...e5 et ouvre la diagonale du fou-dame.",
      hint: "Avance un pion pour préparer le développement de ton fou-dame et soutenir le centre.",
    },
    {
      comment:
        "Ouvre le centre pendant que les Noirs sont encore en retard de développement — thème classique de la Sicilienne ouverte.",
      hint: "Pousse ton second pion central pour défier le pion c5 adverse.",
    },
    {
      comment: "Les Noirs acceptent l'échange, cédant le centre pour un contre-jeu plus tard sur la colonne c.",
      hint: "Capture le pion central qui vient d'avancer.",
    },
    {
      comment: "Recapture en centralisant le cavalier — position typique de la Sicilienne ouverte.",
      hint: "Reprends avec la pièce déjà développée pour te centraliser.",
    },
    {
      comment: "Développe en attaquant le pion e4, forçant les Blancs à le défendre.",
      hint: "Développe ton cavalier-roi en attaquant le pion central adverse.",
    },
    {
      comment: "Défend le pion e4 tout en développant une pièce supplémentaire.",
      hint: "Défends ton pion central en développant ton second cavalier.",
    },
    {
      comment:
        "Le coup signature de la Najdorf : empêche toute intrusion adverse sur b5 et prépare ...e5 ou ...b5 selon la réponse blanche — flexibilité maximale.",
      hint: "Joue un coup de pion discret sur l'aile dame qui interdit toute pièce adverse sur une case avancée précise.",
    },
  ],
  "sicilian-alapin": [
    {
      comment: "Occupe le centre et ouvre les diagonales du fou-roi et de la dame.",
      hint: "Avance ton pion central de deux cases.",
    },
    {
      comment: "Prend de l'espace à l'aile dame et contrôle la case d4, plutôt que de répondre au centre.",
      hint: "Réponds au centre par un pion d'aile qui contrôle une case centrale clé.",
    },
    {
      comment:
        "Évite la théorie lourde de la Sicilienne ouverte : prépare d4 pour établir un centre classique sans jamais céder le centre.",
      hint: "Prépare ta poussée centrale en la soutenant d'abord par un pion d'aile dame.",
    },
    {
      comment: "Attaque le pion e4 pour empêcher les Blancs de consolider tranquillement leur centre.",
      hint: "Développe ton cavalier en attaquant le pion central adverse.",
    },
    {
      comment: "Chasse le cavalier plutôt que de le laisser prendre e4, gagnant de l'espace au centre.",
      hint: "Avance le pion central attaqué pour chasser la pièce adverse.",
    },
    {
      comment: "Le cavalier recule sur une case centralisée, où il pourra être remis en question plus tard.",
      hint: "Recule ton cavalier chassé vers une case centrale.",
    },
    {
      comment: "Établit le grand centre de pions caractéristique de l'Alapine, but ultime de ce système anti-Sicilien.",
      hint: "Complète ton centre de pions en poussant ton second pion central.",
    },
  ],
  "caro-kann": [
    {
      comment: "Occupe le centre et ouvre les diagonales du fou-roi et de la dame.",
      hint: "Avance ton pion central de deux cases.",
    },
    {
      comment:
        "Prépare ...d5 en le soutenant par un pion plutôt que par une pièce — structure solide sans concession positionnelle.",
      hint: "Prépare ta poussée centrale en la soutenant d'abord par un pion d'aile dame.",
    },
    {
      comment: "Les Blancs complètent leur centre classique pendant que les Noirs préparent leur riposte.",
      hint: "Pousse ton second pion central.",
    },
    {
      comment:
        "Défie immédiatement le centre blanc avec un pion déjà soutenu — structure de pions saine pour la fin de partie.",
      hint: "Défie le centre adverse avec ton pion dame, déjà soutenu par un pion voisin.",
    },
  ],
  "french-defense": [
    {
      comment: "Occupe le centre et ouvre les diagonales du fou-roi et de la dame.",
      hint: "Avance ton pion central de deux cases.",
    },
    {
      comment:
        "Prépare ...d5 tout en gardant la structure fermée — concède temporairement la diagonale du fou-dame pour une position solide.",
      hint: "Prépare ta poussée centrale par un coup de pion discret qui garde la position fermée.",
    },
    {
      comment: "Les Blancs complètent leur centre classique.",
      hint: "Pousse ton second pion central.",
    },
    {
      comment:
        "Défie le centre blanc, menant à une structure fermée typique où le contre-jeu noir viendra des colonnes c et f.",
      hint: "Défie le centre adverse avec ton pion dame.",
    },
  ],
  "pirc-defense": [
    {
      comment: "Occupe le centre et ouvre les diagonales du fou-roi et de la dame.",
      hint: "Avance ton pion central de deux cases.",
    },
    {
      comment: "Approche hypermoderne : laisse les Blancs occuper le centre pour mieux le contre-attaquer plus tard.",
      hint: "Joue un coup de pion flexible qui prépare le développement sans engager le centre tout de suite.",
    },
    {
      comment: "Les Blancs prennent le grand centre qu'on leur laisse.",
      hint: "Complète le centre de pions blanc.",
    },
    {
      comment: "Développe en pressant le pion e4, tout en préparant le fianchetto du roi.",
      hint: "Développe ton cavalier-roi en direction du centre adverse.",
    },
    {
      comment: "Défend e4 et prépare un développement rapide, parfois suivi de f4 pour une attaque directe.",
      hint: "Défends ton pion central en développant ton second cavalier.",
    },
    {
      comment: "Prépare le fianchetto du fou-roi, la pièce maîtresse du plan noir pour contre-attaquer la grande diagonale.",
      hint: "Prépare le fianchetto de ton fou-roi par un coup de pion sur l'aile roi.",
    },
  ],
  scandinavian: [
    {
      comment: "Occupe le centre et ouvre les diagonales du fou-roi et de la dame.",
      hint: "Avance ton pion central de deux cases.",
    },
    {
      comment: "Défie immédiatement le pion e4 dès le premier coup, cherchant une position simplifiée et facile à comprendre.",
      hint: "Défie directement le pion central adverse avec ton propre pion dame.",
    },
    {
      comment: "Les Blancs acceptent l'échange plutôt que de pousser e5, gagnant un temps sur la dame noire qui doit reprendre.",
      hint: "Capture le pion qui vient de défier ton centre.",
    },
    {
      comment: "La dame recapture tôt — un choix pratique, au prix d'un futur temps perdu quand les Blancs la chasseront en développant.",
      hint: "Reprends le pion avec ta dame, la seule pièce capable de le faire immédiatement.",
    },
    {
      comment: "Développe en attaquant la dame noire, gagnant un temps précieux de développement.",
      hint: "Développe ta pièce mineure en attaquant la dame adverse déjà sortie.",
    },
    {
      comment: "La dame recule sur une case active qui garde la pression sur le centre et se prépare à se clouer sur une diagonale.",
      hint: "Recule ta dame attaquée sur une case qui reste active, hors de portée immédiate.",
    },
  ],
  "queens-gambit": [
    {
      comment: "Occupe le centre avec le pion dame — l'ouverture de dame la plus classique.",
      hint: "Avance ton pion dame de deux cases.",
    },
    {
      comment: "Les Noirs répondent symétriquement au centre.",
      hint: "Réponds au centre par le pion symétrique.",
    },
    {
      comment:
        "Met immédiatement en question le pion d5 : si les Noirs le prennent, les Blancs regagnent le temps perdu en reconquérant le centre.",
      hint: "Offre un pion d'aile dame pour mettre en question le pion central adverse.",
    },
  ],
  "queens-gambit-declined": [
    {
      comment: "Occupe le centre avec le pion dame.",
      hint: "Avance ton pion dame de deux cases.",
    },
    {
      comment: "Les Noirs répondent symétriquement au centre.",
      hint: "Réponds au centre par le pion symétrique.",
    },
    {
      comment: "Met en question le pion d5 pour regagner le temps si les Noirs capturent.",
      hint: "Offre un pion d'aile dame pour mettre en question le pion central adverse.",
    },
    {
      comment:
        "Refuse le pion offert et prépare le développement du fou-roi, quitte à enfermer temporairement le fou-dame.",
      hint: "Refuse le pion offert avec un coup de pion solide qui prépare ton développement.",
    },
    {
      comment: "Développe en renforçant la pression sur d5.",
      hint: "Développe ta pièce mineure pour appuyer la pression centrale.",
    },
    {
      comment: "Développe en défendant indirectement la structure centrale et en préparant le petit roque.",
      hint: "Développe ton cavalier-roi pour soutenir ton centre et préparer le roque.",
    },
  ],
  "slav-defense": [
    {
      comment: "Occupe le centre avec le pion dame.",
      hint: "Avance ton pion dame de deux cases.",
    },
    {
      comment: "Les Noirs répondent symétriquement au centre.",
      hint: "Réponds au centre par le pion symétrique.",
    },
    {
      comment: "Met en question le pion d5 pour regagner le temps si les Noirs capturent.",
      hint: "Offre un pion d'aile dame pour mettre en question le pion central adverse.",
    },
    {
      comment:
        "Défend d5 avec un pion plutôt qu'avec ...e6, gardant la diagonale du fou-dame ouverte — plus flexible que le Gambit Dame Refusé classique.",
      hint: "Défends ton pion central par un pion d'aile dame, en gardant la diagonale de ton fou-dame libre.",
    },
  ],
  "kings-indian": [
    {
      comment: "Occupe le centre avec le pion dame.",
      hint: "Avance ton pion dame de deux cases.",
    },
    {
      comment: "Développe sans engager immédiatement le centre, gardant toutes les options structurelles ouvertes.",
      hint: "Développe ton cavalier-roi sans fixer ta structure de pions centrale tout de suite.",
    },
    {
      comment: "Les Blancs étendent leur emprise sur le centre.",
      hint: "Étends ton contrôle du centre avec un second pion.",
    },
    {
      comment: "Prépare le fianchetto du fou-roi, pièce maîtresse du plan de contre-attaque tranchant à l'aile roi.",
      hint: "Prépare le fianchetto de ton fou-roi par un coup de pion sur l'aile roi.",
    },
  ],
  "nimzo-indian": [
    {
      comment: "Occupe le centre avec le pion dame.",
      hint: "Avance ton pion dame de deux cases.",
    },
    {
      comment: "Développe sans engager immédiatement le centre.",
      hint: "Développe ton cavalier-roi sans fixer ta structure de pions centrale tout de suite.",
    },
    {
      comment: "Les Blancs étendent leur emprise sur le centre.",
      hint: "Étends ton contrôle du centre avec un second pion.",
    },
    {
      comment: "Prépare le développement du fou-roi tout en gardant l'option centrale ...d5 ouverte.",
      hint: "Prépare le développement de ton fou-roi par un coup de pion flexible.",
    },
    {
      comment: "Développe le cavalier — mais expose la structure de pions blanche à un clouage immédiat.",
      hint: "Développe ta pièce mineure vers le centre.",
    },
    {
      comment:
        "Le clouage signature de l'ouverture : cloue le cavalier c3 sur le roi blanc, menaçant de doubler les pions blancs en cas d'échange.",
      hint: "Développe ton fou-roi pour clouer la pièce qui vient de se développer sur le roi adverse.",
    },
  ],
  "london-system": [
    {
      comment: "Occupe le centre avec le pion dame.",
      hint: "Avance ton pion dame de deux cases.",
    },
    {
      comment: "Les Noirs répondent symétriquement au centre.",
      hint: "Réponds au centre par le pion symétrique.",
    },
    {
      comment:
        "Développe naturellement avant de fixer le plan avec le fou — le Système Londres évite volontairement la théorie lourde.",
      hint: "Développe un cavalier vers le centre avant de fixer ton plan de développement.",
    },
    {
      comment: "Développement symétrique des Noirs.",
      hint: "Développe ton cavalier-roi vers le centre.",
    },
    {
      comment:
        "Sort le fou-dame AVANT de refermer la chaîne de pions — le point clé du Système Londres, qui évite d'enfermer cette pièce comme dans une Colle classique.",
      hint: "Développe ton fou-dame à l'extérieur de ta chaîne de pions avant de la refermer.",
    },
  ],
  "anti-london-black": [
    {
      comment: "Les Blancs occupent le centre avec le pion dame.",
      hint: "Avance ton pion dame de deux cases.",
    },
    {
      comment: "Développe en contrôlant e4, sans fixer la structure : le même coup sert contre tous les systèmes blancs à base de d4.",
      hint: "Développe ton cavalier-roi vers le centre, sans toucher aux pions centraux.",
    },
    {
      comment: "Les Blancs sortent le fou-dame avant e3 : le Londres accéléré, qui vise c7 et e5.",
      hint: "Sors ton fou-dame à l'extérieur de la future chaîne e3-d4.",
    },
    {
      comment:
        "Prépare le fianchetto : le fou g7 visera d4 et b2, et le pion d6 puis ...e5 frapperont le fou f4. Un seul schéma contre tous les systèmes lents.",
      hint: "Prépare le fianchetto de ton fou-roi par un coup de pion sur l'aile roi.",
    },
  ],
  "english-opening": [
    {
      comment:
        "Premier coup flexible qui contrôle une case centrale sans engager immédiatement le centre — peut transposer vers presque toutes les structures fermées.",
      hint: "Avance un pion d'aile dame qui contrôle une case centrale sans t'engager davantage.",
    },
    {
      comment: "Les Noirs répondent en miroir, occupant le centre eux-mêmes.",
      hint: "Occupe le centre avec ton pion roi, comme dans une position de Sicilienne aux couleurs inversées.",
    },
    {
      comment: "Développe en renforçant le contrôle d'une case centrale, dans l'esprit flexible de l'ouverture.",
      hint: "Développe ta pièce mineure pour renforcer ton contrôle du centre.",
    },
    {
      comment: "Développement naturel qui prépare le petit roque.",
      hint: "Développe ton cavalier-roi vers le centre.",
    },
  ],
  grunfeld: [
    {
      comment: "Occupe le centre avec le pion dame.",
      hint: "Avance ton pion dame de deux cases.",
    },
    {
      comment: "Développe sans engager immédiatement le centre.",
      hint: "Développe ton cavalier-roi sans fixer ta structure de pions centrale tout de suite.",
    },
    {
      comment: "Les Blancs étendent leur emprise sur le centre.",
      hint: "Étends ton contrôle du centre avec un second pion.",
    },
    {
      comment: "Prépare le fianchetto du fou-roi.",
      hint: "Prépare le fianchetto de ton fou-roi par un coup de pion sur l'aile roi.",
    },
    {
      comment: "Les Blancs développent, prêts à occuper un grand centre.",
      hint: "Développe ta pièce mineure vers le centre.",
    },
    {
      comment:
        "Le coup signature de l'ouverture : cède le centre pour le bombarder aussitôt avec les pièces depuis le fianchetto — dynamisme immédiat.",
      hint: "Défie tout de suite le centre adverse avec ton pion dame, quitte à le céder pour mieux le contre-attaquer avec tes pièces.",
    },
  ],
  "dutch-defense": [
    {
      comment: "Occupe le centre avec le pion dame.",
      hint: "Avance ton pion dame de deux cases.",
    },
    {
      comment:
        "Revendique l'aile roi dès le premier coup pour une partie déséquilibrée et combative, au prix d'un affaiblissement d'une case centrale.",
      hint: "Avance le pion du fou-roi pour contester l'aile roi, quitte à affaiblir une case centrale.",
    },
  ],
};

/** Repli quand aucun contenu dédié n'existe (chapitre/variante hors ligne principale — voir le docstring du fichier). */
export const GENERIC_BOOK_COMMENT: MoveCommentary = {
  comment: "Un coup connu de la théorie pour cette variante — reste dans l'esprit général de cette ouverture.",
  hint: "Cherche le coup qui développe une pièce ou renforce ton centre sans céder de matériel.",
};

/**
 * Commentaire pédagogique du `ply`-ième coup (1-based) de la ligne
 * principale d'`openingId` — `null` si l'ouverture ou ce coup précis n'a pas
 * de contenu dédié (voir `GENERIC_BOOK_COMMENT` pour le repli côté appelant).
 */
export function getMoveCommentary(openingId: string, ply: number): MoveCommentary | null {
  const list = OPENING_COMMENTARY[openingId];
  if (!list) return null;
  return list[ply - 1] ?? null;
}
