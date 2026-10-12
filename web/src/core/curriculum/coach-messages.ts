/**
 * Catalogue des messages du Coach Virtuel pour `CourseTreeViewer` — ton
 * « Grand Maître bienveillant mais exigeant », public 1500-1800 Elo.
 *
 * Indexé par PROFIL de performance (quand dans la partie, avec quelle
 * précision), puis par SITUATION (ce que l'utilisateur vient de faire). Chaque
 * situation a plusieurs variantes pour éviter la monotonie ; `pickCoachFeedback`
 * en choisit une de façon DÉTERMINISTE (graine = ply du nœud, par exemple) :
 * pas de `Math.random`, sinon le rendu serveur et le rendu client divergent.
 *
 * Les concepts cités renvoient aux livres de référence sans les citer mot pour
 * mot : Flores Rios (reconnaître la structure de pions et le plan qui va avec),
 * Watson (les règles générales cèdent devant la position concrète, le
 * dynamisme), Ntirlis (prophylaxie, demander ce que veut l'adversaire,
 * améliorer sa pire pièce).
 *
 * Gabarits : `{coup}` = numéro de coup, `{san}` = coup en notation algébrique
 * (texte brut, jamais de figurine). Règles d'injection dans `[%txt "…"]` :
 * aucun guillemet droit dans un message (vérifié par `coach-messages.test.ts`).
 */

export type CoachProfile = "crackPrecoce" | "crapaudDuCoup12" | "endurant" | "modeSurprise";

export interface CoachProfileConfig {
  /** Nom lisible du profil, pour un éventuel badge. */
  label: string;
  /** Quand le profil s'applique (documentation de la règle de sélection, voir `resolveCoachProfile`). */
  when: string;
  /** Situation -> variantes de messages. */
  situations: Record<string, readonly string[]>;
}

export const COACH_FEEDBACKS = {
  crackPrecoce: {
    label: "Regard sur le passé : le crack précoce",
    when: "Erreur avant le coup 6, en pleine théorie.",
    situations: {
      /** Coup passif ou hors répertoire. */
      coupPassifOuHorsRepertoire: [
        "Déjà en train d'improviser au coup {coup} ? La théorie n'est pas une option ici. Remets de l'ordre dans tes cavaliers.",
        "{san} au coup {coup}... Créatif, je te l'accorde. Mais l'ouverture n'est pas le moment de composer : elle se récite, puis elle se comprend.",
        "Au coup {coup}, chaque temps compte double. Un coup qui ne développe rien ni ne conteste le centre, c'est un cadeau à l'adversaire.",
        "Tu connais la règle : on ne bouge pas deux fois la même pièce dans l'ouverture... sauf si la position l'exige. Ici, elle ne l'exige pas.",
        "Halte ! Avant de jouer, pose-toi la question de base : quel est le plan de cette ouverture ? {san} ne le sert pas.",
      ],
      /** Bon coup trouvé après un ou plusieurs échecs. */
      bonCoupApresEchec: [
        "Voilà. {san}, c'est le coup du livre. Répète-le encore deux fois demain et il ne te quittera plus.",
        "Bien rattrapé. La mémoire d'ouverture se construit exactement comme ça : une erreur, une correction, une répétition.",
        "C'est mieux. Retiens moins le coup que sa raison : quand tu sais pourquoi {san}, tu ne l'oublies plus.",
        "Correct. La rigueur, ce n'est pas ne jamais se tromper, c'est ne jamais se tromper deux fois au même endroit.",
        "Te voilà revenu sur les rails. Une machine bien huilée ne réfléchit pas aux six premiers coups : elle les joue.",
      ],
    },
  },
  crapaudDuCoup12: {
    label: "Diagnostic intermédiaire : le crapaud du coup 12",
    when: "Première gaffe entre les coups 6 et 12, à la sortie de la théorie.",
    situations: {
      /** Première gaffe en transition vers le milieu de jeu. */
      premiereGaffeTransition: [
        "Tu calcules bien les tactiques, mais tu as oublié de regarder ta structure de pions. C'est elle qui te dit quel plan suivre, pas l'inspiration du moment.",
        "Coup {coup} : la théorie s'arrête et ton plan aussi. Réflexe de Flores Rios : identifie la structure, et le plan suit tout seul.",
        "Fatigue stratégique repérée. Avant {san}, il fallait se demander ce que voulait l'adversaire. La prophylaxie n'est pas réservée aux grands maîtres.",
        "Les six premiers coups étaient parfaits, et puis le vide. C'est classique : quand le livre se ferme, cherche ta pire pièce et améliore-la.",
        "Tu as joué un bon coup général dans une position qui demandait un coup concret. Les règles sont des guides, pas des lois : la position a toujours le dernier mot.",
      ],
    },
  },
  endurant: {
    label: "Les félicitations du maître : l'endurant",
    when: "Au-delà du coup 12 avec plus de 90 % de précision.",
    situations: {
      /** Série de bons coups dans une ligne de club complexe. */
      serieDeBonsCoups: [
        "Magnifique. Tenir cette précision au coup {coup} prouve que les 1800 Elo ne sont plus très loin.",
        "Tu ne joues plus des coups, tu joues un plan. C'est exactement la différence entre un joueur de club et un joueur de tournoi.",
        "Coup {coup}, et toujours aucune pièce oubliée. Ta vision géométrique tient la distance, c'est rare à ce niveau.",
        "Bravo. {san} montre que tu as compris la structure, pas seulement mémorisé la ligne. Garde ce rythme.",
        "L'adversaire a cherché à t'user, tu as répondu par la précision. L'endurance, c'est aussi une compétence d'ouverture.",
      ],
    },
  },
  modeSurprise: {
    label: "Mode surprise : la punition de la déviation",
    when: "L'utilisateur trouve du premier coup la réfutation d'un coup mou adverse.",
    situations: {
      /** Réfutation trouvée instantanément. */
      refutationInstantanee: [
        "Boom ! C'est exactement comme ça qu'on punit la passivité à ce niveau. L'adversaire a perdu un temps, tu ouvres le centre et la fête commence.",
        "Du premier coup ! {san}, net et sans bavure. Un temps perdu par l'adversaire, c'est une porte ouverte : tu l'as franchie.",
        "Voilà ce que j'appelle de l'opportunisme sain. Quand l'adversaire joue mou, on frappe tout de suite, pas au coup suivant.",
        "Réfutation trouvée sans hésiter. Ton adversaire de club va passer un mauvais quart d'heure, et c'est mérité.",
        "Parfait. Tu as vu la faiblesse avant même l'indice. C'est ça, lire la position au lieu de réciter.",
      ],
    },
  },
} as const satisfies Record<CoachProfile, CoachProfileConfig>;

/** Coup avant lequel une erreur relève du crack précoce. */
export const EARLY_CRACK_BEFORE_MOVE = 6;
/** Coup après lequel on entre dans le territoire de l'endurant. */
export const ENDURANCE_AFTER_MOVE = 12;
/** Précision minimale (en %) pour être félicité en endurant. */
export const ENDURANCE_MIN_ACCURACY = 90;

/**
 * Profil à appliquer pour un coup de l'utilisateur. `isSurprise` = le nœud
 * précédent porte des indices (`ChessMoveNode.hints`), donc une faute adverse
 * à punir : ce cas prime sur le moment de la partie.
 */
export function resolveCoachProfile(input: {
  moveNumber: number;
  accuracy: number | null;
  isSurprise: boolean;
}): CoachProfile | null {
  if (input.isSurprise) return "modeSurprise";
  if (input.moveNumber < EARLY_CRACK_BEFORE_MOVE) return "crackPrecoce";
  if (input.moveNumber <= ENDURANCE_AFTER_MOVE) return "crapaudDuCoup12";
  if (input.accuracy !== null && input.accuracy > ENDURANCE_MIN_ACCURACY) return "endurant";
  return null;
}

/**
 * Choisit une variante (graine stable, ex. le ply du nœud) et remplit les
 * gabarits. Renvoie `null` si la situation n'existe pas pour ce profil.
 */
export function pickCoachFeedback<P extends CoachProfile>(
  profile: P,
  situation: keyof (typeof COACH_FEEDBACKS)[P]["situations"],
  seed: number,
  fill: { coup?: number; san?: string } = {},
): string | null {
  const variants = (COACH_FEEDBACKS[profile].situations as Record<string, readonly string[]>)[situation as string];
  if (!variants || variants.length === 0) return null;
  const template = variants[Math.abs(Math.trunc(seed)) % variants.length];
  return template.replaceAll("{coup}", String(fill.coup ?? "")).replaceAll("{san}", fill.san ?? "ce coup");
}
