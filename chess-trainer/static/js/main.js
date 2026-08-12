// ---------------------------------------------------------------------------
// État global
// ---------------------------------------------------------------------------
let gameId = null;
let game = null;        // instance chess.js pour la validation locale des coups
let board = null;        // instance chessboard.js
let playerColor = "white";
let moveNumber = 1;

let puzzleGame = null;
let puzzleBoard = null;
let activePuzzle = null;
let reviewMode = false;
let reviewMoves = [];
let reviewIndex = -1;
let reviewOverlay = null;
const reviewPrevBtn = document.getElementById("review-prev-btn");
const reviewPlayBtn = document.getElementById("review-play-btn");
const reviewNextBtn = document.getElementById("review-next-btn");
const reviewStepLabel = document.getElementById("review-step");

// ---------------------------------------------------------------------------
// Onglets
// ---------------------------------------------------------------------------
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("is-active"));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("is-active"));
    btn.classList.add("is-active");
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add("is-active");
    if (btn.dataset.tab === "puzzles") loadDuePuzzles();
    if (board) board.resize();
    if (puzzleBoard) puzzleBoard.resize();
  });
});

// ---------------------------------------------------------------------------
// Réglages de partie
// ---------------------------------------------------------------------------
const eloSlider = document.getElementById("elo-slider");
const eloValue = document.getElementById("elo-value");
const matchSummary = document.getElementById("match-summary");
const reviewPanel = document.getElementById("review-panel");
const reviewSummary = document.getElementById("review-summary");
const reviewList = document.getElementById("review-list");
const showBestMoveBtn = document.getElementById("show-best-move-btn");
const resetPuzzlesBtn = document.getElementById("reset-puzzles-btn");
const puzzleAttemptsLabel = document.getElementById("puzzle-attempts");
const chesscomUsernameInput = document.getElementById("chesscom-username");
const importChesscomBtn = document.getElementById("import-chesscom-btn");
const importChesscomStatus = document.getElementById("import-chesscom-status");
const importedGamesList = document.getElementById("imported-games-list");
const practiceReviewTitle = document.getElementById("practice-review-title");
const practiceReviewDetail = document.getElementById("practice-review-detail");
const practiceReviewList = document.getElementById("practice-review-list");
const practiceReviewBtn = document.getElementById("practice-review-btn");
const practiceCards = Array.from(document.querySelectorAll(".practice-card"));
let activePracticeDeck = "daily-puzzles";
let puzzleAttemptsLeft = 3;
let puzzleLocked = false;

eloSlider.addEventListener("input", () => (eloValue.textContent = eloSlider.value));

document.getElementById("new-game-btn").addEventListener("click", startNewGame);
showBestMoveBtn.addEventListener("click", revealBestMove);
resetPuzzlesBtn.addEventListener("click", resetPuzzlesDatabase);
importChesscomBtn.addEventListener("click", importChesscomGames);
reviewPrevBtn.addEventListener("click", () => setReviewIndex(reviewIndex - 1));
reviewPlayBtn.addEventListener("click", playReviewMove);
reviewNextBtn.addEventListener("click", () => setReviewIndex(reviewIndex + 1));

if (practiceReviewBtn) {
  practiceReviewBtn.addEventListener("click", () => {
    const deckGames = window.practiceDeckGames || [];
    if (!deckGames.length) return;
    startPracticeDeckReview(deckGames[0]);
  });
}

practiceCards.forEach((card) => {
  card.addEventListener("click", () => {
    const key = card.dataset.key;
    if (!key) return;
    activePracticeDeck = key;
    practiceCards.forEach((item) => item.classList.toggle("is-active", item === card));
    loadPracticeDeck(key);
  });
});

refreshPracticeSummary();
initPracticeDecks();

function ensureBoardInitialized() {
  if (board) return board;
  if (typeof Chessboard === "undefined") return null;

  board = Chessboard("board", {
    position: "start",
    draggable: Boolean(game),
    orientation: playerColor,
    pieceTheme: "/static/img/chesspieces/wikipedia/{piece}.png",
    onDragStart,
    onDrop,
    onSnapEnd: () => {
      if (game) board.position(game.fen());
    },
  });
  return board;
}

// ---------------------------------------------------------------------------
// Démarrage d'une partie
// ---------------------------------------------------------------------------
async function startNewGame() {
  playerColor = document.getElementById("color-select").value;
  const elo = parseInt(eloSlider.value, 10);
  moveNumber = 1;

  document.getElementById("move-feed").innerHTML = "";
  setStatus("Connexion au moteur…");

  const res = await fetch("/api/new_game", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ elo, color: playerColor }),
  });
  if (!res.ok) {
    setStatus(`Erreur réseau : ${res.status} ${res.statusText}`);
    return;
  }

  const data = await res.json();
  if (data.error) {
    setStatus(data.error);
    return;
  }

  if (typeof Chess === "undefined") {
    setStatus("Erreur : bibliothèque Chess.js non disponible.");
    return;
  }

  gameId = data.game_id;
  game = new Chess();

  if (board) board.destroy();
  board = null;
  matchSummary.textContent = "";
  reviewMode = false;
  reviewMoves = [];
  reviewIndex = -1;
  clearReviewHighlights();
  if (reviewPanel) {
    reviewPanel.classList.add("hidden");
    reviewSummary.textContent = "";
    reviewList.innerHTML = "";
  }
  ensureBoardInitialized();

  if (data.ai_move) {
    game.move({ from: data.ai_move.uci.slice(0, 2), to: data.ai_move.uci.slice(2, 4), promotion: "q" });
    board.position(game.fen());
    logMove(data.ai_move.san, "ai", null, null, null);
  }

  setStatus("");
  updateTurnIndicator();
}

function onDragStart(source, piece) {
  if (!game || game.game_over() || reviewMode) return false;
  const isPlayerPiece = playerColor === "white" ? piece.startsWith("w") : piece.startsWith("b");
  const isPlayerTurn = (game.turn() === "w") === (playerColor === "white");
  if (!isPlayerPiece || !isPlayerTurn) return false;
}

function onDrop(source, target) {
  const localMove = game.move({ from: source, to: target, promotion: "q" });
  if (localMove === null) return "snapback";

  sendPlayerMove(localMove);
}

async function sendPlayerMove(localMove) {
  setStatus("Analyse du coup…");
  const uci = localMove.from + localMove.to + (localMove.promotion || "");

  const res = await fetch("/api/move", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ game_id: gameId, move: uci }),
  });
  const data = await res.json();

  if (data.error) {
    game.undo();
    board.position(game.fen());
    setStatus(data.error);
    return;
  }

  logMove(data.san, "player", data.quality, data.cp_loss, data.best_san);

  if (data.ai_move) {
    game.move({ from: data.ai_move.uci.slice(0, 2), to: data.ai_move.uci.slice(2, 4), promotion: "q" });
    board.position(game.fen());
    logMove(data.ai_move.san, "ai", null, null, null);
  }

  setStatus("");
  updateTurnIndicator();

  if (data.game_over) {
    setStatus(`Partie terminée — ${describeResult(data.result)}`);
    if (data.match_summary) {
      matchSummary.textContent = `Niveau IA joué : ${data.match_summary.ai_elo}. Estimation joueur : ${data.match_summary.estimated_rating}. ${data.match_summary.summary}`;
    }
    if (data.review_moves) {
      startBoardReview(data.review_moves, data.review_summary);
    }
  }
}

function describeResult(result) {
  if (result === "1-0") return "les Blancs gagnent";
  if (result === "0-1") return "les Noirs gagnent";
  return "nulle";
}

function updateTurnIndicator() {
  const turnColor = game.turn() === "w" ? "Blancs" : "Noirs";
  document.getElementById("turn-indicator").textContent = `Trait aux ${turnColor}`;
}

function setStatus(text) {
  document.getElementById("engine-status").textContent = text;
}

// ---------------------------------------------------------------------------
// Journal des coups
// ---------------------------------------------------------------------------
function logMove(san, by, quality, cpLoss, bestSan) {
  const feed = document.getElementById("move-feed");
  const li = document.createElement("li");
  li.className = by;

  const num = document.createElement("span");
  num.className = "num";
  if (by === "player" && playerColor === "white" || by === "ai" && playerColor === "black") {
    num.textContent = by === "ai" && playerColor === "black" ? "" : `${moveNumber}.`;
  }
  if (by === "ai" && playerColor === "white") num.textContent = "";
  if (by === "player" && playerColor === "black") num.textContent = `${moveNumber}.`;

  const sanEl = document.createElement("span");
  sanEl.className = "san";
  sanEl.textContent = san;

  li.appendChild(num);
  li.appendChild(sanEl);

  if (quality) {
    const tag = document.createElement("span");
    tag.className = `tag ${quality}`;
    tag.textContent = cpLoss != null ? `${quality} (-${cpLoss})` : quality;
    li.appendChild(tag);

    if ((quality === "Erreur" || quality === "Gaffe") && bestSan) {
      const hint = document.createElement("span");
      hint.className = "hint";
      hint.textContent = `Meilleur coup : ${bestSan} — ajouté à tes puzzles.`;
      li.appendChild(hint);
      refreshPuzzleCount();
    }
  }

  feed.appendChild(li);
  feed.scrollTop = feed.scrollHeight;

  if (by === "ai") moveNumber += 1;
}

// ---------------------------------------------------------------------------
// Puzzles
// ---------------------------------------------------------------------------
async function refreshPuzzleCount() {
  const res = await fetch("/api/puzzles/due");
  const puzzles = await res.json();
  const badge = document.getElementById("puzzle-count");
  badge.textContent = puzzles.length ? puzzles.length : "";
}

async function loadDuePuzzles() {
  const res = await fetch("/api/puzzles/due");
  const puzzles = await res.json();
  refreshPuzzleCount();

  const list = document.getElementById("puzzle-list");
  const empty = document.getElementById("puzzle-empty");
  list.innerHTML = "";

  if (puzzles.length === 0) {
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  puzzles.forEach((p, i) => {
    const li = document.createElement("li");
    li.textContent = `Puzzle ${i + 1} — ta gaffe : ${p.player_san}`;
    li.dataset.id = p.id;
    li.addEventListener("click", () => openPuzzle(p, li));
    list.appendChild(li);
  });

  openPuzzle(puzzles[0], list.firstChild);
}

function openPuzzle(puzzle, listItem) {
  activePuzzle = puzzle;
  document.querySelectorAll(".puzzle-list li").forEach((li) => li.classList.remove("is-active"));
  if (listItem) listItem.classList.add("is-active");

  puzzleAttemptsLeft = 3;
  puzzleLocked = false;
  updatePuzzleAttemptsDisplay();

  puzzleGame = new Chess(puzzle.fen_before);
  const sideToMove = puzzleGame.turn() === "w" ? "white" : "black";

  if (puzzleBoard) puzzleBoard.destroy();
  puzzleBoard = Chessboard("puzzle-board", {
    position: puzzle.fen_before,
    draggable: true,
    orientation: sideToMove,
    pieceTheme: "/static/img/chesspieces/wikipedia/{piece}.png",
    onDragStart: (source, piece) => {
      if (puzzleLocked) return false;
      const isSideToMove = sideToMove === "white" ? piece.startsWith("w") : piece.startsWith("b");
      return isSideToMove;
    },
    onDrop: (source, target) => {
      const localMove = puzzleGame.move({ from: source, to: target, promotion: "q" });
      if (localMove === null) return "snapback";
      submitPuzzleAnswer(localMove);
    },
    onSnapEnd: () => puzzleBoard.position(puzzleGame.fen()),
  });

  const instruction = document.getElementById("puzzle-instruction");
  instruction.textContent = "Trouve le meilleur coup dans cette position";
  instruction.className = "";
  showBestMoveBtn.disabled = false;
}

function updatePuzzleAttemptsDisplay() {
  puzzleAttemptsLabel.textContent = `Essais restants : ${puzzleAttemptsLeft}`;
}

function startBoardReview(moves, summary) {
  reviewMoves = moves;
  reviewIndex = -1;
  reviewMode = true;
  if (reviewPanel) {
    reviewPanel.classList.remove("hidden");
    reviewSummary.textContent = summary || "Revue de la partie";
    reviewList.innerHTML = "";
  }

  reviewMoves.forEach((move, index) => {
    const li = document.createElement("li");
    li.classList.add(`quality-${move.quality || "Théorique"}`);

    const label = document.createElement("span");
    label.className = "review-move-label";
    label.textContent = `${index + 1}. ${move.by === "player" ? "Joueur" : "IA"}`;

    const san = document.createElement("span");
    san.className = "review-move-san";
    san.textContent = move.san;

    const tag = document.createElement("span");
    tag.className = `tag ${move.quality || "Théorique"}`;
    tag.textContent = move.quality ? `${move.quality}${move.cp_loss != null ? ` (-${move.cp_loss})` : ""}` : "IA";

    li.appendChild(label);
    li.appendChild(san);
    li.appendChild(tag);

    if (move.by === "player" && move.best_san && move.best_san !== move.san) {
      const bestTag = document.createElement("span");
      bestTag.className = "tag best-move";
      bestTag.textContent = `★ Meilleur coup : ${move.best_san}`;
      li.appendChild(bestTag);
    }
    reviewList.appendChild(li);
  });

  setReviewIndex(-1);
}

function setReviewIndex(index) {
  const boardInstance = ensureBoardInitialized();
  if (!boardInstance) return;

  if (index < -1) index = -1;
  if (index >= reviewMoves.length) index = reviewMoves.length - 1;
  reviewIndex = index;
  if (reviewIndex === -1) {
    boardInstance.position("start");
    reviewStepLabel.textContent = `Position 0 / ${reviewMoves.length}`;
  } else {
    const move = reviewMoves[reviewIndex];
    boardInstance.position(move.fen_before);
    reviewStepLabel.textContent = `Coup ${reviewIndex + 1} / ${reviewMoves.length}`;
  }
  reviewPrevBtn.disabled = reviewIndex <= -1;
  reviewNextBtn.disabled = reviewIndex >= reviewMoves.length - 1;
  reviewPlayBtn.disabled = reviewIndex === -1;
  requestAnimationFrame(renderReviewHighlights);
}

function playReviewMove() {
  const boardInstance = ensureBoardInitialized();
  if (reviewIndex === -1 || !reviewMoves[reviewIndex] || !boardInstance) return;
  const move = reviewMoves[reviewIndex];
  boardInstance.position(move.fen);
  requestAnimationFrame(renderReviewHighlights);
}

function getReviewQualityClass(quality) {
  if (!quality) return "quality-Théorique";
  return `quality-${quality}`;
}

function ensureReviewOverlay() {
  if (!reviewOverlay) {
    reviewOverlay = document.createElement("div");
    reviewOverlay.className = "review-overlay";
    document.getElementById("board").appendChild(reviewOverlay);
  }
  return reviewOverlay;
}

function clearReviewHighlights() {
  if (reviewOverlay) {
    reviewOverlay.remove();
    reviewOverlay = null;
  }
}

function renderReviewHighlights() {
  clearReviewHighlights();
  if (!reviewMode || reviewIndex < 0 || !reviewMoves[reviewIndex]) return;

  const boardEl = document.getElementById("board");
  if (!boardEl) return;

  const overlay = ensureReviewOverlay();
  const move = reviewMoves[reviewIndex];
  const qualityClass = getReviewQualityClass(move.quality || "Théorique");
  const squares = [];
  if (move.uci) {
    squares.push(move.uci.slice(0, 2));
    squares.push(move.uci.slice(2, 4));
  }

  squares.forEach((square, idx) => {
    const squareEl = boardEl.querySelector(`.square-55d63[data-square="${square}"]`);
    if (!squareEl) return;

    const boardRect = boardEl.getBoundingClientRect();
    const squareRect = squareEl.getBoundingClientRect();
    const highlight = document.createElement("div");
    highlight.className = `review-highlight ${qualityClass} ${idx === 0 ? "from" : "to"}`;
    highlight.style.left = `${squareRect.left - boardRect.left}px`;
    highlight.style.top = `${squareRect.top - boardRect.top}px`;
    highlight.style.width = `${squareRect.width}px`;
    highlight.style.height = `${squareRect.height}px`;
    overlay.appendChild(highlight);
  });
}

function renderReview(moves, summary) {
  // legacy placeholder; review board is handled by startBoardReview()
}

function revealBestMove() {
  if (!activePuzzle) return;
  const instruction = document.getElementById("puzzle-instruction");
  instruction.textContent = `Le meilleur coup selon Stockfish est ${activePuzzle.correct_san}.`;
  instruction.className = "hint";
  puzzleLocked = true;
  showBestMoveBtn.disabled = true;
}

async function importChesscomGames() {
  const username = chesscomUsernameInput.value.trim();
  if (!username) {
    importChesscomStatus.textContent = "Entre un pseudo Chess.com avant d’importer.";
    return;
  }

  importChesscomStatus.textContent = "Importation en cours…";
  importChesscomBtn.disabled = true;

  try {
    const res = await fetch("/api/import/chesscom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Impossible d’importer les parties.");
    }

    importChesscomStatus.textContent = `${data.imported_count} parties importées pour ${data.username}.`;
    renderImportedGames(data.games || []);
    renderPracticeSummary(data.practice_summary || []);
    await loadPracticeDeck(activePracticeDeck);
  } catch (error) {
    importChesscomStatus.textContent = error.message;
  } finally {
    importChesscomBtn.disabled = false;
  }
}

async function refreshPracticeSummary() {
  try {
    const res = await fetch("/api/practice/summary");
    if (!res.ok) return;
    const data = await res.json();
    renderPracticeSummary(data.practice_summary || []);
    renderImportedGames(data.games || []);
    if (activePracticeDeck) {
      await loadPracticeDeck(activePracticeDeck);
    }
  } catch (error) {
    console.error(error);
  }
}

async function initPracticeDecks() {
  if (!practiceCards.length) return;
  await loadPracticeDeck(activePracticeDeck);
}

async function loadPracticeDeck(deckKey) {
  try {
    const res = await fetch(`/api/practice/deck/${deckKey}?limit=8`);
    if (!res.ok) return;
    const deck = await res.json();
    renderPracticeDeck(deck);
  } catch (error) {
    console.error(error);
  }
}

function renderPracticeDeck(deck) {
  if (practiceReviewTitle) practiceReviewTitle.textContent = deck.title || "Deck";
  if (practiceReviewDetail) practiceReviewDetail.textContent = deck.detail || "Aucune partie à réviser pour ce deck.";
  practiceReviewList.innerHTML = "";
  window.practiceDeckGames = deck.games || [];
  if (!window.practiceDeckGames.length) {
    const li = document.createElement("li");
    li.className = "practice-review-empty";
    li.textContent = "Aucune partie à réviser pour ce deck pour l’instant.";
    practiceReviewList.appendChild(li);
    return;
  }
  window.practiceDeckGames.forEach((game) => {
    const li = document.createElement("li");
    li.dataset.gameId = game.id;
    li.className = "practice-review-item";
    li.innerHTML = `
      <div>
        <strong>${game.summary}</strong>
        <div class="dim">${game.move_count || 0} coups • ${game.result || "*"}</div>
      </div>
      <button type="button" class="btn-secondary">Revoir</button>
    `;
    const button = li.querySelector("button");
    button.addEventListener("click", () => startPracticeDeckReview(game));
    practiceReviewList.appendChild(li);
  });
}

function startPracticeDeckReview(game) {
  if (!game || !game.review_moves || !game.review_moves.length) return;
  const summary = `${game.summary} • ${game.move_count || 0} coups`;
  startBoardReview(game.review_moves, summary);
}

function renderPracticeSummary(summary) {
  const badge = document.querySelector(".practice-hero .practice-badge");
  if (badge) {
    const total = summary.find((entry) => entry.key === "daily-puzzles")?.count || 0;
    badge.textContent = `${total} parties importées • ${summary.length} decks actifs`;
  }

  summary.forEach((entry) => {
    const countEl = document.getElementById(`practice-${entry.key}-count`);
    const detailEl = document.getElementById(`practice-${entry.key}-detail`);
    if (countEl) countEl.textContent = entry.count;
    if (detailEl) detailEl.textContent = entry.detail;
  });
}

function renderImportedGames(games) {
  importedGamesList.innerHTML = "";
  if (!games.length) {
    const li = document.createElement("li");
    li.textContent = "Aucune partie importée pour l’instant.";
    importedGamesList.appendChild(li);
    return;
  }
  games.slice().reverse().forEach((game) => {
    const li = document.createElement("li");
    li.textContent = `${game.summary} • ${game.move_count || 0} coups`;
    importedGamesList.appendChild(li);
  });
}

async function submitPuzzleAnswer(localMove) {
  const uci = localMove.from + localMove.to + (localMove.promotion || "");
  const res = await fetch("/api/puzzles/answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ puzzle_id: activePuzzle.id, move: uci }),
  });
  const data = await res.json();

  const instruction = document.getElementById("puzzle-instruction");
  if (data.correct) {
    instruction.textContent = "Correct — bien vu.";
    instruction.className = "correct";
    showBestMoveBtn.disabled = true;
    puzzleLocked = true;
    setTimeout(loadDuePuzzles, 1400);
  } else {
    puzzleAttemptsLeft -= 1;
    if (puzzleAttemptsLeft <= 0) {
      instruction.textContent = `Plus d'essais — le meilleur coup selon Stockfish est ${activePuzzle.correct_san}.`;
      instruction.className = "hint";
      puzzleLocked = true;
      showBestMoveBtn.disabled = true;
    } else {
      instruction.textContent = "Pas tout à fait — essaie encore ou clique sur Voir le meilleur coup.";
      instruction.className = "incorrect";
      puzzleGame = new Chess(activePuzzle.fen_before);
      puzzleBoard.position(activePuzzle.fen_before);
    }
    updatePuzzleAttemptsDisplay();
  }
}

async function resetPuzzlesDatabase() {
  const res = await fetch("/api/puzzles/reset", { method: "POST" });
  if (!res.ok) {
    alert("Impossible de réinitialiser les puzzles.");
    return;
  }
  await loadDuePuzzles();
}

