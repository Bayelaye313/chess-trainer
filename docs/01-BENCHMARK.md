# Benchmark strategique — Chess Trainer offline

> Version produit : septembre 2026. Comparaison fonctionnelle entre Chess
> Trainer et Lotus Chess, Chess Trap Pro, Noctie AI, Lichess et Chess.com
> Premium. Les capacites du produit local sont verifiees dans le depot ; les
> capacites concurrentes sont tirees des pages publiques citees en fin de
> document. Une affirmation non documentee publiquement est marquee comme
> telle plutot que presentee comme un fait.

## 0. Verdict executif

Chess Trainer n'est plus un prototype de partie contre Stockfish. Son avantage
reel est une boucle locale complete : contenu importe dans SQLite, moteur local,
entrainement interactif, SRS et diagnostics relies par des deep-links. Il peut
deja battre les references sur trois criteres qui comptent en environnement
contraint : confidentialite, disponibilite hors ligne et personnalisation
deterministe.

Il ne peut pas encore remplacer les cinq concurrents sur quatre dimensions :

1. **La pratique contre une IA humaine** : Stockfish local est fort, mais ne
   reproduit pas encore les choix, erreurs et rythmes d'un joueur humain.
2. **La profondeur de Game Review** : les donnees existent en partie dans
   `games`/`moves`, mais il manque une timeline critique unifiee avec replay et
   Retry.
3. **La boucle de recommandation** : les puzzles, ouvertures, pieges et motifs
   sont separes ; le produit ne compose pas encore automatiquement la prochaine
   seance optimale.
4. **La couverture pedagogique** : l'academie est riche, mais les explications
   restent moins systematiques que les scenarios de Lichess ou les milliers de
   lecons de Chess.com.

### Positionnement recommande

> **Le coach d'echecs local qui transforme chaque partie en programme
> d'entrainement prive, verifiable et rejouable sans reseau.**

La promesse ne doit pas etre « plus de contenu que Chess.com ». Elle doit etre :
**moins de bruit, plus de transfert vers les parties reelles, aucune donnee qui
ne quitte l'ordinateur, et une recommandation justifiee par les propres erreurs
de l'utilisateur.**

## 1. Perimetre reel du produit

### Ce qui est deja verifie dans le code

| Domaine | Etat actuel | Avantage produit |
|---|---|---|
| Moteur | Stockfish 18 WASM local derriere un Worker, repli mono-thread | Aucun aller-retour reseau pour jouer ou analyser |
| Donnees | SQLite locale via Drizzle, migrations versionnees | Backup par copie de fichier, auditabilite des resultats |
| Ouvertures | Arbre fusionne curate + lignes Lichess importees localement, 3 813 lignes annoncees | Profondeur et branches sans dependre d'un opening explorer distant |
| Drill d'ouverture | Deux manches, indices locaux, validation ECO/arbre, progression par variante | Memorisation stricte et reproductible |
| Pieges | Plus de 470 lignes Bill Wall importees, hub a trois niveaux, mode victime | Apprentissage causal : le joueur voit pourquoi le piege fonctionne |
| Academie | 155+ themes, 38 944 puzzles annonces, puzzles multi-coups, motifs et sacrifices | Pedagogie locale et contenu specialise |
| Parties | `games` + `moves`, import et analyse de masse deja structures | Base necessaire pour les Insights et les recommandations |
| SRS | FSRS pour puzzles, repetition dediee des variantes d'ouvertures | Une echeance locale, sans compte distant |
| Coach | Narration conceptuelle, motifs, qualite des coups, deep-links | Traduction des evaluations en actions d'entrainement |

### Ce que signifie « 100% offline »

Le parcours coeur doit fonctionner sans reseau : lancer l'application locale,
jouer, analyser, consulter le catalogue embarque, reviser et sauvegarder dans
`data/chess-trainer.db`. Les imports Chess.com/Lichess et toute synchronisation
eventuelle sont des **flux optionnels**, jamais une dependance du runtime.

Un mode strict doit donc :

- desactiver les boutons d'import distant quand aucune archive locale n'est
  fournie ;
- afficher « contenu local » plutot qu'un etat `loading` reseau ;
- ne jamais utiliser une API Lichess pour juger un coup d'ouverture ;
- versionner les datasets importes et leur licence dans SQLite ou un manifeste ;
- tester le produit avec le reseau bloque, y compris apres redemarrage.

## 2. Matrice de synthese

Legende : **fort** = avantage net de Chess Trainer ; **partiel** = capacite
presente mais moins large/profonde ; **gap** = fonction importante absente ;
**hors-scope** = avantage de plateforme que le produit ne doit pas poursuivre.

| Capacite | Chess Trainer | Lotus | Trap Pro | Noctie | Lichess | Chess.com Premium |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Fonctionnement coeur sans reseau | **fort** | fort pour cours annonces offline | non documente | gap : connexion requise selon App Store | fort pour certains outils locaux, service web par defaut | gap : service en ligne |
| Repertoire personnalise | partiel/fort local | fort, analyse jusqu'a 3 000 parties annoncee | faible | fort, import de repertoires | etudes, pas un parcours SRS dedie | explorer + bibliotheque |
| Drill d'ouvertures guide | **fort** | fort | partiel | fort en partie complete | etudes/puzzles, moins specialise | partiel |
| Variantes rares et branches locales | **fort** | non verifie | non | import de repertoire | fort via etudes | explorer large mais distant |
| Pieges et gambits dedies | **fort** : 470+ + mode victime | faible | **fort** | partiel | contenu communautaire variable | lecons/puzzles, pas le coeur |
| Tactique multi-coups | fort sur contenu embarque | fort, 100 000+ annonce | specialise | fort depuis ses parties | **fort** : puzzles, themes, dashboards | **fort** : puzzles illimites Premium |
| SRS adaptatif | fort : FSRS puzzles + SRS ouverture | non verifie | non verifie | fort : flashcards depuis erreurs | fort pour puzzles | limite/compose selon produit |
| Game Review narrative | partiel : coach local et stats | fort mais retours sur explications limites | hors coeur | partiel, review annoncee en evolution | analyse puissante, narration limitee | **reference** : Review, Coach, Retry, key moves |
| Insights historiques | partiel/bon socle SQL | fort par ouverture | hors coeur | faible/non central | dashboards puzzles, pas meme produit | **reference** : phases, ouvertures, tactiques, calendrier |
| IA humaine | gap | annoncee/human-like | non central | **differentiateur fort** | Maia/Stockfish selon contexte | bots/personnalites, pas meme objectif |
| Privacy locale verifiable | **fort** | partiel | non verifie | gap | open source, mais service en ligne | gap |
| Explicabilite des recommandations | fort potentiel, a unifier | reproche utilisateur : lignes sans plans | explications des pieges | feedback instantane, analyse moins profonde | themes et solutions | coach riche mais opaque |

## 3. Axe 1 — Ouvertures et revision

### References

**Lotus Chess** est le concurrent le plus proche sur la preparation : il
annonce l'analyse de jusqu'a 3 000 parties, des cours personnalises, des lignes
qui exploitent les erreurs courantes plutot que seulement les coups engine-perfect,
80+ ouvertures, des statistiques et des contenus offline. Son point faible
observable dans les avis publics est l'explication des plans derriere les coups.

**Noctie** excelle dans le drill en partie complete : ouverture choisie ou
repertoire importe, reponses humaines, feedback instantane et puzzles derives
des erreurs. Il faut une connexion internet, ce qui est incompatible avec la
promesse offline stricte.

**Lichess** apporte analyse, etudes et explorer, avec une grande liberte. Il ne
propose pas la meme boucle locale « variante → deux manches → SRS de maitrise »
prete a l'emploi.

**Chess.com Premium** propose Opening Explorer, bibliotheque, Review et beaucoup
de lecons. Sa force est l'integration de plateforme ; sa faiblesse pour notre
cas est la dependance au service et une personnalisation moins controlable.

### [PRESENT & COMPETITIF]

- L'arbre de variantes fusionne localement est un vrai avantage de resilience :
  une ligne Lichess importee reste jouable sans serveur distant.
- La validation des coups repose sur ECO/arbre, pas sur Stockfish. C'est plus
  pedagogique et plus deterministe qu'un seuil d'evaluation moteur pour juger
  une variante.
- Le drill a deux manches, avec fleche qui s'efface apres deux reussites,
  transition visible et sauvegarde conditionnee a un sans-faute, est plus strict
  qu'un simple replay de ligne.
- La progression est au niveau de la variante, avec cle stable, echeance et
  badge de maitrise en SQLite.

### [ABSENT]

- **Repertoire extrait automatiquement des parties** : le produit stocke `eco`
  et `openingName`, mais ne propose pas encore une vue canonique « voici les
  lignes que tu joues reellement, avec frequence, resultat, premier ecart et
  prochaine action ».
- **Lignes pratiques adversariales** : il manque une generation locale de
  branches ponderees par le niveau de l'utilisateur et le taux de reussite,
  pas seulement par popularite globale.
- **Mode partie complete de repertoire** : apres le drill, l'utilisateur devrait
  jouer une vraie partie depuis la position d'ouverture contre une IA locale
  reglable, avec sortie de theorie marquee.
- **Import offline de fichiers PGN comme parcours** : le pipeline existe pour
  les parties, mais l'utilisateur n'a pas encore un assistant « deposer un PGN
  → construire mon repertoire » entierement local.

### [PRESENT MAIS A AMELIORER]

- L'arbre est riche, mais la valeur de chaque branche est encore inegale : une
  ligne sans commentaire recoit un texte generique. Ajouter plan, pieges
  frequents, reponse a l'erreur et position cible par branche.
- La repetition d'ouverture est dediee mais moins scientifiquement calibree que
  FSRS. Unifier les cartes d'ouverture et de tactique derriere un contrat SRS
  commun, avec une charge quotidienne controlable.
- Le protocole de deux manches est efficace mais peut etre trop rigide pour une
  variante d'un seul ply ou deja maitrisee. Afficher la raison de fin et proposer
  un mode « entretien » plus court sans degrader le mode certification.
- L'offline doit etre visible dans l'UX : indicateur de source locale, taille du
  catalogue, date du dataset et test « reseau coupe » dans les diagnostics.

## 4. Axe 2 — Pieges et gambits

### Reference : Chess Trap Pro

Chess Trap Pro est une reference specialisee : promesse centree sur les pieges,
les gambits, la memorisation de sequences et le gain pratique rapide. Les
informations publiques facilement verifiables etant limitees en septembre 2026,
les details de volume, de SRS et de prix doivent etre valides par un test produit
direct avant decision commerciale.

### [PRESENT & COMPETITIF]

- Le hub en trois niveaux rend le catalogue navigable : famille, gambit, puis
  grille de pieges par difficulte.
- Les 470+ pieges Bill Wall importes localement donnent une largeur credible,
  avec PGN et metadonnees plutot qu'une simple liste de coups.
- Le mode « incarner la victime » est un differentiateur pedagogique fort :
  l'utilisateur experimente l'erreur et voit la punition Stockfish locale.
- Le backward-scan et la validation moteur reduisent le risque de publier un
  piege faux ou tactiquement incoherent.
- Le flux « suivant » sans rechargement favorise une seance de repetition rapide.

### [ABSENT]

- **Mesure de transfert** : apres apprentissage, lancer une position surprise
  ou l'adversaire choisit ou non le piege, et mesurer reconnaissance, refus et
  conversion.
- **Variantes de resistance** : un piege reel doit inclure la ligne si
  l'adversaire ne tombe pas dedans, pas seulement la refutation principale.
- **Bibliotheque de gambits par intention** : sacrifice de pion, developpement,
  attaque du roi, piege de piece, transition en finale, plutot que seulement par
  nom d'ouverture.
- **SRS specifique aux pieges** : difficulte, taux de chute, temps de rappel et
  separation entre « reconnaitre le motif » et « calculer la refutation ».

### [PRESENT MAIS A AMELIORER]

- Le mode victime demontre la causalite mais peut devenir passif. Ajouter un
  arret avant la punition : « trouve la refutation », puis une seconde phase de
  conversion.
- Les pastilles de difficulte sont utiles, mais devraient integrer deux signaux
  distincts : difficulte calculatoire et frequence du piege dans les parties
  reelles.
- Les explications doivent distinguer le coup perdant, la menace creee et la
  condition qui rend le piege possible. C'est la que Chess Trainer peut depasser
  une app de flashcards.
- Le contenu Bill Wall doit etre versionne et attribue dans le manifeste local,
  avec provenance et statut de validation, pour conserver un catalogue fiable.

## 5. Axe 3 — Tactique et pedagogie

### References

**Lichess** est la reference de volume, de gratuite et de granularite : puzzles
avec themes, rating, dashboard, streak/storm/racer, etudes et practice. Son
contenu communautaire est abondant, mais la trajectoire pedagogique peut etre
moins coherente qu'un cursus editorial local.

**Chess.com Premium** apporte puzzles illimites, Puzzle Rush/Battle, drills,
lecons et bibliotheque de cours. C'est le benchmark de largeur et de finition,
pas necessairement celui de l'explicabilite offline.

### [PRESENT & COMPETITIF]
'e
- 155+ themes et 38 944 puzzles donnent deja une masse critique locale.
- L'elimination des puzzles triviaux en un coup, sauf theme dedie, protege le
  temps d'entrainement et privilegie le calcul multi-coups.
- La priorite aux sacrifices et aux puzzles a Elo eleve cree une selection
  d'elite plutot qu'un flux uniforme.
- Le correctif du demi-coup Lichess place correctement le trait utilisateur,
  point essentiel pour eviter une pedagogie fausse.
- `puzzles` porte une solution multi-coups et `reviews` un etat FSRS local : le
  socle de repetition est meilleur qu'une simple progression lineaire.
- Le mini-echiquier anime qui montre menace puis solution donne une entree
  pedagogique immediate avant l'exercice.

### [ABSENT]

- **Mode de jeu competitif local** equivalent a Puzzle Rush/Streak : sessions
  chronometrees, combo, abandon controle et score comparable.
- **Curriculum adaptatif transversal** : le theme suivant devrait dependre des
  erreurs, de la vitesse, du motif et de la stabilite FSRS, pas uniquement du
  theme selectionne.
- **Explication interactive de la ligne** : apres une erreur, demander au joueur
  de nommer la menace, choisir entre plusieurs idees, puis calculer la suite.
- **Pack de finales structure** avec positions de conversion et critere de
  reussite, pour rivaliser avec Lotus/Noctie sur le jeu pratique.

### [PRESENT MAIS A AMELIORER]

- Un puzzle multi-coups peut encore se reduire a « trouver la suite ». Ajouter
  les phases intentionnelles : identifier la menace, trouver les candidats,
  calculer, puis expliquer le motif.
- Le plafond de 50 puzzles d'elite par theme ameliore le signal mais peut
  masquer la variete. Conserver un noyau canonique et une file de rotation
  locale dedupliquee.
- La narration du motif doit etre reliee a la position exacte et au coup joue,
  avec un langage stable, court et verifiable, plutot qu'un commentaire generique.
- Il manque un score de retention : precision immediate, delai de reponse,
  indice utilise, rappel a J+1/J+7 et transfert dans les parties.

## 6. Axe 4 — Coaching IA et analyse

### References

**Noctie** vend l'IA humaine : reponses et erreurs inspirees de parties
humaines, niveau ajustable, timing realiste, entrainement d'ouvertures en partie
complete, feedback immediat, puzzles issus des erreurs et positions custom. Sa
propre page App Store indique qu'une connexion est requise et que la Game Review
reste une zone en amelioration : c'est son avantage produit, mais aussi notre
fenetre d'attaque.

**Chess.com Premium** est le benchmark de Game Review : graphe d'evaluation,
precision, classifications, Coach, key moves, Retry, explications, Insights
par phases, ouvertures, tactiques, qualite des coups, calendrier et geographie.

### [PRESENT & COMPETITIF]

- Stockfish local donne une analyse reproductible, privee et disponible sans
  serveur.
- `coach-narrative.ts` traduit deja les chiffres en concepts humains : perte de
  colonne, piece en prise, opportunite tactique et recommandations.
- `games` et `moves` contiennent les dimensions essentielles : FEN, UCI/SAN,
  cp/mat avant/apres, perte, qualite, phase, motifs, temps de reflexion,
  ouverture et resultat.
- Le diagnostic de fin de partie fournit des deep-links vers l'academie, ce qui
  ferme deja la boucle analyse → apprentissage.
- Le filtre du repertoire sur les lignes jouees au moins cinq fois evite de
  surinterpreter une partie isolee.

### [ABSENT]

- **Timeline de Game Review unifiee** avec graphe, dernier coup de theorie,
  moments cles, Retry et comparaison « coup joue / meilleur coup / idee ».
- **Adversaire humain local** : Stockfish ELO reglable n'est pas Noctie. Une
  politique de coups humains ou un modele Maia local est la grande lacune.
- **Analyse de l'incertitude** : profondeur, temps de recherche et stabilite du
  verdict devraient etre visibles pour eviter de presenter une evaluation locale
  comme une verite absolue.
- **Plan hebdomadaire automatique** : une synthese qui choisit entre ouverture,
  motif, piege, finale et nouvelle partie selon impact et retention.

### [PRESENT MAIS A AMELIORER]

- La narration existe, mais elle doit etre attachee a une unite de review
  persistee : un message par moment cle, avec preuve moteur et deep-link.
- Le tableau statistique est utile, mais doit passer du constat a la decision :
  « tu perds 18% de precision apres la sortie de theorie avec les Noirs en
  Caro-Kann ; voici la ligne et trois positions a reviser ».
- La classification de coups doit etre calibree par phase et contexte ; les
  labels `!!`, `!`, `★`, `?!`, `??` sont lisibles mais insuffisants sans perte
  chiffree et impact concret.
- Un moteur local peut couter du temps CPU. Ajouter une file d'analyse locale,
  reprise apres interruption et cache par `(fen, depth, multipv, engineBuild)`.

## 7. Ce qu'il faut copier, et ce qu'il faut refuser

| Reference | A copier | A refuser ou adapter |
|---|---|---|
| Lotus | cours personnalise depuis les parties, lignes pratiques, offline | contenu sans explication, dependance a une logique opaque |
| Chess Trap Pro | specialisation pieges/gambits, parcours court, repetition | catalogue plat sans mesure de transfert |
| Noctie | IA humaine, partie complete de repertoire, erreurs → flashcards | connexion obligatoire et feedback difficile a auditer localement |
| Lichess | volume, themes, donnees ouvertes, modes de session | curriculum fragmente, dependance au service par defaut |
| Chess.com | Game Review, key moments, Retry, Insights, polish UX | abonnement, cloud obligatoire, breadth qui dilue le parcours personnel |

## 8. Killer Roadmap — les trois prochaines briques

### P1 — Personal Training Graph : la boucle de recommandation

**Objectif.** Relier une erreur, une ouverture, un piege, un motif, un puzzle et
une seance. Chaque matin local, le produit doit pouvoir expliquer pourquoi il
propose les trois exercices suivants.

**Architecture.** Ajouter un module pur `core/training/` qui produit des
`TrainingCandidate` ponderes sans connaitre React ni Drizzle. Une query serveur
agrege les signaux ; une Server Action ecrit le resultat de seance. Le moteur de
recommandation doit etre deterministe a seed egal pour rester testable offline.

**Tables SQLite proposees :**

```sql
CREATE TABLE training_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  kind TEXT NOT NULL, -- puzzle, opening, trap, review, game
  entity_id TEXT NOT NULL,
  source_game_id TEXT REFERENCES games(id) ON DELETE SET NULL,
  score REAL,
  seconds REAL,
  hints_used INTEGER NOT NULL DEFAULT 0,
  occurred_at INTEGER NOT NULL
);

CREATE TABLE training_recommendations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  reason_code TEXT NOT NULL,
  priority REAL NOT NULL,
  due_at INTEGER NOT NULL,
  completed_at INTEGER
);
CREATE INDEX training_recommendations_due_idx
  ON training_recommendations(user_id, due_at, completed_at);
```

**Requetes cles :**

```sql
SELECT entity_type, entity_id, reason_code, priority
FROM training_recommendations
WHERE user_id = ? AND completed_at IS NULL AND due_at <= ?
ORDER BY priority DESC, due_at ASC
LIMIT 3;

SELECT motif, COUNT(*) AS misses, AVG(cp_loss) AS avg_loss
FROM moves
WHERE by_player = 1 AND motif_found = 0
GROUP BY motif
ORDER BY misses DESC, avg_loss DESC
LIMIT 5;
```

**Critere de sortie.** Un clic « seance du jour » lance une sequence mixte et
chaque carte affiche une raison verifiable : « motif fourchette manque deux
fois », « sortie de theorie a 4... », « piege vu mais refutation oubliee ».

### P2 — Local Game Review 2.0 : key moments + Retry

**Objectif.** Atteindre la parite fonctionnelle avec le meilleur de Chess.com
sans cloud : une timeline courte, actionnable, et non un dump de Stockfish.

**Architecture.** Construire `core/analysis/review-timeline.ts` a partir de
`moves`, avec regles pures pour selectionner : dernier coup de theorie, plus
grande perte, tactique manquee, changement de phase et fin de partie. Persister
le resultat pour eviter de recalculer a chaque navigation. L'UI consomme un
snapshot serveur et un composant client `ReviewRetryBoard` rejoue un moment sans
exposer automatiquement la solution.

**Table SQLite proposee :**

```sql
CREATE TABLE review_moments (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  ply INTEGER NOT NULL,
  kind TEXT NOT NULL, -- theory_exit, blunder, missed_tactic, phase_change, finish
  severity REAL NOT NULL,
  headline TEXT NOT NULL,
  explanation_key TEXT NOT NULL,
  retry_fen TEXT NOT NULL,
  best_uci TEXT,
  created_at INTEGER NOT NULL,
  UNIQUE(game_id, ply, kind)
);
CREATE INDEX review_moments_game_idx ON review_moments(game_id, ply);
```

**Requetes cles :**

```sql
SELECT * FROM review_moments
WHERE game_id = ? ORDER BY severity DESC, ply ASC;

SELECT opening_name, COUNT(*) AS games,
       AVG(CASE WHEN result = 'win' THEN 1.0 ELSE 0.0 END) AS win_rate,
       AVG(cp_loss) AS avg_loss
FROM games JOIN moves ON moves.game_id = games.id AND moves.by_player = 1
WHERE games.opening_name IS NOT NULL
GROUP BY opening_name
ORDER BY games DESC;
```

**Critere de sortie.** Pour chaque partie analysee, l'utilisateur voit au plus
5 moments prioritaires, peut rejouer chaque position, recevoir un feedback apres
son essai, puis acceder en un clic au puzzle, au theme ou au drill concerne.

### P3 — Human-like Local Sparring + Repertoire Match

**Objectif.** Reduire l'ecart Noctie : pratiquer une ligne comme une partie,
avec des reponses humaines plausibles, mais sans connexion.

**Architecture.** Ne pas melanger ce moteur avec la validation ECO du drill.
Creer une interface `OpponentPolicy` dans `core/engine/` :

- `StockfishPolicy` pour le niveau tactique actuel ;
- `BookPolicy` pour les continuations locales ponderees ;
- `HumanPolicy` plus tard, alimentee par un modele local ou une table de coups
  humains quantifiee.

Le `BookPolicy` actuel peut deja servir de premiere version : temperature,
frequence de coups, probabilite de deviation et delais doivent etre des
parametres persistes, jamais codes dans le composant React.

**Tables SQLite proposees :**

```sql
CREATE TABLE sparring_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  opening_id TEXT,
  variation_key TEXT,
  policy TEXT NOT NULL,
  target_elo INTEGER,
  started_at INTEGER NOT NULL,
  finished_at INTEGER,
  result TEXT,
  theory_exit_ply INTEGER
);

CREATE TABLE sparring_moves (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL REFERENCES sparring_sessions(id) ON DELETE CASCADE,
  ply INTEGER NOT NULL,
  fen_before TEXT NOT NULL,
  uci TEXT NOT NULL,
  by_player INTEGER NOT NULL,
  policy_score REAL,
  think_ms INTEGER
);
CREATE INDEX sparring_moves_session_idx ON sparring_moves(session_id, ply);
```

**Requete cle :**

```sql
SELECT variation_key, COUNT(*) AS sessions,
       AVG(CASE WHEN result = 'win' THEN 1.0 ELSE 0.0 END) AS conversion_rate,
       AVG(theory_exit_ply) AS avg_theory_depth
FROM sparring_sessions
WHERE user_id = ? AND variation_key IS NOT NULL
GROUP BY variation_key
ORDER BY conversion_rate ASC;
```

**Critere de sortie.** L'utilisateur choisit « jouer cette ligne », demarre
depuis la position initiale ou une position de repertoire, rencontre plusieurs
reponses locales plausibles et recoit a la fin : sortie de theorie, precision,
motifs et exercice de remediation. Le drill certifie la memoire ; le sparring
certifie le transfert.

## 9. Sequence de livraison recommandee

1. **Durcir l'offline et les contrats de donnees** : test reseau coupe,
   manifeste de datasets, cache moteur, export/import de `data/chess-trainer.db`.
2. **Livrer P1** : sans recommandation cross-domain, les excellentes briques
   restent des silos.
3. **Livrer P2** : c'est la demo la plus immediatement comparable a
   Chess.com Premium et elle reutilise presque tout le schema actuel.
4. **Livrer P3** : le differentiateur « repertoire qui survit a la partie »
   devient alors credible face a Noctie et Lotus.
5. **Ensuite seulement**, enrichir les contenus, la competition locale et les
   finales. Le volume ne doit pas preceder la qualite de la boucle.

## 10. Etat d'implementation — P1/P2/P3

La roadmap ci-dessus n'est plus seulement speculative : les trois premieres
briques sont maintenant presentes dans le produit local.

| Brique | Etat reel | Ce qui depasse deja les concurrents | Reste a construire |
|---|---|---|---|
| Personal Training Graph | **operationnel** | Recommandations locales diversifiees entre puzzles, ouvertures et erreurs de parties ; raisons persist ees dans SQLite | objectifs utilisateur, charge quotidienne configurable, recommandations de pieges plus fines |
| Local Game Review | **operationnel** | Deep-link direct vers le ply fautif, Coach, moments cles, graphe et Retry journalise | table `review_moments` materialisee, explications cachees par moment, Retry multi-essais compare |
| Local Book Sparring | **socle operationnel** | Politique de coups locale ponderee par densite des branches importees, deviation controlee, sessions et plies persist es sans reseau | politique humaine apprise, calibration par niveau et historique utilisateur |

### Difference strategique face a Noctie

Noctie reste superieur sur le modele de coups humains appris et l'ergonomie de
la partie complete. Chess Trainer a desormais un avantage structurel different :
la politique locale est inspectable, les sessions sont auditables dans SQLite,
les erreurs de sparring retournent dans le meme graphe que les puzzles et les
ouvertures, et le parcours reste disponible avec le reseau bloque.

La prochaine livraison P3 ne doit donc pas copier une IA noire. Elle doit rendre
visible cette difference : montrer **pourquoi** l'adversaire a choisi sa reponse,
quand la theorie a ete quittee, et quel exercice est recommande ensuite. La
premiere politique locale exploite maintenant la densite du corpus importe : un
coup propose par dix branches est favorise par rapport a un coup vu une seule
fois, tout en conservant une deviation controlee pour l'entrainement pratique.

## Sources et niveau de confiance

### Sources officielles ou produit

- [Chess.com — Premium plans](https://support.chess.com/en/articles/8562418-what-does-each-level-of-premium-membership-get-me) — forte confiance pour les paliers et fonctionnalites.
- [Chess.com — Game Review](https://support.chess.com/en/articles/8584089-how-does-game-review-work) — forte confiance pour graphe, classifications, Coach, key moves et Retry.
- [Chess.com — Insights](https://support.chess.com/en/articles/8708925-what-is-insights-on-chess-com) — forte confiance pour ouvertures, phases, tactiques, coups, calendrier et resultats.
- [Lichess — Learn](https://lichess.org/learn), [Training](https://lichess.org/training), [Analysis](https://lichess.org/analysis), [Studies](https://lichess.org/study) — forte confiance pour les surfaces publiques.
- [Noctie](https://noctie.ai) — forte confiance pour IA humaine, repertoire, feedback, puzzles d'erreurs, lecons et prix affiches.
- [Noctie App Store](https://apps.apple.com/us/app/noctie-chess-trainer/id6444289077) — forte confiance pour l'exigence de connexion et les limites de Game Review mentionnees publiquement.
- [Lotus Chess App Store](https://apps.apple.com/us/app/lotus-chess-trainer/id6738741464) — forte confiance pour analyse de 3 000 parties, 80+ ouvertures, cours, offline et 100 000+ puzzles annonces.
- [Lotus Chess Google Play](https://play.google.com/store/apps/details?id=com.lotuschess.app) — confiance moyenne pour les avis recents et signaux de fiabilite/perception offline.

### Chess Trap Pro

Les pages publiques accessibles pendant ce benchmark ne permettaient pas de
valider proprement une fiche officielle stable. Les conclusions sur Chess Trap
Pro sont donc **fonctionnelles et a confirmer par une prise en main directe** :
positionnement pieges/gambits, parcours de memorisation et specialisation. Ne
pas utiliser de volume, prix ou promesse offline comme argument factuel avant
validation.

### Regle de mise a jour

Ce document doit etre revu a chaque changement de dataset ou de concurrent.
Pour chaque nouvelle capacite, ajouter : source, date d'observation, niveau de
confiance et test de parite local correspondant. Le benchmark est une aide a la
decision produit, pas une copie marketing des pages concurrentes.
