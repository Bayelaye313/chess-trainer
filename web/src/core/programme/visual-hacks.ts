/**
 * Hacks visuels de désautomatisation — un par jour, jamais le même deux jours
 * de suite (vérifié par `programme-content.test.ts`).
 *
 * Chaque hack porte son RENDU (`render`) en plus de sa consigne : l'écran
 * `/programme` l'applique à l'échiquier des puzzles du bloc concerné, ce n'est
 * pas une suggestion à appliquer soi-même. Les explications neurologiques
 * restent volontairement prudentes : elles décrivent le mécanisme ciblé, sans
 * promettre d'effet chiffré.
 */

export interface VisualHackRender {
  /** Échiquier vu depuis le camp adverse (rotation 180°). */
  rotate180?: boolean;
  /** Cases claires et foncées inversées. */
  invertSquares?: boolean;
  /** Cases quasi identiques (contraste réduit). */
  lowContrast?: boolean;
  /** Cases en noir et blanc pur (contraste maximal). */
  highContrast?: boolean;
  /** Largeur maximale de l'échiquier en pixels. */
  boardWidth?: number;
  /** Types de pièces (`p`, `n`, `b`, `r`, `q`) rendus invisibles. */
  hiddenPieceTypes?: readonly string[];
  /** Coordonnées masquées. */
  hideCoordinates?: boolean;
  /** Échiquier en niveaux de gris. */
  grayscale?: boolean;
  /** Flou léger (périphérie visuelle). */
  blurPx?: number;
}

export interface VisualHack {
  id: string;
  nom: string;
  consigne: string;
  mecanisme_neuro: string;
  render: VisualHackRender;
}

export const VISUAL_HACKS: readonly VisualHack[] = [
  {
    id: "rotation-180",
    nom: "Rotation 180°",
    consigne: "Les puzzles du bloc s'affichent vus depuis le camp adverse. Avant chaque coup, nomme à voix haute la case d'arrivée en notation algébrique.",
    mecanisme_neuro: "La reconnaissance de patterns repose en partie sur une mémoire visuelle liée au point de vue habituel. Inverser l'orientation empêche la reconnaissance « par la forme » et oblige le cortex pariétal à recalculer les relations spatiales entre pièces, ce qui renforce une représentation indépendante du point de vue.",
    render: { rotate180: true },
  },
  {
    id: "inversion-cases",
    nom: "Inversion des couleurs de cases",
    consigne: "Cases claires et foncées sont permutées. Pour chaque fou, annonce sa couleur de cases AVANT de le déplacer.",
    mecanisme_neuro: "Le système visuel code la couleur des cases presque automatiquement. En la rendant trompeuse, on force le contrôle exécutif (cortex préfrontal) à vérifier explicitement la géométrie des diagonales au lieu de s'en remettre à l'habitude perceptive.",
    render: { invertSquares: true },
  },
  {
    id: "contraste-faible",
    nom: "Contraste réduit",
    consigne: "Les cases sont presque de la même teinte. Repère les diagonales en suivant les pièces, pas le damier.",
    mecanisme_neuro: "Quand l'indice de bas niveau (le damier) disparaît, l'attention se reporte sur les relations entre pièces : c'est précisément le niveau de représentation que l'on veut entraîner (« chunks » de relations plutôt que cases isolées).",
    render: { lowContrast: true },
  },
  {
    id: "contraste-maximal",
    nom: "Contraste maximal",
    consigne: "Damier noir et blanc pur, coordonnées masquées. Avant de résoudre, compte à voix haute les cases d'évasion du roi adverse.",
    mecanisme_neuro: "Un contraste extrême accélère la segmentation figure/fond ; combiné à la suppression des coordonnées, il oblige à reconstruire mentalement le repère de l'échiquier, ce qui sollicite la mémoire de travail spatiale.",
    render: { highContrast: true, hideCoordinates: true },
  },
  {
    id: "reduction-taille",
    nom: "Réduction de taille",
    consigne: "L'échiquier est réduit à 260 px. Résous sans te pencher vers l'écran : la position doit être saisie en un coup d'œil.",
    mecanisme_neuro: "Un échiquier plus petit tient entièrement dans la vision centrale (fovéa et parafovéa) : on entraîne la saisie globale de la position plutôt que l'exploration case par case par saccades oculaires.",
    render: { boardWidth: 260 },
  },
  {
    id: "masquage-pions",
    nom: "Pions invisibles",
    consigne: "Les pions sont masqués : leurs cases sont listées sous l'échiquier. Reconstruis mentalement la structure avant de chercher le coup.",
    mecanisme_neuro: "Retirer un élément visible force à le maintenir en mémoire de travail. On entraîne le « calepin visuo-spatial » (modèle de Baddeley) qui porte aussi le calcul de variantes.",
    render: { hiddenPieceTypes: ["p"] },
  },
  {
    id: "masquage-mineures",
    nom: "Pièces mineures invisibles",
    consigne: "Cavaliers et fous sont masqués (liste sous l'échiquier). Avant de jouer, dessine du doigt, en l'air, leurs lignes d'action.",
    mecanisme_neuro: "Même principe que pour les pions, appliqué aux pièces dont la géométrie est la moins intuitive : les reconstruire mentalement renforce la représentation de leurs rayons d'action.",
    render: { hiddenPieceTypes: ["n", "b"] },
  },
  {
    id: "masquage-lourdes",
    nom: "Pièces lourdes invisibles",
    consigne: "Dames et tours sont masquées (liste sous l'échiquier). Nomme les colonnes et rangées qu'elles contrôlent avant de chercher le coup.",
    mecanisme_neuro: "Les pièces lourdes portent les lignes de force : les masquer oblige à se représenter ces lignes comme des objets mentaux à part entière, ce qui prépare le calcul à l'aveugle.",
    render: { hiddenPieceTypes: ["r", "q"] },
  },
  {
    id: "niveaux-de-gris",
    nom: "Niveaux de gris",
    consigne: "Tout l'échiquier passe en niveaux de gris. Avant chaque puzzle, annonce le camp au trait et la pièce adverse la plus mal défendue.",
    mecanisme_neuro: "Supprimer la couleur retire un indice de « saillance » sur lequel l'attention s'appuie par défaut ; on entraîne une attention guidée par la fonction des pièces plutôt que par leur apparence.",
    render: { grayscale: true },
  },
  {
    id: "vision-floue",
    nom: "Vision floue",
    consigne: "L'échiquier est légèrement flouté. Identifie le squelette du pattern sur la silhouette des pièces, puis vérifie case par case.",
    mecanisme_neuro: "Les experts reconnaissent une position à partir de sa configuration grossière (basses fréquences spatiales) avant les détails. Le flou entraîne cette lecture globale, puis on vérifie avec la vision fine.",
    render: { blurPx: 1.6 },
  },
  {
    id: "sans-coordonnees",
    nom: "Sans coordonnées",
    consigne: "Coordonnées masquées. Note chaque coup de ta solution en notation algébrique AVANT de le jouer.",
    mecanisme_neuro: "La traduction case visuelle → nom de case doit devenir automatique pour le calcul à l'aveugle. Masquer l'aide externe oblige à consolider cette carte interne de l'échiquier.",
    render: { hideCoordinates: true },
  },
  {
    id: "rotation-gris",
    nom: "Rotation + niveaux de gris",
    consigne: "Échiquier retourné ET sans couleur. Résous lentement : la précision prime sur la vitesse.",
    mecanisme_neuro: "Combiner deux perturbations empêche tout automatisme résiduel ; c'est une « difficulté désirable » (Bjork) : la performance immédiate baisse, la rétention à long terme progresse.",
    render: { rotate180: true, grayscale: true },
  },
  {
    id: "petit-sans-coordonnees",
    nom: "Petit format sans repères",
    consigne: "Échiquier réduit et sans coordonnées. Annonce la ligne complète avant de toucher une pièce.",
    mecanisme_neuro: "Saisie globale (petit format) et carte interne des cases (pas de coordonnées) travaillées en même temps : on se rapproche des conditions de la cécité partielle.",
    render: { boardWidth: 280, hideCoordinates: true },
  },
  {
    id: "inversion-rotation",
    nom: "Inversion + rotation",
    consigne: "Cases inversées et échiquier retourné. Avant chaque coup, vérifie la couleur de case de chaque pièce que tu déplaces.",
    mecanisme_neuro: "La double perturbation désautomatise à la fois l'orientation et la lecture des diagonales : le contrôle volontaire reprend la main sur la perception.",
    render: { invertSquares: true, rotate180: true },
  },
];

const BY_ID = new Map(VISUAL_HACKS.map((h) => [h.id, h]));

export function getVisualHack(id: string): VisualHack {
  const hack = BY_ID.get(id);
  if (!hack) throw new Error(`Hack visuel inconnu : ${id}`);
  return hack;
}
