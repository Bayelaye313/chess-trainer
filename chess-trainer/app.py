"""
Chess Trainer — clone local et gratuit inspiré de Noctie.ai
-------------------------------------------------------------
- Joue contre une IA (Stockfish) dont la force est réglée sur un ELO cible.
- Donne un retour instantané sur la qualité de chaque coup joué.
- Transforme automatiquement tes erreurs/gaffes en puzzles à réviser
  (répétition espacée simplifiée, façon "Leitner").

Aucun compte, aucun abonnement, tout tourne en local.
"""

import io
import json
import os
import uuid
from datetime import date, timedelta
from urllib.parse import quote
from urllib.request import Request, urlopen

import chess
import chess.engine
import chess.pgn
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

STOCKFISH_PATH = os.environ.get("STOCKFISH_PATH", "stockfish")
ANALYSIS_DEPTH = int(os.environ.get("ANALYSIS_DEPTH", "14"))
AI_MOVE_TIME = float(os.environ.get("AI_MOVE_TIME", "0.6"))

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
PUZZLES_FILE = os.path.join(DATA_DIR, "puzzles.json")
IMPORTED_GAMES_FILE = os.path.join(DATA_DIR, "imported_games.json")
os.makedirs(DATA_DIR, exist_ok=True)

# Parties en cours, en mémoire (clé = game_id)
GAMES = {}


# ---------------------------------------------------------------------------
# Utilitaires Stockfish
# ---------------------------------------------------------------------------

def get_engine():
    """Ouvre une nouvelle instance Stockfish. Appelant responsable de la fermer."""
    return chess.engine.SimpleEngine.popen_uci(STOCKFISH_PATH)


def configure_strength(engine, elo):
    """Règle Stockfish sur un ELO humain approximatif (1320-3000)."""
    elo = max(1320, min(3000, int(elo)))
    try:
        engine.configure({"UCI_LimitStrength": True, "UCI_Elo": elo})
    except chess.engine.EngineError:
        # Certaines builds n'exposent pas UCI_Elo : repli sur Skill Level.
        skill = max(0, min(20, round((elo - 800) / 110)))
        engine.configure({"Skill Level": skill})


def classify_move(cp_loss):
    """Convertit une perte de centipawns en étiquette lisible."""
    if cp_loss is None:
        return "Théorique"
    if cp_loss < 20:
        return "Excellent"
    if cp_loss < 50:
        return "Bon"
    if cp_loss < 100:
        return "Imprécision"
    if cp_loss < 300:
        return "Erreur"
    return "Gaffe"


def estimate_performance_rating(history, base_elo):
    player_moves = [m for m in history if m["by"] == "player" and m.get("cp_loss") is not None]
    if not player_moves:
        return {
            "estimated_rating": base_elo,
            "summary": "Pas assez de coups joués pour estimer le niveau.",
        }

    avg_loss = sum(m["cp_loss"] for m in player_moves) / len(player_moves)
    strong_moves = sum(1 for m in player_moves if m["quality"] in ("Excellent", "Bon"))
    total_moves = len(player_moves)

    if avg_loss < 20:
        performance = 2050
    elif avg_loss < 40:
        performance = 1900
    elif avg_loss < 80:
        performance = 1750
    elif avg_loss < 140:
        performance = 1600
    elif avg_loss < 220:
        performance = 1450
    else:
        performance = 1300

    summary = f"Moyenne {avg_loss:.0f} cp, {strong_moves}/{total_moves} coups bien joués."
    return {
        "estimated_rating": performance,
        "summary": summary,
        "ai_elo": base_elo,
    }


def score_for_side(info, side_white):
    """Extrait un score en centipawns du point de vue des blancs (mat -> grande valeur)."""
    score = info["score"].white()
    return score.score(mate_score=100000)


def load_imported_games():
    if not os.path.exists(IMPORTED_GAMES_FILE):
        return []
    with open(IMPORTED_GAMES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_imported_games(games):
    with open(IMPORTED_GAMES_FILE, "w", encoding="utf-8") as f:
        json.dump(games, f, indent=2, ensure_ascii=False)


def build_imported_game_record(raw_game, player_username):
    white_name = (raw_game.get("white") or {}).get("username") or "Blancs"
    black_name = (raw_game.get("black") or {}).get("username") or "Noirs"
    pgn = raw_game.get("pgn", "") or ""

    raw_result = str(raw_game.get("result", "") or "")
    if raw_result in {"white", "win", "1-0"}:
        result = "1-0"
    elif raw_result in {"black", "lose", "0-1"}:
        result = "0-1"
    elif raw_result in {"draw", "1/2-1/2"}:
        result = "1/2-1/2"
    else:
        result = "*"

    move_count = 0
    if pgn:
        try:
            game = chess.pgn.read_game(io.StringIO(pgn))
            if game is not None:
                move_count = len(list(game.mainline_moves()))
        except Exception:
            move_count = 0

    return {
        "id": str(uuid.uuid4()),
        "source_url": raw_game.get("url"),
        "player_username": player_username,
        "white_username": white_name,
        "black_username": black_name,
        "result": result,
        "time_control": raw_game.get("time_control"),
        "rules": raw_game.get("rules", "chess"),
        "end_time": raw_game.get("end_time"),
        "pgn": pgn,
        "move_count": move_count,
        "summary": f"{white_name} vs {black_name} — {result}",
    }


def _fetch_json(url):
    req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(req, timeout=20) as response:
        return json.loads(response.read().decode("utf-8"))


def import_chess_com_games(username):
    username = (username or "").strip()
    if not username:
        raise ValueError("Le pseudo Chess.com est requis.")

    archives_url = f"https://api.chess.com/pub/player/{quote(username)}/games/archives"
    archives_payload = _fetch_json(archives_url)
    archive_urls = archives_payload.get("archives", [])
    if not archive_urls:
        raise ValueError("Aucune archive de partie n'a été trouvée pour ce pseudo.")

    imported_games = load_imported_games()
    seen_urls = {game.get("source_url") for game in imported_games if game.get("source_url")}
    imported_count = 0

    for archive_url in archive_urls[:12]:
        archive_payload = _fetch_json(archive_url)
        for raw_game in archive_payload.get("games", []):
            source_url = raw_game.get("url")
            if not source_url or source_url in seen_urls:
                continue
            imported_games.append(build_imported_game_record(raw_game, username))
            seen_urls.add(source_url)
            imported_count += 1
            if imported_count >= 50:
                break
        if imported_count >= 50:
            break

    save_imported_games(imported_games)
    return {
        "username": username,
        "imported_count": imported_count,
        "total_saved": len(imported_games),
        "games": imported_games[-5:],
        "practice_summary": build_practice_summary(imported_games),
    }


def build_practice_summary(games):
    total_games = len(games)
    opening_count = sum(1 for game in games if (game.get("move_count") or 0) >= 8)
    missed_checkmates = sum(1 for game in games if (game.get("move_count") or 0) >= 10 and (game.get("result") not in {"*", None, ""}))
    endgame_count = sum(1 for game in games if (game.get("move_count") or 0) >= 20)
    missed_tactics = sum(1 for game in games if (game.get("move_count") or 0) >= 10)
    tactical_count = sum(1 for game in games if (game.get("move_count") or 0) >= 10)
    positional_count = sum(1 for game in games if (game.get("move_count") or 0) >= 12)

    return [
        {
            "key": "daily-puzzles",
            "title": "Daily Puzzles",
            "subtitle": "Replay previous puzzles",
            "count": max(1, total_games) if total_games else 0,
            "detail": f"{total_games} parties importées et prêtes pour la révision du jour." if total_games else "Aucune partie importée pour l'instant.",
        },
        {
            "key": "opening-mistakes",
            "title": "Opening mistakes",
            "subtitle": "Opening mistakes from your games",
            "count": opening_count,
            "detail": f"{opening_count} parties avec une phase d'ouverture à revoir." if opening_count else "Aucune ouverture à analyser pour l'instant.",
        },
        {
            "key": "missed-checkmates",
            "title": "Missed checkmates",
            "subtitle": "Missed checkmates from your games",
            "count": missed_checkmates,
            "detail": f"{missed_checkmates} parties avec un mat manqué ou une fin de partie à extraire." if missed_checkmates else "Pas encore de fin de partie à travailler.",
        },
        {
            "key": "endgame-mistakes",
            "title": "Endgame mistakes",
            "subtitle": "Endgame mistakes from your games",
            "count": endgame_count,
            "detail": f"{endgame_count} parties avec une finale à réviser." if endgame_count else "Pas encore de finale assez longue à analyser.",
        },
        {
            "key": "missed-tactics",
            "title": "Missed tactics",
            "subtitle": "Missed opportunities from your games",
            "count": missed_tactics,
            "detail": f"{missed_tactics} parties contenant des motifs tactiques à étudier." if missed_tactics else "Aucun motif tactique repéré pour l'instant.",
        },
        {
            "key": "tactical-mistakes",
            "title": "Tactical mistakes",
            "subtitle": "Tactical mistakes from your games",
            "count": tactical_count,
            "detail": f"{tactical_count} parties avec des erreurs tactiques à corriger." if tactical_count else "Aucune erreur tactique détectée pour l'instant.",
        },
        {
            "key": "positional-mistakes",
            "title": "Positional mistakes",
            "subtitle": "Positional mistakes from your games",
            "count": positional_count,
            "detail": f"{positional_count} parties avec une idée positionnelle à travailler." if positional_count else "Aucune idée positionnelle à extraire pour l'instant.",
        },
    ]


def _game_to_review_moves(pgn):
    if not pgn:
        return []
    try:
        game = chess.pgn.read_game(io.StringIO(pgn))
    except Exception:
        return []
    if game is None:
        return []

    board = game.board()
    review_moves = []
    for node in game.mainline():
        move = node.move
        if move is None:
            continue
        fen_before = board.fen()
        review_moves.append({
            "san": board.san(move),
            "uci": move.uci(),
            "from": chess.square_name(move.from_square),
            "to": chess.square_name(move.to_square),
            "fen_before": fen_before,
            "fen": None,
            "quality": "Théorique",
            "by": "player",
        })
        board.push(move)
        review_moves[-1]["fen"] = board.fen()

    return review_moves


def build_practice_deck(games, deck_key, limit=8):
    deck_key = deck_key or "daily-puzzles"
    if deck_key == "opening-mistakes":
        filtered_games = [game for game in games if (game.get("move_count") or 0) >= 8]
        title = "Opening mistakes"
        detail = "Revois les ouvertures les plus instructives de tes parties importées."
    elif deck_key == "missed-checkmates":
        filtered_games = [game for game in games if (game.get("move_count") or 0) >= 10 and (game.get("result") not in {"*", None, ""})]
        title = "Missed checkmates"
        detail = "Travaille les finales et mats que tu as manqués."
    elif deck_key == "endgame-mistakes":
        filtered_games = [game for game in games if (game.get("move_count") or 0) >= 20]
        title = "Endgame mistakes"
        detail = "Passe en revue les finales longues pour améliorer ta technique."
    elif deck_key == "missed-tactics":
        filtered_games = [game for game in games if (game.get("move_count") or 0) >= 10]
        title = "Missed tactics"
        detail = "Analyse les motifs tactiques à repérer plus vite."
    elif deck_key == "tactical-mistakes":
        filtered_games = [game for game in games if (game.get("move_count") or 0) >= 10]
        title = "Tactical mistakes"
        detail = "Concentre-toi sur les erreurs tactiques et leurs remèdes."
    elif deck_key == "positional-mistakes":
        filtered_games = [game for game in games if (game.get("move_count") or 0) >= 12]
        title = "Positional mistakes"
        detail = "Travaille la logique positionnelle derrière chaque partie."
    else:
        filtered_games = list(games)
        title = "Daily Puzzles"
        detail = "Revois les parties importées comme un deck quotidien."

    if any(game.get("end_time") for game in filtered_games):
        filtered_games = sorted(
            filtered_games,
            key=lambda game: (-(game.get("end_time") or 0), -(game.get("move_count") or 0)),
        )
    else:
        filtered_games = list(filtered_games)
    deck_games = []
    for game in filtered_games[:limit]:
        deck_games.append({
            "id": game.get("id"),
            "summary": game.get("summary") or "Partie importée",
            "move_count": game.get("move_count") or 0,
            "result": game.get("result") or "*",
            "source_url": game.get("source_url"),
            "review_moves": _game_to_review_moves(game.get("pgn")),
        })

    return {
        "key": deck_key,
        "title": title,
        "detail": detail,
        "game_count": len(filtered_games),
        "games": deck_games,
    }


# ---------------------------------------------------------------------------
# Puzzles (stockage JSON local, pas de base de données requise)
# ---------------------------------------------------------------------------

def load_puzzles():
    if not os.path.exists(PUZZLES_FILE):
        return []
    with open(PUZZLES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_puzzles(puzzles):
    with open(PUZZLES_FILE, "w", encoding="utf-8") as f:
        json.dump(puzzles, f, indent=2, ensure_ascii=False)


def add_puzzle(fen_before, correct_uci, correct_san, player_uci, player_san, quality):
    puzzles = load_puzzles()
    puzzles.append({
        "id": str(uuid.uuid4()),
        "fen_before": fen_before,
        "correct_move": correct_uci,
        "correct_san": correct_san,
        "player_move": player_uci,
        "player_san": player_san,
        "quality": quality,
        "box": 1,  # boîte Leitner : 1 (nouveau) -> 5 (bien su)
        "due": date.today().isoformat(),
        "created": date.today().isoformat(),
    })
    save_puzzles(puzzles)


LEITNER_INTERVALS = {1: 1, 2: 2, 3: 4, 4: 8, 5: 16}  # jours avant la prochaine révision


def update_puzzle_result(puzzle_id, correct):
    puzzles = load_puzzles()
    for p in puzzles:
        if p["id"] == puzzle_id:
            if correct:
                p["box"] = min(5, p["box"] + 1)
            else:
                p["box"] = 1
            interval = LEITNER_INTERVALS[p["box"]]
            p["due"] = (date.today() + timedelta(days=interval)).isoformat()
            break
    save_puzzles(puzzles)


# ---------------------------------------------------------------------------
# Routes — page principale
# ---------------------------------------------------------------------------

@app.route("/")
def index():
    return render_template("index.html")


# ---------------------------------------------------------------------------
# Routes — partie contre l'IA
# ---------------------------------------------------------------------------

@app.route("/api/new_game", methods=["POST"])
def new_game():
    data = request.get_json(force=True) or {}
    elo = int(data.get("elo", 1500))
    player_color = data.get("color", "white")  # "white" ou "black"

    board = chess.Board()
    game_id = str(uuid.uuid4())
    GAMES[game_id] = {"board": board, "elo": elo, "player_color": player_color, "history": []}

    ai_move = None
    if player_color == "black":
        ai_move = _play_ai_move(game_id)

    return jsonify({
        "game_id": game_id,
        "fen": board.fen(),
        "ai_move": ai_move,
        "game_over": board.is_game_over(),
    })


def _play_ai_move(game_id):
    g = GAMES[game_id]
    board = g["board"]
    if board.is_game_over():
        return None
    with get_engine() as engine:
        configure_strength(engine, g["elo"])
        result = engine.play(board, chess.engine.Limit(time=AI_MOVE_TIME))
        move = result.move
        san = board.san(move)
        fen_before = board.fen()
        board.push(move)
        g["history"].append({
            "uci": move.uci(), "san": san, "by": "ai",
            "fen_before": fen_before, "fen": board.fen(),
        })
        return {"uci": move.uci(), "san": san, "fen": board.fen()}


@app.route("/api/move", methods=["POST"])
def player_move():
    data = request.get_json(force=True)
    game_id = data["game_id"]
    uci_move = data["move"]

    g = GAMES.get(game_id)
    if g is None:
        return jsonify({"error": "Partie introuvable, démarre une nouvelle partie."}), 404

    board = g["board"]
    try:
        move = chess.Move.from_uci(uci_move)
    except ValueError:
        return jsonify({"error": "Coup invalide."}), 400

    if move not in board.legal_moves:
        return jsonify({"error": "Coup illégal."}), 400

    fen_before = board.fen()
    side_to_move_white = board.turn  # True si les Blancs jouent ce coup
    san = board.san(move)

    with get_engine() as engine:
        info_before = engine.analyse(board, chess.engine.Limit(depth=ANALYSIS_DEPTH))
        best_move = info_before.get("pv", [None])[0]
        best_san = board.san(best_move) if best_move else None
        score_before = score_for_side(info_before, side_to_move_white)

        board.push(move)

        cp_loss = None
        quality = "Théorique"
        if board.is_game_over():
            quality = "Excellent" if (best_move is None or move == best_move) else classify_move(0)
        else:
            info_after = engine.analyse(board, chess.engine.Limit(depth=ANALYSIS_DEPTH))
            score_after = score_for_side(info_after, side_to_move_white)
            if score_before is not None and score_after is not None:
                # On compare toujours du point de vue du joueur qui vient de bouger.
                loss = (score_before if side_to_move_white else -score_before) - \
                       (score_after if side_to_move_white else -score_after)
                cp_loss = max(0, loss)
                quality = classify_move(cp_loss)

    g["history"].append({
        "uci": move.uci(), "san": san, "by": "player",
        "quality": quality, "cp_loss": cp_loss,
        "fen_before": fen_before, "fen": board.fen(),
        "best_san": best_san,
    })

    if quality in ("Erreur", "Gaffe") and best_move is not None and best_move != move:
        add_puzzle(fen_before, best_move.uci(), best_san, move.uci(), san, quality)

    response = {
        "fen": board.fen(),
        "san": san,
        "quality": quality,
        "cp_loss": cp_loss,
        "best_san": best_san,
        "game_over": board.is_game_over(),
        "result": board.result() if board.is_game_over() else None,
    }

    if board.is_game_over():
        response["match_summary"] = estimate_performance_rating(g["history"], g["elo"])
        response["review_moves"] = g["history"]
        blunders = sum(1 for m in g["history"] if m["by"] == "player" and m.get("quality") == "Gaffe")
        errors = sum(1 for m in g["history"] if m["by"] == "player" and m.get("quality") == "Erreur")
        if blunders + errors > 0:
            response["review_summary"] = f"{blunders} gaffe(s), {errors} erreur(s) détectée(s). Revois ces coups en couleur."
        else:
            response["review_summary"] = "Aucune grosse erreur détectée. Revoie les coups clés de la partie."

    if not board.is_game_over():
        response["ai_move"] = _play_ai_move(game_id)
        response["game_over"] = board.is_game_over()
        response["result"] = board.result() if board.is_game_over() else None

    return jsonify(response)


# ---------------------------------------------------------------------------
# Routes — puzzles générés à partir de tes erreurs
# ---------------------------------------------------------------------------

@app.route("/api/puzzles/due", methods=["GET"])
def puzzles_due():
    today = date.today().isoformat()
    puzzles = [p for p in load_puzzles() if p["due"] <= today]
    return jsonify(puzzles)


@app.route("/api/puzzles/reset", methods=["POST"])
def reset_puzzles():
    save_puzzles([])
    return jsonify({"success": True, "message": "Les puzzles ont été réinitialisés."})


@app.route("/api/import/chesscom", methods=["POST"])
def import_chesscom_games():
    data = request.get_json(force=True) or {}
    username = (data.get("username") or "").strip()
    try:
        result = import_chess_com_games(username)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 400
    return jsonify(result)


@app.route("/api/practice/summary", methods=["GET"])
def practice_summary():
    games = load_imported_games()
    return jsonify({"practice_summary": build_practice_summary(games), "games": games[-5:]})


@app.route("/api/practice/deck/<deck_key>", methods=["GET"])
def practice_deck(deck_key):
    games = load_imported_games()
    limit = int(request.args.get("limit", 6))
    deck = build_practice_deck(games, deck_key, limit=limit)
    return jsonify(deck)


@app.route("/api/puzzles/all", methods=["GET"])
def puzzles_all():
    return jsonify(load_puzzles())


@app.route("/api/puzzles/answer", methods=["POST"])
def puzzles_answer():
    data = request.get_json(force=True)
    puzzle_id = data["puzzle_id"]
    played_uci = data["move"]

    puzzles = load_puzzles()
    puzzle = next((p for p in puzzles if p["id"] == puzzle_id), None)
    if puzzle is None:
        return jsonify({"error": "Puzzle introuvable."}), 404

    correct = played_uci == puzzle["correct_move"]
    update_puzzle_result(puzzle_id, correct)
    return jsonify({"correct": correct, "correct_move": puzzle["correct_move"], "correct_san": puzzle["correct_san"]})


if __name__ == "__main__":
    app.run(debug=True, port=5050)
