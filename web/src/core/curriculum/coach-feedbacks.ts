/**
 * Catalogue OFFICIEL des messages du Coach Virtuel pour `CourseTreeViewer`.
 *
 * Ton : un Grand Maître exigeant, candide, parfois piquant, mais profondément
 * bienveillant. Public : joueurs de club 1500-1800 Elo. Chaque message accroche
 * un concept de nos livres de référence, sans les citer mot pour mot :
 * - Flores Rios : reconnaître la structure de pions (pion isolé, pions
 *   pendants, Carlsbad, chaîne française...) et en déduire le plan ;
 * - Ntirlis : prophylaxie, « que veut l'adversaire ? », améliorer sa pire pièce ;
 * - Watson : les règles ne sont que des tendances, la position concrète et le
 *   dynamisme ont le dernier mot.
 *
 * Organisation : PROFIL (moment de la partie + qualité du jeu) -> SITUATION
 * (ce que l'utilisateur vient de faire) -> variantes. Chaque situation déclare
 * son `outcome` (`echec` / `succes`) pour que l'interface choisisse la teinte
 * du volet sans connaître le profil.
 *
 * Gabarits : `{coup}` = numéro de coup, `{san}` = coup en notation algébrique
 * (texte brut, jamais de figurine), `{precision}` = précision entière en %.
 * Les messages sont injectables tels quels dans `[%txt "…"]` : aucun guillemet
 * droit (vérifié par `coach-feedbacks.test.ts`).
 *
 * Le tirage est DÉTERMINISTE (graine = ply du nœud, par exemple) : pas de
 * `Math.random`, sinon le rendu serveur et le rendu client divergent.
 */

export type CoachProfile = "amnesiePrecoce" | "essoufflementPositionnel" | "murDeBriques" | "modeSurprise";

/** Issue du coup de l'utilisateur, telle que l'interface doit la colorer. */
export type CoachOutcome = "echec" | "succes";

export interface CoachSituationConfig {
  /** Issue du coup : pilote la teinte du volet de feedback. */
  outcome: CoachOutcome;
  /** Déclencheur de la situation, en clair (documentation). */
  trigger: string;
  /** Variantes interchangeables (au moins 4, vérifié par le test). */
  variants: readonly string[];
}

export interface CoachProfileConfig {
  /** Nom lisible du profil, pour un éventuel badge. */
  label: string;
  /** Règle d'application du profil (voir `resolveCoachSlot`). */
  when: string;
  situations: Record<string, CoachSituationConfig>;
}

export const COACH_FEEDBACKS = {
  amnesiePrecoce: {
    label: "Amnésie précoce",
    when: "Erreur dans les six premiers coups (ply 12 inclus), en pleine théorie.",
    situations: {
      /** Coup passif ou hors répertoire dans l'ouverture. */
      echecHorsRepertoire: {
        outcome: "echec",
        trigger: "Coup refusé avant le ply 13 : passif ou hors répertoire.",
        variants: [
          "Déjà en train d'inventer la théorie au coup {coup} ? Tes cavaliers réclament de la discipline, pas de l'inspiration.",
          "{san} au coup {coup}... Audacieux. Faux, mais audacieux. L'ouverture ne s'improvise pas : elle se récite d'abord, elle se comprend ensuite.",
          "Coup {coup} et tu as déjà quitté la carte. Chaque temps perdu ici, l'adversaire l'encaisse au centre, avec les intérêts.",
          "Watson dit que les règles ne sont que des tendances. Il parlait de positions que l'on comprend, pas d'un trou de mémoire au coup {coup}.",
          "Ton répertoire existe pour t'épargner de réfléchir maintenant et garder ton énergie pour le coup 20. {san} gaspille les deux.",
          "Une pièce qui bouge deux fois, un pion de flanc qui part en promenade, et tout le plan de l'ouverture s'effondre. Reprends la ligne depuis le début.",
        ],
      },
      /** Bon coup trouvé après un ou plusieurs échecs sur le même nœud. */
      succesCorrection: {
        outcome: "succes",
        trigger: "Bon coup trouvé après au moins un échec, avant le ply 13.",
        variants: [
          "Voilà, {san}. Les six premiers coups doivent sortir comme un réflexe, sans délibération. Rejoue la ligne demain, à froid.",
          "Bien rattrapé. Une ouverture, c'est de la mémoire musculaire : erreur, correction, répétition. Tu viens de faire les deux premières étapes.",
          "Correct. Retiens moins le coup que sa raison : quand tu sais pourquoi {san}, tu ne l'oublies plus.",
          "C'est mieux. La rigueur, ce n'est pas ne jamais se tromper, c'est ne jamais se tromper deux fois au même endroit.",
          "Retour sur les rails. Un joueur de tournoi ne réfléchit pas au coup {coup} : il le joue, et garde sa pendule pour le milieu de jeu.",
        ],
      },
    },
  },
  essoufflementPositionnel: {
    label: "L'essoufflement positionnel",
    when: "Première erreur de la partie entre les coups 12 et 15 inclus.",
    situations: {
      /** Fatigue stratégique : la tactique a pris le pas sur la structure. */
      echecFatigueStrategique: {
        outcome: "echec",
        trigger: "Premier coup refusé de la partie, entre les coups 12 et 15.",
        variants: [
          "Tu as calculé trois variantes tactiques, mais tu as oublié ta structure de pions. Pion isolé, pions pendants ou chaîne : c'est ici que Flores Rios s'applique.",
          "Coup {coup} : la partie ne se gagne plus à coups de petites combinaisons. Lève le nez et demande-toi quelle case faible le sera encore dans vingt coups.",
          "Fatigue stratégique repérée. Avant {san}, la question de Ntirlis s'imposait : que veut l'adversaire ? Tu ne te l'es pas posée, il va te répondre.",
          "Tu as joué {san} parce qu'il avait l'air actif. Actif n'est pas synonyme de bon : ta pire pièce dort toujours, c'est elle qu'il fallait réveiller.",
          "Le calcul ne suffit plus au coup {coup}. Ici, les fautes ne se voient pas tout de suite : une case cédée, un pion fixé, et la facture arrive dix coups plus tard.",
          "Watson le répète : la position concrète prime sur les principes. Mais oublier sa structure, ce n'est pas du dynamisme, c'est de la distraction.",
        ],
      },
    },
  },
  murDeBriques: {
    label: "Le mur de briques",
    when: "Plus de 12 coups joués avec une précision supérieure à 90 %.",
    situations: {
      /** Félicitations de l'endurant : précision tenue sur la durée. */
      succesEndurance: {
        outcome: "succes",
        trigger: "Coup juste après plus de 12 coups joués, précision > 90 %.",
        variants: [
          "Magnifique. Tenir {precision} % de précision au coup {coup} prouve que les 1800 Elo approchent à grands pas. Ton sens des cases fortes est digne d'un joueur de tournoi.",
          "Tu ne joues plus des coups, tu joues un plan. Flores Rios serait content : chaque pièce sait ce que la structure attend d'elle.",
          "Coup {coup}, et toujours aucune case cédée gratuitement. C'est ça, un mur de briques : rien de spectaculaire, tout est solide.",
          "Bravo. {san} montre que tu as compris la position, pas seulement mémorisé la ligne. La prophylaxie de Ntirlis, tu l'appliques sans même y penser.",
          "L'adversaire a cherché à t'user, tu as répondu par la constance. À ce niveau, l'endurance positionnelle vaut plus que n'importe quelle combinaison.",
          "Plus de douze coups sans fléchir. Beaucoup de joueurs de club s'effondrent ici ; toi, tu améliores encore tes pièces. Continue.",
        ],
      },
    },
  },
  modeSurprise: {
    label: "Mode surprise : la punition des erreurs de club",
    when: "L'utilisateur trouve du premier coup la réfutation d'un coup mou adverse.",
    situations: {
      /** Réfutation trouvée du premier coup. */
      succesRefutation: {
        outcome: "succes",
        trigger: "Coup juste du premier essai, sur un nœud qui punit une faute adverse.",
        variants: [
          "Boom ! C'est exactement comme ça qu'on punit la passivité. L'adversaire perd un temps, tu ouvres le centre, le massacre commence.",
          "Du premier coup ! {san}, net et sans bavure. Un temps perdu par l'adversaire, c'est une porte ouverte : tu viens de l'enfoncer.",
          "Voilà de l'opportunisme sain. Quand l'adversaire joue mou, on frappe tout de suite, pas au coup suivant. Watson appellerait ça du dynamisme pur.",
          "Réfutation trouvée sans trembler. Ton adversaire de club va passer un mauvais quart d'heure, et il l'a bien cherché.",
          "Parfait. Tu as senti la faiblesse avant même l'indice. Un coup passif ne se commente pas : il se sanctionne.",
        ],
      },
    },
  },
} as const satisfies Record<CoachProfile, CoachProfileConfig>;

type Catalog = typeof COACH_FEEDBACKS;

/** Couple profil + situation valide, au sens du catalogue (union discriminée). */
export type CoachSlot = {
  [P in CoachProfile]: { profile: P; situation: keyof Catalog[P]["situations"] & string };
}[CoachProfile];

/** Dernier ply (inclus) de l'amnésie précoce : les six premiers coups des deux camps. */
export const EARLY_AMNESIA_MAX_PLY = 12;
/** Fenêtre (coups inclus) de l'essoufflement positionnel. */
export const POSITIONAL_FATIGUE_MOVES = { from: 12, to: 15 } as const;
/** Nombre de coups de l'utilisateur à DÉPASSER pour entrer dans le mur de briques. */
export const BRICK_WALL_MIN_MOVES = 12;
/** Précision (en %) à DÉPASSER pour le mur de briques. */
export const BRICK_WALL_MIN_ACCURACY = 90;

export interface CoachContext {
  /** Ply absolu du coup de l'utilisateur (1 = premier coup blanc), décalage de chapitre inclus. */
  ply: number;
  /** Le coup joué est-il le coup attendu ? */
  outcome: CoachOutcome;
  /** Succès obtenu après au moins un échec sur ce même nœud. */
  afterFailure: boolean;
  /** Aucune erreur de l'utilisateur avant celle-ci dans la partie. */
  isFirstError: boolean;
  /** Le nœud précédent est un coup mou adverse à punir (il porte des indices). */
  isSurprise: boolean;
  /** Coups de l'utilisateur joués depuis le début du chapitre, celui-ci compris. */
  userMovesPlayed: number;
  /** Précision cumulée en %, `null` tant qu'elle n'est pas mesurable. */
  accuracy: number | null;
}

/**
 * Situation du catalogue à afficher pour un coup, ou `null` quand le coach
 * doit se taire (un coach qui commente tout ne se lit plus). Priorités :
 * réfutation trouvée > amnésie précoce > essoufflement > mur de briques.
 */
export function resolveCoachSlot(ctx: CoachContext): CoachSlot | null {
  const moveNumber = Math.ceil(ctx.ply / 2);

  if (ctx.outcome === "succes" && ctx.isSurprise && !ctx.afterFailure) {
    return { profile: "modeSurprise", situation: "succesRefutation" };
  }
  if (ctx.ply <= EARLY_AMNESIA_MAX_PLY) {
    if (ctx.outcome === "echec") return { profile: "amnesiePrecoce", situation: "echecHorsRepertoire" };
    if (ctx.afterFailure) return { profile: "amnesiePrecoce", situation: "succesCorrection" };
    return null;
  }
  if (
    ctx.outcome === "echec" &&
    ctx.isFirstError &&
    moveNumber >= POSITIONAL_FATIGUE_MOVES.from &&
    moveNumber <= POSITIONAL_FATIGUE_MOVES.to
  ) {
    return { profile: "essoufflementPositionnel", situation: "echecFatigueStrategique" };
  }
  if (
    ctx.outcome === "succes" &&
    ctx.userMovesPlayed > BRICK_WALL_MIN_MOVES &&
    ctx.accuracy !== null &&
    ctx.accuracy > BRICK_WALL_MIN_ACCURACY
  ) {
    return { profile: "murDeBriques", situation: "succesEndurance" };
  }
  return null;
}

export interface CoachMessage {
  profile: CoachProfile;
  label: string;
  outcome: CoachOutcome;
  text: string;
}

/**
 * Tire une variante (graine stable, ex. le ply du nœud) et remplit les
 * gabarits. Un gabarit sans valeur fournie retombe sur une formule neutre,
 * jamais sur une accolade visible.
 */
export function pickCoachMessage(
  slot: CoachSlot,
  seed: number,
  fill: { coup?: number; san?: string; precision?: number } = {},
): CoachMessage {
  const profile: CoachProfileConfig = COACH_FEEDBACKS[slot.profile];
  const situation = profile.situations[slot.situation];
  const template = situation.variants[Math.abs(Math.trunc(seed)) % situation.variants.length];
  const text = template
    .replaceAll("{coup}", fill.coup === undefined ? "ce stade" : String(fill.coup))
    .replaceAll("{san}", fill.san ?? "ce coup")
    .replaceAll("{precision}", fill.precision === undefined ? "plus de 90" : String(Math.round(fill.precision)));
  return { profile: slot.profile, label: profile.label, outcome: situation.outcome, text };
}
