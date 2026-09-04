import type { CurriculumCategoryMeta } from "./catalog";
import type { CurriculumThemeOverview } from "@/server/queries/curriculum";

/**
 * Contenu de la « Page de Cours » affichée AVANT les exercices d'un thème
 * (`ThemeLesson`, voir `client/features/learn/theme-lesson.tsx`) — le manque
 * pédagogique identifié à l'audit UX du 2026-09-02 : l'utilisateur ne doit
 * plus tomber directement sur l'échiquier sans qu'on lui ait d'abord expliqué
 * le concept.
 *
 * Deux sources, jamais un thème sans page de cours :
 *  - `CURATED_LESSONS` : rédaction à la main, un texte réellement pédagogique
 *    (Objectif + Idées clés) pour les thèmes stratégiques où l'absence de
 *    cours théorique est la plus pénalisante — les 30 thèmes `positional_mastery`
 *    et les 5 thèmes "finale de pions" de `endgame_mastery` (ceux qui portent
 *    le tag Lichess `pawnEndgame`, voir `catalog.ts`).
 *  - `resolveLessonContent` : pour tout thème SANS entrée curatée (les ~180
 *    thèmes tactiques/mats/sparring restants, où le nom du motif est déjà
 *    auto-suffisant), un gabarit généré depuis les données déjà en base
 *    (`title`/`description`/`level`/catégorie) — jamais une page vide.
 */
export interface LessonContent {
  objective: string;
  keyIdeas: readonly string[];
}

/** Clé = `CurriculumThemeOverview.id` (ex. `pm-le-mauvais-fou`, `eg-la-regle-du-carre`). */
export const CURATED_LESSONS: Record<string, LessonContent> = {
  "pm-l-avant-poste-du-cavalier": {
    objective:
      "Reconnaître une case avancée que l'adversaire ne peut plus jamais chasser avec un pion, et y installer un cavalier qui vaudra durablement plus qu'un fou.",
    keyIdeas: [
      "Un avant-poste est une case (souvent au milieu de l'échiquier, sur la 4e/5e rangée pour vous) qu'aucun pion adverse ne peut plus attaquer — vérifiez toujours les deux pions voisins avant de vous y installer.",
      "Un cavalier centralisé sur un avant-poste rayonne sur 8 cases à la fois et devient quasiment impossible à déloger sans un échange favorable pour vous.",
      "Préparez l'avant-poste avant de vous y précipiter : échangez d'abord le fou ou le cavalier adverse qui pourrait le contester.",
      "Un avant-poste sans plan derrière (attaque, pression sur une faiblesse) reste un joli meuble — la case doit servir un objectif concret.",
    ],
  },
  "pm-la-case-faible-dans-le-camp-adverse": {
    objective:
      "Repérer une case que l'adversaire ne peut plus défendre avec un pion, et transformer ce trou durable en cible pour vos pièces.",
    keyIdeas: [
      "Une case faible naît presque toujours d'un coup de pion irréversible (poussée, échange) — les pions ne reculent jamais, une faiblesse qu'ils laissent derrière eux est donc permanente.",
      "La case elle-même ne vaut rien si aucune pièce ne peut s'y poser durablement : cherchez toujours QUI va occuper ce trou, pas seulement OÙ il se trouve.",
      "Une case faible près du roi adverse est la plus dangereuse de toutes — elle sert souvent de tremplin à une attaque directe.",
      "Provoquez la faiblesse plutôt que d'attendre qu'elle apparaisse : une poussée de pion à propos peut forcer l'adversaire à affaiblir lui-même une case clé.",
    ],
  },
  "pm-le-mauvais-fou": {
    objective:
      "Identifier un fou entravé par ses propres pions et savoir s'il faut l'échanger, le réactiver, ou vivre avec ce défaut structurel.",
    keyIdeas: [
      "Un fou est « mauvais » quand la majorité de ses propres pions sont fixés sur la couleur de sa diagonale — il leur tourne le dos plus qu'il ne les soutient.",
      "Un mauvais fou n'est pas condamné : le rediriger vers l'autre diagonale, ou le sortir de la chaîne de pions avant qu'elle ne se referme, sauve souvent la pièce.",
      "Face à un mauvais fou adverse, la meilleure stratégie est souvent de fixer encore plus de pions sur SA couleur, pas de l'attaquer directement.",
      "Un mauvais fou reste une pièce défensive précieuse (il peut couvrir des cases que le cavalier ne couvre jamais) — ne l'échangez pas par réflexe, seulement si l'échange sert un plan.",
    ],
  },
  "pm-cavalier-contre-fou-qui-domine": {
    objective:
      "Juger, position par position, si le cavalier ou le fou est la pièce mineure la plus forte — la réponse dépend entièrement de la structure de pions, jamais d'une règle absolue.",
    keyIdeas: [
      "Position fermée, pions bloqués sur les deux couleurs : le cavalier (qui saute par-dessus les pions) prend l'avantage sur le fou (qui reste bloqué derrière eux).",
      "Position ouverte, avec des colonnes et diagonales dégagées : le fou (qui agit à distance) domine généralement le cavalier (qui doit avancer case par case).",
      "Deux fous valent presque toujours plus que fou+cavalier ou deux cavaliers — ils couvrent ensemble les deux couleurs de cases, un avantage stratégique durable (voir « La paire de fous »).",
      "Avant d'échanger l'une de ces pièces, demandez-vous quelle structure de pions va résulter de l'échange — c'est elle qui décide qui aurait gagné le duel.",
    ],
  },
  "pm-le-pion-isole-de-la-dame": {
    objective:
      "Jouer aussi bien le camp qui a un pion isolé (dynamisme, cases avancées) que celui qui l'affronte (blocus, finale favorable).",
    keyIdeas: [
      "Le pion isolé de la dame (souvent en d4/d5) n'a plus de pion voisin pour le défendre — c'est une faiblesse potentielle, jamais une faiblesse immédiate.",
      "En contrepartie, il ouvre des colonnes des deux côtés et offre une case d'avant-poste juste devant lui (d5/d4) — un vrai atout en milieu de partie, surtout avec les dames sur l'échiquier.",
      "Le camp qui possède le pion isolé cherche l'attaque et évite les échanges de pièces ; le camp adverse cherche au contraire à simplifier vers une finale, où la faiblesse structurelle pèsera enfin.",
      "Bloquer le pion isolé avec un cavalier juste devant lui (jamais un fou, qui y serait mal placé) neutralise le plus souvent son potentiel dynamique.",
    ],
  },
  "pm-les-pions-pendants": {
    objective:
      "Reconnaître deux pions adjacents non doublés, sans pion voisin pour les soutenir, et savoir s'ils sont une force dynamique ou une faiblesse à terme.",
    keyIdeas: [
      "Deux pions pendants (typiquement c4/d4 ou c5/d5) contrôlent à eux deux quatre cases centrales importantes — un vrai atout tant qu'ils restent mobiles.",
      "Leur défaut symétrique au pion isolé : aucun des deux n'a de pion voisin pour le protéger, donc chaque échange de pièces les rend un peu plus vulnérables.",
      "Le camp qui les possède cherche à les faire avancer avec tempo (souvent d4-d5 ou c4-c5) plutôt que de les laisser figés — des pions pendants immobiles sont juste deux faiblesses.",
      "Le camp adverse cherche à les bloquer puis à échanger les pièces qui les défendent, avant de les attaquer en finale.",
    ],
  },
  "pm-doubler-les-pions-adverses": {
    objective:
      "Décider quand provoquer des pions doublés chez l'adversaire (et lesquels), et reconnaître quand ce n'est PAS un gain automatique.",
    keyIdeas: [
      "Des pions doublés perdent leur capacité à se défendre mutuellement et contrôlent moins de cases qu'un pion isolé de même nombre — une vraie faiblesse structurelle, surtout en finale.",
      "Doubler les pions adverses en échangeant une pièce contre une autre (souvent fou contre cavalier) doit toujours se juger au cas par cas : l'échange lui-même est-il favorable indépendamment des pions doublés ?",
      "Des pions doublés qui ouvrent une colonne pour une tour, ou renforcent le contrôle du centre, peuvent en réalité AIDER l'adversaire — ne les provoquez jamais par automatisme.",
      "Des pions doublés isolés (sans AUCUN pion ami sur les colonnes voisines) sont la pire configuration possible — c'est la cible à viser en priorité.",
    ],
  },
  "pm-le-pion-passe-protege": {
    objective:
      "Exploiter un pion passé qu'un autre pion ami protège déjà — l'un des atouts structurels les plus décisifs de toute la partie.",
    keyIdeas: [
      "Un pion passé (aucun pion adverse ne peut plus l'arrêter sur sa colonne ou les colonnes voisines) devient « protégé » quand un pion ami le défend directement — l'adversaire ne peut plus jamais le capturer gratuitement.",
      "Un pion passé protégé grandit en valeur à mesure que les pièces disparaissent : en finale, il immobilise souvent une pièce entière adverse à lui seul rien que pour le surveiller.",
      "Ne le poussez pas trop tôt : un pion passé protégé bien soutenu vaut souvent mieux comme MENACE permanente que comme pion sacrifié prématurément pour l'avancer.",
      "Le camp adverse doit le bloquer avec une pièce (jamais le laisser avancer librement) et chercher à échanger le pion qui le protège.",
    ],
  },
  "pm-la-colonne-ouverte": {
    objective:
      "Prendre le contrôle d'une colonne sans aucun pion dessus et transformer cette possession en pénétration décisive.",
    keyIdeas: [
      "Une tour sur une colonne ouverte contrôle toute sa longueur — placez toujours vos tours AVANT d'ouvrir la colonne vous-même si possible, pour être le premier à l'occuper.",
      "Doubler les tours sur la colonne ouverte (« batterie ») multiplie la pression et prépare une pénétration à la 7e/8e rangée que rien ne peut arrêter à temps.",
      "Contrôler une colonne ne suffit pas : il faut ensuite l'utiliser pour pénétrer (7e rangée) ou créer une menace concrète — une tour qui reste en bout de colonne sans plan ne gagne rien seule.",
      "Si vous ne pouvez pas contester une colonne ouverte adverse, bloquez-la avec une pièce plutôt qu'un pion (le pion, lui, ne peut jamais reculer pour se dégager).",
    ],
  },
  "pm-la-colonne-semi-ouverte": {
    objective:
      "Exploiter une colonne où seul votre camp n'a plus de pion — un outil plus subtil que la colonne totalement ouverte, mais tout aussi puissant.",
    keyIdeas: [
      "Sur une colonne semi-ouverte, votre tour n'a plus de pion ami pour la gêner mais affronte toujours un pion adverse : la cible est ce pion lui-même, ou la case juste derrière lui.",
      "Une colonne semi-ouverte pointée vers le roi adverse est souvent l'ingrédient principal d'une attaque — même sans l'ouvrir complètement, la pression suffit à immobiliser la défense.",
      "Le camp adverse peut neutraliser la colonne en la fermant définitivement (avancer le pion cible hors de portée) ou en plaçant une pièce devant pour bloquer.",
      "Une colonne semi-ouverte se transforme souvent en colonne ouverte plus tard dans la partie — l'occuper tôt prépare cette transformation.",
    ],
  },
  "pm-la-tour-a-la-7e-rangee": {
    objective:
      "Reconnaître pourquoi une tour posée sur la 7e rangée (2e pour les Noirs) est presque toujours un avantage décisif, et savoir la neutraliser en défense.",
    keyIdeas: [
      "Une tour à la 7e rangée attaque en même temps tous les pions adverses restés sur leur case de départ ET peut souvent harceler le roi confiné à la dernière rangée.",
      "Deux tours doublées à la 7e rangée (le « moulin » en puissance) suffisent fréquemment à gagner la partie par la seule force de leur activité, indépendamment du reste du matériel.",
      "En défense, la priorité absolue est d'empêcher la tour adverse d'atteindre cette rangée — une fois qu'elle y est installée, l'en déloger coûte très cher.",
      "Une tour à la 7e rangée reste forte même en finale de tours pures : elle grignote les pions un par un pendant que le roi adverse ne peut pas s'approcher pour la chasser.",
    ],
  },
  "pm-prophylaxie-anticiper-le-plan-adverse": {
    objective:
      "Adopter le réflexe de Nimzowitsch : avant de jouer VOTRE meilleur coup, demandez-vous ce que l'adversaire aurait joué si c'était son tour — et empêchez-le.",
    keyIdeas: [
      "Un coup prophylactique ne fait souvent rien d'actif en apparence — sa force est entièrement négative : il retire à l'adversaire une ressource qu'il attendait.",
      "La question à se poser à chaque coup : « si je passais mon tour, quel serait le meilleur coup adverse ? » — c'est souvent CE plan qu'il faut freiner en premier.",
      "La prophylaxie est particulièrement puissante contre un plan LENT (manœuvre, réorganisation) : un coup qui le rend impossible peut valoir plus qu'un gain de temps apparent ailleurs.",
      "Ne pas confondre prophylaxie et passivité : le meilleur coup prophylactique reste souvent un coup qui progresse aussi VOTRE propre position.",
    ],
  },
  "pm-l-avantage-d-espace": {
    objective:
      "Comprendre pourquoi contrôler plus de terrain donne plus d'options à vos pièces — et pourquoi cet avantage doit rester une force dynamique, pas un simple confort.",
    keyIdeas: [
      "Plus de terrain contrôlé signifie plus de cases disponibles pour manœuvrer vos pièces, et moins pour celles de l'adversaire, souvent à l'étroit derrière ses propres pions.",
      "Le camp en manque d'espace doit chercher à échanger des pièces (moins de pièces à loger dans un espace réduit) — le camp qui a l'avantage doit au contraire ÉVITER les échanges massifs.",
      "Un avantage d'espace n'est utile que s'il peut se transformer en attaque ou en pénétration — de l'espace inutilisé pendant 20 coups finit par s'éroder tout seul.",
      "Attention aux coups de rupture adverses (voir « Les coups de rupture ») : un excès d'espace peut cacher des cases affaiblies derrière la ligne de pions avancée.",
    ],
  },
  "pm-le-complexe-de-cases-faibles": {
    objective:
      "Repérer non pas une case isolée mais tout un GROUPE de cases de la même couleur qu'aucun pion ne peut plus défendre — souvent la signature d'un fou manquant.",
    keyIdeas: [
      "Un complexe de cases faibles apparaît typiquement quand un camp a perdu (échangé, ou jamais eu) son fou d'une couleur donnée — plus rien ne peut alors contester ces cases.",
      "Ces complexes sont particulièrement dangereux près du roi : un fou ou une dame adverse s'y installe et le camp affaibli ne peut structurellement pas le chasser.",
      "Provoquer un complexe de cases faibles justifie souvent, à lui seul, l'échange d'un fou qui semblait actif — la faiblesse durable vaut plus que l'activité momentanée perdue.",
      "Pour compenser un complexe de cases faibles, gardez les pièces qui PEUVENT encore les défendre (l'autre fou, un cavalier) et évitez de les échanger.",
    ],
  },
  "pm-la-securite-du-roi-en-milieu-de-partie": {
    objective:
      "Évaluer objectivement la sécurité de chaque roi avant de choisir un plan — attaquer sans compter les défenseurs, ou défendre sans compter les attaquants, mène droit à la catastrophe.",
    keyIdeas: [
      "Comptez systématiquement le nombre d'attaquants ET de défenseurs autour du roi avant de vous lancer dans un assaut — une attaque avec moins de pièces que de défenseurs adverses échoue presque toujours.",
      "Un roque affaibli par un pion avancé (g3-g4, h3-h4…) crée des cases permanentes que l'adversaire peut cibler — chaque coup de pion devant son propre roi doit se justifier.",
      "L'échange des pièces défensives (souvent le fou du roque) est souvent le PREMIER objectif d'un plan d'attaque, avant même de toucher aux pions du roque adverse.",
      "Un roi « en sécurité » au milieu de partie peut devenir vulnérable en finale (moins de pièces pour l'entourer) — et inversement, un roi exposé en milieu de partie devient souvent une force active en finale.",
    ],
  },
  "pm-activite-des-pieces-contre-materiel": {
    objective:
      "Accepter qu'un léger désavantage matériel peut être largement compensé par une activité de pièces supérieure — et savoir quand ce marché reste favorable.",
    keyIdeas: [
      "Une pièce active (mobile, centralisée, qui menace des choses concrètes) vaut souvent plus que sa valeur matérielle nominale — une tour passive enfermée derrière ses propres pions ne vaut presque rien.",
      "Le sacrifice positionnel (rendre un pion, parfois une qualité) pour obtenir une activité durable est une arme classique — mais seulement si la compensation est CONCRÈTE (colonnes, cases, initiative), pas juste « esthétique ».",
      "Face à un adversaire matériellement supérieur mais passif, cherchez à ouvrir la position : plus il y a d'espace libre, plus l'activité pèse par rapport au matériel brut.",
      "Un avantage matériel se défend en simplifiant (échanger les pièces actives adverses) — un avantage d'activité se défend en évitant justement ces échanges.",
    ],
  },
  "pm-la-paire-de-fous": {
    objective:
      "Comprendre pourquoi conserver ses deux fous (contre fou+cavalier ou deux cavaliers adverses) est un avantage stratégique durable, surtout en position ouverte.",
    keyIdeas: [
      "Deux fous couvrent ensemble les deux couleurs de cases — aucune case de l'échiquier ne leur échappe, contrairement à n'importe quelle autre paire de pièces mineures.",
      "L'avantage de la paire de fous grandit à mesure que la position s'ouvre : gardez les colonnes/diagonales dégagées si vous la possédez, fermez la position si vous l'affrontez.",
      "Céder l'un de ses deux fous pour un cavalier n'est justifié que si l'échange règle un problème concret (case faible, pièce mal placée) — sinon la paire vaut presque toujours la peine d'être conservée.",
      "Face à la paire de fous adverse, fixez un maximum de pions sur UNE seule couleur : cela neutralise la moitié de leur pouvoir en rendant un des deux fous « mauvais ».",
    ],
  },
  "pm-evaluer-un-echange-de-pieces": {
    objective:
      "Dépasser le simple calcul matériel (« qui prend quoi ») et juger chaque échange par ce qu'il change structurellement pour les DEUX camps.",
    keyIdeas: [
      "Avant d'échanger, demandez-vous : qui garde la meilleure pièce restante, quelle structure de pions en résulte, et quel camp profite de la simplification ?",
      "Échangez la pièce ACTIVE de l'adversaire contre votre pièce PASSIVE si possible — l'inverse (rendre votre bonne pièce contre sa mauvaise) est presque toujours une erreur.",
      "En avantage matériel ou positionnel, simplifiez ; en désavantage, évitez les échanges et cherchez la complication — un principe simple, mais trop souvent oublié en pleine partie.",
      "Un échange qui semble neutre matériellement peut décider durablement d'une structure de pions (doublés, isolés, ouverture de colonne) — c'est souvent CETTE conséquence qui compte le plus, pas la pièce échangée elle-même.",
    ],
  },
  "pm-la-chaine-de-pions": {
    objective:
      "Jouer une chaîne de pions fermée (français, Caro-Kann, King's Indian…) en identifiant sa base — le point faible que toute la stratégie vise à attaquer ou défendre.",
    keyIdeas: [
      "Une chaîne de pions diagonale se défend à sa BASE (le pion le plus en arrière) — c'est structurellement le seul maillon qu'un pion adverse peut attaquer directement.",
      "Le camp qui affronte la chaîne cherche à faire pression sur cette base, souvent en préparant un coup de rupture (f6, c5 selon le camp) pour la fissurer.",
      "Le camp qui possède la chaîne joue généralement sur l'aile OPPOSÉE à sa pointe — la chaîne elle-même indique où chercher l'espace (voir « Jouer les structures fermées »).",
      "Une chaîne de pions bloque les diagonales de certains fous (souvent le vôtre) — anticipez ce problème avant de fermer la position, pas après.",
    ],
  },
  "pm-les-coups-de-rupture": {
    objective:
      "Reconnaître le moment où un coup de pion apparemment anodin va faire exploser toute une structure fermée — et calculer s'il est temps de le jouer.",
    keyIdeas: [
      "Un coup de rupture (souvent ...f5, ...c5, d4-d5, f4-f5 selon la structure) cherche à ouvrir des lignes là où votre camp a l'avantage — jamais où l'adversaire est le plus fort.",
      "Une rupture réussie doit se préparer : pièces déjà positionnées pour exploiter les colonnes/diagonales qui vont s'ouvrir, sinon elle profite autant à l'adversaire qu'à vous.",
      "Le bon moment pour une rupture se reconnaît souvent à un avantage de développement ou d'espace local — rompre trop tôt donne gratuitement des cases à l'adversaire.",
      "Face à une rupture adverse qui se prépare, la contre-mesure la plus fiable est souvent de la prévenir prophylactiquement (voir « Prophylaxie ») plutôt que de la subir.",
    ],
  },
  "pm-la-restriction-des-pieces-adverses": {
    objective:
      "Gagner sans attaque directe : limiter, case après case, la mobilité des pièces adverses jusqu'à les rendre pratiquement inutiles.",
    keyIdeas: [
      "Une pièce restreinte (privée de cases utiles) pèse dans l'évaluation même si elle n'a jamais été attaquée directement — la mobilité compte autant que la survie.",
      "Fixer les pions adverses sur des cases qui bloquent leurs propres pièces (souvent le fou de leur propre camp) est une façon indirecte, mais très efficace, de restreindre sans confrontation.",
      "La restriction se joue souvent AVANT l'attaque : neutralisez d'abord la pièce qui pourrait défendre ou contre-attaquer, puis seulement lancez l'offensive.",
      "Une position où toutes les pièces adverses sont restreintes sauf une (le roi) prépare typiquement le zugzwang — l'adversaire finit par devoir bouger quelque chose et se dégrader lui-même.",
    ],
  },
  "pm-la-surprotection-nimzowitsch": {
    objective:
      "Appliquer l'idée de Nimzowitsch : défendre un point stratégique clé avec PLUS de pièces que nécessaire, pour libérer chacune d'elles à agir ailleurs sans jamais le compromettre.",
    keyIdeas: [
      "Surprotéger un point stratégique (souvent une case centrale ou un pion clé) signifie le défendre au-delà du strict nécessaire — l'excédent de défenseurs reste alors libre d'intervenir ailleurs sans jamais laisser le point exposé.",
      "L'idée fonctionne surtout sur les points qui SOUTIENNENT toute une stratégie (un pion central avancé, une case d'avant-poste) — surprotéger un point sans importance n'apporte rien.",
      "Une pièce « surprotectrice » gagne en flexibilité : elle peut menacer, manœuvrer, ou changer de rôle sans jamais avoir à revenir en urgence défendre le point qu'elle couvrait déjà en trop.",
      "Concept subtil et parfois critiqué comme trop rigide — à utiliser quand le point central est vraiment la clé de voûte de votre position, pas systématiquement.",
    ],
  },
  "pm-le-blocus-du-pion-passe": {
    objective:
      "Maîtriser la règle d'or de Nimzowitsch pour affronter un pion passé adverse : le bloquer EXACTEMENT devant lui, de préférence avec un cavalier.",
    keyIdeas: [
      "Bloquer un pion passé juste devant lui l'empêche définitivement d'avancer — la meilleure défense contre un pion passé n'est presque jamais de l'attaquer par les côtés.",
      "Le cavalier est le bloqueur idéal : il n'est pas gêné par le pion (contrairement au fou, qui perd une diagonale) et peut même profiter de la case pour rayonner ailleurs.",
      "Un pion passé bloqué cesse d'être une menace mais garde une valeur : il immobilise la pièce qui le bloque — un « pat » silencieux qu'il faut compenser par ailleurs.",
      "Ne bloquez jamais un pion passé avec un pion : contrairement à une pièce, un pion bloqueur ne peut plus jamais bouger ni participer activement au jeu.",
    ],
  },
  "pm-la-centralisation-des-pieces": {
    objective:
      "Adopter le réflexe permanent de placer ses pièces au centre — d'où elles contrôlent le plus de cases et peuvent basculer instantanément d'une aile à l'autre.",
    keyIdeas: [
      "Une pièce centralisée (cavalier en d5/e5, tour en d1/d8, dame au centre en sécurité) contrôle mécaniquement plus de cases qu'en bord d'échiquier — un cavalier au coin ne couvre que 2 cases contre 8 au centre.",
      "La centralisation prépare la FLEXIBILITÉ : une pièce au centre peut soutenir une attaque à l'aile roi comme à l'aile dame sans perdre de temps à se redéployer.",
      "En finale surtout, le ROI doit lui aussi se centraliser dès que le danger de mat disparaît — un roi actif au centre vaut souvent une pièce mineure de plus dans la conversion.",
      "Une pièce apparemment bien placée en bord d'échiquier doit toujours être comparée à ce qu'elle ferait au centre — la centralisation n'est écartée que si un besoin concret l'exige.",
    ],
  },
  "pm-transformer-un-avantage": {
    objective:
      "Passer d'un avantage abstrait (espace, développement, structure) à un avantage concret et décisif (matériel, mat, finale gagnante) avant qu'il ne s'évapore.",
    keyIdeas: [
      "Un avantage transitoire (temps, initiative) doit se transformer en avantage permanent (matériel, structure, position de mat) avant que l'adversaire n'ait le temps de se réorganiser.",
      "Les avantages ne sont pas tous interchangeables au même moment : un avantage de développement se transforme tôt (attaque directe), un avantage structurel se transforme tard (finale).",
      "Refuser de transformer un avantage « par prudence » le laisse s'éroder coup après coup — la passivité est souvent plus risquée que l'action qui concrétise l'avantage.",
      "Après transformation, réévaluez : un avantage matériel fraîchement acquis appelle souvent une nouvelle phase (simplification, sécurité du roi) plutôt qu'une poursuite immédiate de l'attaque.",
    ],
  },
  "pm-la-technique-de-simplification": {
    objective:
      "Convertir un avantage en victoire en réduisant méthodiquement le nombre de pièces sur l'échiquier — sans jamais relâcher la précision au passage.",
    keyIdeas: [
      "En avantage matériel ou positionnel, chaque échange de pièces (pas de pions) profite structurellement au camp le plus fort — moins de pièces signifie moins de contre-jeu possible pour l'adversaire.",
      "Simplifier ne veut pas dire échanger n'importe quoi : préférez toujours échanger les pièces les plus ACTIVES de l'adversaire, celles qui pourraient encore générer des complications.",
      "Gardez sur l'échiquier les pièces qui vous aident à CONVERTIR l'avantage (souvent les tours en finale) — simplifier à l'excès peut parfois rendre la conversion plus difficile, pas plus facile.",
      "La simplification s'accompagne d'une vigilance accrue sur les pions : une finale de pions mal jouée peut annuler un avantage de pièces entièrement gagné en amont.",
    ],
  },
  "pm-le-complexe-de-cases-de-couleur": {
    objective:
      "Voir l'échiquier en deux couches de cases (claires/foncées) et comprendre comment un déséquilibre entre elles façonne toute la partie.",
    keyIdeas: [
      "Un « complexe de couleur » désigne une zone entière de l'échiquier où un camp contrôle mieux une couleur de cases que l'autre — souvent lié à la perte d'un fou (voir « Le complexe de cases faibles »).",
      "Les fous de couleurs opposées amplifient ce phénomène : chaque camp domine naturellement SA propre couleur, ce qui explique pourquoi ces finales sont si souvent nulles malgré un déséquilibre matériel.",
      "Attaquer sur la couleur où vous dominez, défendre sur celle où l'adversaire domine — un principe simple qui guide énormément de décisions de plan en milieu de partie.",
      "Un roi peut être structurellement vulnérable sur une seule couleur de cases (souvent après h3/h6 ou g3/g6) — c'est précisément cette couleur qu'un assaillant doit cibler.",
    ],
  },
  "pm-la-forteresse-defensive": {
    objective:
      "Construire une position que l'adversaire ne peut matériellement plus percer, même avec un avantage matériel significatif — l'art de tenir la nulle contre plus fort que soi.",
    keyIdeas: [
      "Une forteresse repose sur une configuration où les pièces défensives contrôlent EXACTEMENT les cases par lesquelles l'adversaire devrait percer — un seul coup imprécis peut la faire s'effondrer entièrement.",
      "Le matériel importe peu une fois la forteresse établie : un fou seul peut parfois neutraliser une tour, un cavalier bien placé peut bloquer un pion passé roi+dame.",
      "Construire une forteresse exige souvent de SACRIFIER du matériel volontairement pour figer la structure — mieux vaut une forteresse nette à trois pions de moins qu'une lutte perdue d'avance à matériel égal.",
      "Contre une forteresse adverse, cherchez toujours une PERCÉE (sacrifice, zugzwang, changement de structure) plutôt que d'espérer une erreur — une vraie forteresse ne cède jamais toute seule.",
    ],
  },
  "pm-le-fou-contre-trois-pions": {
    objective:
      "Évaluer un déséquilibre matériel précis (une pièce mineure contre trois pions) qui revient souvent en finale, et savoir dans quels contextes chaque camp doit se sentir bien.",
    keyIdeas: [
      "Trois pions valent, en théorie des échanges, à peu près une pièce mineure — mais leur force RÉELLE dépend entièrement de leur mobilité et de leur connexion, jamais de leur seul nombre.",
      "Des pions connectés et passés valent largement plus que trois pions dispersés et arrêtables un par un — comptez toujours leur potentiel de promotion, pas juste leur nombre.",
      "Le camp du fou cherche à bloquer les pions AVANT qu'ils ne deviennent mobiles et à activer son roi vers eux — attendre les laisse grandir en force à chaque coup.",
      "Le camp des pions cherche à les faire avancer en groupe, soutenus par le roi, plutôt qu'isolément — un pion isolé de ce trio tombe presque toujours à un fou actif.",
    ],
  },
  "pm-la-superiorite-de-l-aile-dame": {
    objective:
      "Exploiter une majorité de pions à l'aile dame — l'un des atouts structurels les plus concrets à convertir en pion passé décisif de finale.",
    keyIdeas: [
      "Une majorité de pions sur une aile (plus de pions que l'adversaire de ce côté) peut, avec les bons échanges, produire un pion passé qui n'existera nulle part ailleurs sur l'échiquier.",
      "Faites avancer la majorité en bloc, pas pion par pion isolément — le pion le plus avancé sans soutien devient une cible facile plutôt qu'un atout.",
      "Le camp en minorité cherche typiquement l'« attaque de minorité » (voir le module Jesper Hall dédié) : pousser SES pions vers la majorité adverse pour lui infliger des faiblesses avant qu'elle ne produise son pion passé.",
      "Une majorité à l'aile dame est souvent plus précieuse qu'une majorité symétrique à l'aile roi : le pion passé y est plus éloigné des deux rois, donc plus difficile à stopper à temps en finale.",
    ],
  },
  "eg-l-opposition-en-finale-de-pions": {
    objective:
      "Maîtriser l'outil le plus fondamental de toute finale roi + pion(s) : savoir qui « a » l'opposition, et pourquoi ce simple décompte de cases décide souvent, à lui seul, du résultat.",
    keyIdeas: [
      "Deux rois sont en opposition quand ils se font face avec un nombre impair de cases vides entre eux (le cas le plus courant : une seule case) — celui qui n'a PAS à jouer « a » l'opposition.",
      "Avoir l'opposition force l'adversaire à céder du terrain : son roi doit s'écarter, ce qui ouvre souvent le chemin de la promotion à votre propre roi.",
      "Comptez les cases AVANT d'engager la manœuvre : un coup de roi apparemment naturel peut céder l'opposition et transformer une position gagnante en position nulle, ou l'inverse.",
      "L'opposition « à distance » (rois alignés par une colonne, rangée ou diagonale avec un nombre impair de cases vides) suit exactement la même logique, même à plusieurs cases d'écart.",
    ],
  },
  "eg-la-regle-du-carre": {
    objective:
      "Déterminer en un coup d'œil, sans calculer une seule variante, si un roi peut rattraper un pion passé adverse qui court vers la promotion.",
    keyIdeas: [
      "Tracez mentalement un carré dont un côté va du pion jusqu'à sa case de promotion — si le roi adverse peut entrer dans ce carré à son prochain coup, il rattrape le pion ; sinon, c'est trop tard.",
      "Le trait compte : si c'est au pion de jouer, dessinez le carré depuis sa case ACTUELLE ; si c'est au roi de jouer, il doit déjà être dans le carré ou pouvoir y entrer immédiatement.",
      "Un roi qui commence hors du carré ne peut JAMAIS rattraper le pion, quel que soit le nombre de coups restants — inutile de calculer plus loin, la course est perdue.",
      "La règle s'applique uniquement à un pion sans obstacle sur sa route — une pièce ou un pion ami sur son chemin change complètement le calcul.",
    ],
  },
  "eg-le-pion-passe-decisif-en-finale": {
    objective:
      "Reconnaître le moment où un pion passé cesse d'être un simple atout structurel et devient l'enjeu décisif qui doit dicter tous les coups suivants.",
    keyIdeas: [
      "En finale, un pion passé grandit en valeur à chaque échange de pièces — ce qui n'était qu'un atout en milieu de partie peut devenir l'unique critère qui décide de la partie.",
      "Le camp qui le possède doit souvent SACRIFIER du matériel ailleurs pour garantir sa promotion — un pion qui va promouvoir vaut fréquemment plus qu'une pièce mineure entière.",
      "Le camp adverse doit évaluer en priorité absolue s'il peut l'arrêter (voir « La règle du carré ») avant de songer à son propre plan — un pion passé ignoré gagne presque toujours la course.",
      "Un pion passé ÉLOIGNÉ du roi adverse est structurellement plus fort qu'un pion passé central : plus il est loin, plus il coûte de temps au roi pour intervenir.",
    ],
  },
  "eg-la-percee-de-pions": {
    objective:
      "Calculer un sacrifice de pion(s) qui ouvre une voie de promotion forcée à travers un mur de pions adverses apparemment infranchissable.",
    keyIdeas: [
      "Une percée de pions sacrifie délibérément un ou plusieurs pions pour en faire passer UN SEUL en position de promotion — comptez toujours le résultat final, jamais le matériel momentanément perdu.",
      "Le motif le plus classique : pousser un pion au milieu de deux pions adverses alignés, de sorte que quelle que soit la reprise choisie, un autre pion ami passe derrière.",
      "Une percée ne fonctionne que si le roi adverse ne peut pas intervenir à temps sur la case clé — vérifiez toujours sa position AVANT de sacrifier, pas après.",
      "Ces séquences sont souvent forcées et se calculent jusqu'au bout (plusieurs coups à l'avance) — une percée de pions est l'un des rares moments de finale où un calcul tactique précis prime sur l'évaluation générale.",
    ],
  },
  "eg-le-roi-actif-en-finale-de-pions": {
    objective:
      "Adopter le réflexe le plus important de toute finale : centraliser son roi le plus tôt possible, dès que le danger de mat a disparu.",
    keyIdeas: [
      "En finale, le roi devient une pièce offensive majeure — un roi actif au centre vaut souvent l'équivalent d'un pion supplémentaire en pratique, simplement par sa mobilité.",
      "La règle empirique : dès que les dames (et souvent les pièces mineures dangereuses) ont quitté l'échiquier, marchez votre roi vers le centre AVANT même de penser à pousser vos pions.",
      "Un roi actif peut à la fois soutenir ses propres pions passés ET attaquer les pions faibles adverses — deux rôles qu'un roi resté au bord de l'échiquier ne peut jamais remplir.",
      "Comparez systématiquement l'activité des DEUX rois avant d'entrer dans une finale de pions par échange volontaire de pièces — un roi en retard d'un seul coup peut suffire à perdre la course.",
    ],
  },
};

/**
 * Découpe une description existante (`CurriculumThemeOverview.description`)
 * en 2-3 phrases pour peupler les `keyIdeas` d'un gabarit générique — jamais
 * une simple répétition mot pour mot de `objective`, sans pour autant
 * réclamer une rédaction manuelle pour les ~180 thèmes qui n'ont pas
 * d'entrée dans `CURATED_LESSONS` (motifs tactiques et mats déjà auto-suffisants
 * par leur seul nom, sparring positions, réservoirs `lichess_*`).
 */
function genericKeyIdeas(theme: CurriculumThemeOverview, category: CurriculumCategoryMeta): readonly string[] {
  const sentences = theme.description
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const ideas = sentences.length > 0 ? sentences : [theme.description];
  return [
    ...ideas,
    `Ce thème appartient au module « ${category.label} »${category.author ? ` (${category.author})` : ""} — enchaîne les exercices dans l'ordre, à ton rythme, jusqu'à le maîtriser.`,
  ];
}

/**
 * Résout le contenu de cours d'un thème : l'entrée curatée si elle existe,
 * sinon un gabarit généré depuis les données déjà connues du catalogue —
 * jamais de page vide (voir le docstring de fichier).
 */
export function resolveLessonContent(
  theme: CurriculumThemeOverview,
  category: CurriculumCategoryMeta,
): LessonContent {
  const curated = CURATED_LESSONS[theme.id];
  if (curated) return curated;
  return { objective: theme.description, keyIdeas: genericKeyIdeas(theme, category) };
}
