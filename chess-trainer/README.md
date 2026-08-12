# Cabinet — entraîneur d'échecs local

Un clone maison, gratuit et local, inspiré de Noctie.ai : tu joues contre une
IA (Stockfish) réglée sur un ELO cible, tu reçois un retour instantané sur la
qualité de chaque coup, et tes erreurs/gaffes deviennent automatiquement des
puzzles à réviser. Tout tourne sur ta machine, aucun compte requis.

## 1. Installer Stockfish

Stockfish est le moteur d'échecs (gratuit, open source) qui fait jouer l'IA.

**macOS (Homebrew)**
```bash
brew install stockfish
```

**Windows**
1. Télécharge le binaire sur https://stockfishchess.org/download/
2. Dézippe-le, note le chemin complet vers `stockfish.exe`
3. Utilise ce chemin dans l'étape 3 ci-dessous (variable `STOCKFISH_PATH`)

**Linux (Debian/Ubuntu)**
```bash
sudo apt install stockfish
```

Vérifie l'installation :
```bash
stockfish
# tape "quit" pour sortir si ça répond bien
```

## 2. Installer les dépendances Python

Python 3.9+ requis.

```bash
cd chess-trainer
python3 -m venv venv
source venv/bin/activate        # sous Windows : venv\Scripts\activate
pip install -r requirements.txt
```

## 3. Lancer l'application

Si `stockfish` est déjà dans ton PATH, lance directement :
```bash
python app.py
```

Sinon, précise le chemin vers le binaire :
```bash
# macOS/Linux
STOCKFISH_PATH=/chemin/vers/stockfish python app.py

# Windows (PowerShell)
$env:STOCKFISH_PATH="C:\chemin\vers\stockfish.exe"; python app.py
```

Ouvre ensuite **http://localhost:5050** dans ton navigateur.

## Comment ça marche

- **Force de l'IA** : le curseur ELO (1320–2600) règle Stockfish en mode
  `UCI_LimitStrength`, qui le fait jouer avec des imprécisions réalistes
  plutôt que des coups parfaits — pas exactement le même modèle "humain"
  que Noctie, mais un comportement comparable en pratique.
- **Retour sur chaque coup** : après chaque coup joué, le serveur compare
  l'évaluation Stockfish avant/après pour calculer une perte en centipawns,
  classée en Excellent / Bon / Imprécision / Erreur / Gaffe.
- **Puzzles automatiques** : toute Erreur ou Gaffe est enregistrée dans
  `data/puzzles.json` avec la position et le meilleur coup. L'onglet
  Puzzles applique une répétition espacée simplifiée (façon Leitner) :
  un puzzle réussi revient plus tard, un puzzle raté revient dès demain.

## Limites connues / pistes d'amélioration

- Pas de gestion des ouvertures nommées ni d'import de répertoires.
- Les parties en cours sont en mémoire : elles sont perdues si tu redémarres
  le serveur (seuls les puzzles sont persistés sur disque).
- Le "style humain" est approximé par la limitation de force de Stockfish ;
  pour un rendu plus proche d'un vrai joueur (choix d'ouverture typique,
  temps de réflexion variable), il faudrait un modèle entraîné sur des
  parties humaines — hors de portée d'un projet local simple.
