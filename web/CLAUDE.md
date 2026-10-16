@AGENTS.md
## Chess Review Rules, Coaching Insights & Nuances (Chess.com Pro + Lotus + Noctie AI Stack)

When writing, refactoring, or optimizing the game review engine, you must strictly enforce these 4 core pillars:

### 1. The Evaluation & Theory Layer (Lotus Chess Style)
* **Book Moves (📖)**: 
  - Must be cross-referenced with an opening book database or ECO codes. 
  - If a move is theoretical, it overrides any engine score evaluation; it must be labeled `book`.
* **Opening Disruption**: Flag the exact move where the user leaves 'Book' theory and generate a specific delta analysis to explain if the deviation was a strategic choice or a positional mistake.

### 2. The Elite Move Triad & Aesthetics (Chess.com Pro Style)
* **Best (★)**: The absolute top choice of the Stockfish engine (highest centipawn/win-percent score).
* **Critical (!)**: The SINGLE, solitary move that maintains the position. Any other legal move drops the evaluation drastically (evaluation gap >= 150 centipawns or >= 2% win-percent loss).
* **Brilliant (!!)**: The top engine choice (or within 0.5% win-percent) that structurally involves a genuine piece sacrifice. The material balance net must be strictly negative on that turn, leading to a winning/stable tactical or positional advantage at deeper engine lines. 
  - *Anti-Duplication Rule*: Pure equal or favorable piece exchanges (e.g., Rook takes Rook) must NEVER be labeled Brilliant.

### 3. Humanized Coaching & Behavioral Feedback (Noctie.ai Style)
* **Mistake Classification**: Do not just state centipawn drops. Classify errors by human concepts: "Left piece en prise", "Missed Tactical Fork", "Weak King Safety", or "Passive Defensiveness".
* **The Coach Voice**: Every review must generate a human-like summary sentence. Instead of "+2.10", say: *"You spotted a beautiful tactical sequence here, capitalizing on your opponent's exposed king."*

### 4. UI Mappings & Gamification
* **Token Map**: Use the standard `QUALITY_SYMBOL` record (brilliant: "!!", critical: "!", best: "★", book: "📖").
* **E-Sport Theme**: All components must render using the immersive dark theme (`bg-slate-950`) with vibrant quality-coded node colors.
