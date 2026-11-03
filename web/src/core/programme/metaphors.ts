/**
 * Bibliothèque des métaphores du Palais de mémoire (méthode des loci).
 *
 * Tout le programme habite UNE seule ville, la Cité de l'Échiquier, découpée
 * en quartiers : chaque concept positionnel y est un lieu précis, et un lieu
 * n'est jamais créé pour un seul cours. `programme-content.test.ts` impose
 * cette règle : toute métaphore introduite doit être réactivée par un cours
 * ultérieur (`rappels`), et un rappel ne peut viser qu'un lieu déjà visité.
 *
 * L'ordre des quartiers suit le parcours d'un visiteur : on entre par la
 * Cathédrale (les lignes), on longe les Remparts (les pions), on traverse le
 * Jardin (les finales de pions), l'Atelier (la tactique), le Sanctuaire (les
 * cases), on assiège le Donjon (le roi) et on finit sur les Remparts de la
 * Tour (les finales de tours). Les phases suivantes ajoutent des quartiers
 * sans jamais redessiner ceux-ci.
 */

export type Quarter =
  | "cathedrale"
  | "remparts"
  | "jardin"
  | "atelier"
  | "sanctuaire"
  | "donjon"
  | "tour";

export interface Metaphor {
  id: string;
  nom: string;
  quartier: Quarter;
  /** Concept échiquéen représenté. */
  concept: string;
  /** L'image architecturale à construire mentalement — une phrase, toujours la même. */
  image: string;
}

export const QUARTER_LABEL: Record<Quarter, string> = {
  cathedrale: "La Cathédrale Linéaire",
  remparts: "Les Remparts",
  jardin: "Le Jardin du Triangle d'Or",
  atelier: "L'Atelier du Charpentier",
  sanctuaire: "Le Sanctuaire",
  donjon: "Le Donjon",
  tour: "Les Remparts de la Tour",
};

export const METAPHOR_LIBRARY: readonly Metaphor[] = [
  // ── La Cathédrale Linéaire : colonnes, rangées, batteries ──────────────────
  { id: "nef", nom: "La Nef", quartier: "cathedrale", concept: "colonne ouverte", image: "Une colonne sans pion est la nef d'une cathédrale : une allée libre de l'entrée jusqu'au chœur, que la première tour à y entrer contrôle tout entière." },
  { id: "tribune", nom: "La Tribune", quartier: "cathedrale", concept: "7e rangée", image: "La 7e rangée est la tribune qui surplombe la nef : une tour qui y monte voit tous les pions adverses d'en haut, alignés comme des fidèles sur un banc." },
  { id: "canon", nom: "Le Canon", quartier: "cathedrale", concept: "batterie Dame + Tour / tours doublées", image: "Deux pièces lourdes alignées sur la même ligne forment un canon : la pièce de derrière est la poudre, celle de devant le boulet." },
  { id: "crypte", nom: "La Crypte scellée", quartier: "cathedrale", concept: "mat du couloir", image: "Le roi roqué derrière ses trois pions intacts dort dans une crypte : la dalle (sa dernière rangée) est la seule issue, et une tour suffit à la sceller." },
  { id: "bas-cote", nom: "Le Bas-côté", quartier: "cathedrale", concept: "colonne semi-ouverte", image: "Une colonne où ne reste qu'un pion adverse est un bas-côté : on y avance à couvert, le long du mur, jusqu'au pilier (le pion) que l'on vient frapper." },
  { id: "pierre-descellee", nom: "La Pierre descellée", quartier: "cathedrale", concept: "pièce non défendue", image: "Une pièce sans défenseur est une pierre descellée dans la voûte : rien ne la tient, le moindre choc la fait tomber." },

  // ── Les Remparts : structures de pions ─────────────────────────────────────
  { id: "muraille", nom: "La Muraille fortifiée", quartier: "remparts", concept: "chaîne de pions", image: "Une chaîne de pions en diagonale est une muraille en escalier : chaque pierre est tenue par celle d'en dessous, et seule la pierre d'angle, à la base, n'est tenue par rien." },
  { id: "phare", nom: "Le Phare", quartier: "remparts", concept: "pion isolé", image: "Le pion isolé est un phare sur un rocher : il éclaire loin (cases d'avant-poste, colonnes ouvertes autour) mais aucun voisin ne viendra le défendre ; la case devant lui est son seuil, où l'adversaire amarre un bloqueur." },
  { id: "colonnes-jumelles", nom: "Les Colonnes jumelles", quartier: "remparts", concept: "pions doublés", image: "Deux pions doublés sont deux colonnes l'une derrière l'autre : de face on n'en voit qu'une, elles ne se protègent pas, et la colonne voisine reste vide." },
  { id: "escalier", nom: "L'Escalier du Belvédère", quartier: "remparts", concept: "pion passé", image: "Le pion passé gravit un escalier dont aucune porte ne ferme la cage : chaque marche le rapproche du belvédère (la case de promotion), et l'adversaire ne peut que se placer DEVANT lui pour le bloquer." },
  { id: "cour-carree", nom: "La Cour carrée", quartier: "remparts", concept: "règle du carré", image: "Le pion passé trace devant lui une cour carrée dont un côté est son chemin vers le belvédère : si le roi adverse peut entrer dans la cour au prochain pas, il rattrape le pion ; sinon, la course est perdue." },

  // ── Le Jardin du Triangle d'Or : finales de pions ──────────────────────────
  { id: "vis-a-vis", nom: "Le Vis-à-vis", quartier: "jardin", concept: "opposition", image: "Deux rois face à face avec une seule dalle entre eux sont deux statues qui se regardent : celle qui ne doit PAS bouger a gagné, l'autre doit céder le passage." },
  { id: "triangle-or", nom: "Le Triangle d'or", quartier: "jardin", concept: "triangulation", image: "Le roi qui parcourt trois cases en triangle perd un temps sans changer de place : c'est le triangle d'or, l'allée du jardin qui ramène au même banc avec le trait passé à l'adversaire." },
  { id: "roi-jardinier", nom: "Le Roi jardinier", quartier: "jardin", concept: "roi actif en finale", image: "En finale, le roi quitte le donjon et devient jardinier : il marche au centre du jardin, d'où il atteint chaque parterre en un minimum de pas." },
  { id: "allee-eloignee", nom: "L'Allée éloignée", quartier: "jardin", concept: "pion passé éloigné", image: "Le pion passé éloigné est un leurre planté au bout de l'allée la plus lointaine : le roi adverse doit aller le chercher, et pendant ce temps le jardin principal reste sans gardien." },
  { id: "breche", nom: "La Brèche", quartier: "jardin", concept: "percée de pions", image: "Trois pions contre trois en face : on sacrifie une pierre pour ouvrir une brèche dans la haie, et le pion qui passe par le trou ne peut plus être rattrapé." },
  { id: "porte-tournante", nom: "La Porte tournante", quartier: "jardin", concept: "zugzwang", image: "Le zugzwang est une porte tournante : celui qui doit la pousser se retrouve dehors, alors que rester immobile l'aurait sauvé." },

  // ── L'Atelier du Charpentier : motifs tactiques ────────────────────────────
  { id: "epingle", nom: "L'Épingle de charpente", quartier: "atelier", concept: "clouage", image: "Le clouage est une cheville enfoncée à travers une poutre jusqu'au mur porteur : la poutre (la pièce clouée) ne peut plus bouger sans que le mur (la pièce derrière) s'effondre." },
  { id: "broche", nom: "La Broche", quartier: "atelier", concept: "enfilade", image: "L'enfilade est une broche qui traverse d'abord la pièce la plus lourde : quand elle s'écarte, la broche ressort et embroche celle qui était cachée derrière." },
  { id: "carrefour", nom: "Le Carrefour", quartier: "atelier", concept: "fourchette / double attaque", image: "La fourchette est un carrefour d'où partent deux rues : la pièce qui s'y pose menace les deux maisons au bout des rues, et l'adversaire ne peut en barricader qu'une." },
  { id: "porte-derobee", nom: "La Porte dérobée", quartier: "atelier", concept: "attaque à la découverte / échec double", image: "La découverte est une porte dérobée : la pièce qui s'écarte ouvre un passage secret à la pièce de derrière, et les deux frappent en même temps." },
  { id: "cage", nom: "La Cage", quartier: "atelier", concept: "pièce piégée / pièce sans case de fuite", image: "Une pièce dont toutes les cases de fuite sont contrôlées est un oiseau en cage : on n'a pas besoin de l'attaquer tout de suite, on ferme la porte puis on vient la chercher." },
  { id: "pilier-surcharge", nom: "Le Pilier surchargé", quartier: "atelier", concept: "surcharge / déviation / élimination du défenseur", image: "Un défenseur qui tient deux arcs à la fois est un pilier surchargé : on le fait céder d'un côté (déviation) ou on l'abat (élimination), et la voûte qu'il soutenait s'écroule." },

  // ── Le Sanctuaire : cases, pièces mineures ─────────────────────────────────
  { id: "sanctuaire", nom: "Le Sanctuaire", quartier: "sanctuaire", concept: "case faible / avant-poste", image: "Une case faible dans le camp adverse est un sanctuaire : aucun pion ennemi ne pourra jamais y entrer, et le cavalier qui s'y installe y est intouchable." },
  { id: "tour-de-guet", nom: "La Tour de guet", quartier: "sanctuaire", concept: "fianchetto / grande diagonale", image: "Le fou en fianchetto est une tour de guet sur la colline : de sa plate-forme (b2, g2, b7, g7) il voit toute la grande diagonale jusqu'à l'autre bout de la ville." },
  { id: "vitrail", nom: "Le Vitrail", quartier: "sanctuaire", concept: "bon et mauvais fou", image: "Chaque fou ne voit qu'une couleur de verre du vitrail ; si ses propres pions sont posés sur ses vitres, il est emmuré derrière un vitrail opaque : c'est le mauvais fou." },
  { id: "deux-vitraux", nom: "Les Deux Vitraux", quartier: "sanctuaire", concept: "paire de fous", image: "La paire de fous éclaire les deux couleurs du vitrail à la fois : aucune case ne reste dans l'ombre, et plus la cathédrale s'ouvre, plus la lumière porte loin." },

  // ── Le Donjon : sécurité et attaque du roi ─────────────────────────────────
  { id: "donjon-eventre", nom: "Le Donjon éventré", quartier: "donjon", concept: "roi exposé", image: "Un roi privé de ses pions-boucliers vit dans un donjon éventré : chaque brèche dans le mur est une ligne d'attaque directe vers sa chambre." },
  { id: "belier", nom: "Le Bélier", quartier: "donjon", concept: "attaque de pions sur le roi", image: "Les pions qui marchent sur le roque adverse sont un bélier : on ne cherche pas à les garder, on cherche à enfoncer la porte pour ouvrir des colonnes." },
  { id: "chambre-close", nom: "La Chambre close", quartier: "donjon", concept: "mat à l'étouffée / figures de mat", image: "Le roi entouré de ses propres pièces est dans une chambre close : ses meubles bloquent toutes les sorties, et un seul cavalier qui entre par la fenêtre suffit." },
  { id: "pont-levis", nom: "Le Pont-levis", quartier: "donjon", concept: "attraction / sacrifice d'ouverture", image: "Le sacrifice d'attraction est un pont-levis abaissé : on offre une pièce pour forcer le roi à sortir sur le pont, là où toutes nos pièces l'attendent." },

  // ── Les Remparts de la Tour : finales de tours ─────────────────────────────
  { id: "tour-sentinelle", nom: "La Tour sentinelle", quartier: "tour", concept: "tour active / tour derrière le pion passé", image: "En finale, la tour est une sentinelle qui patrouille derrière le pion passé : plus le pion monte, plus son chemin de ronde s'allonge, alors que la tour placée devant voit le sien rétrécir." },
  { id: "pont-lucena", nom: "Le Pont de Lucena", quartier: "tour", concept: "position de Lucena", image: "Lucena, c'est construire un pont : la tour se pose sur la 4e rangée comme une arche, et le roi passe dessous à l'abri des échecs latéraux." },
  { id: "rempart-philidor", nom: "Le Rempart de Philidor", quartier: "tour", concept: "position de Philidor", image: "Philidor, c'est un rempart sur la 6e rangée : la tour défenseuse barre le passage au roi adverse, puis, dès que le pion avance, redescend frapper par l'arrière." },
  { id: "fosse", nom: "La Fosse", quartier: "tour", concept: "coupure du roi", image: "La tour qui coupe le roi adverse le long d'une colonne creuse une fosse : il ne peut plus franchir cette ligne, et chaque colonne de distance est une colonne de retard dans la course." },
];

const BY_ID = new Map(METAPHOR_LIBRARY.map((m) => [m.id, m]));

export function getMetaphor(id: string): Metaphor {
  const metaphor = BY_ID.get(id);
  if (!metaphor) throw new Error(`Métaphore inconnue : ${id}`);
  return metaphor;
}

export function hasMetaphor(id: string): boolean {
  return BY_ID.has(id);
}
