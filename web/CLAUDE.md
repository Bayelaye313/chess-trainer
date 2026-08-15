@AGENTS.md
## Chess Review Rules & Nuances
When writing or refactoring the game review engine, you must enforce these 3 distinct evaluation layers:

1. **Book Moves (📖)**: 
   - Must be verified against an opening book database (or ECO codes).
   - If a move is in the book theory, its evaluation score doesn't matter; it must be labeled `book`.

2. **The Elite Move Triad**:
   - **Best (★)**: The top engine choice (highest centipawn/evaluation score).
   - **Critical (!)**: The ONLY move that maintains the current evaluation. If any other move is played, the evaluation drops drastically (e.g., loss of >= 200 centipawns).
   - **Brilliant (!!)**: A move that matches the `Best` engine choice OR is highly evaluated, BUT structurally involves a piece sacrifice (material is lost on that turn, but regained or converted to a winning advantage in subsequent depth lines).

3. **UI Mappings**:
   - Use the standard `QUALITY_SYMBOL` record (brilliant: "!!", critical: "!", best: "★", book: "📖").
