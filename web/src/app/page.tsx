import { EngineCheck } from "@/client/features/engine-check/engine-check";

const ROADMAP = [
  { step: 2, title: "Jouer", detail: "Partie contre le moteur, feedback instantané, parties persistées." },
  { step: 3, title: "Importer", detail: "Chess.com et Lichess, analyse de masse en tâche de fond." },
  { step: 4, title: "Game Review", detail: "Graphe d'évaluation, moments clés, rejouer ses erreurs." },
  { step: 5, title: "Progrès", detail: "Précision par phase, motifs trouvés ou manqués, ouvertures." },
  { step: 6, title: "Réviser", detail: "Decks FSRS, puzzles multi-coups, puzzles du jour." },
] as const;

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Chess Trainer</h1>
        <p className="mt-2 max-w-prose text-sm text-foreground-muted">
          Socle en place : domaine échiquéen porté et testé, moteur Stockfish 18 en
          WebAssembly, base SQLite prête. Les sections ci-dessous arrivent étape par
          étape.
        </p>
      </div>

      <EngineCheck />

      <section>
        <h2 className="text-sm font-medium uppercase tracking-wide text-foreground-muted">
          Prochaines étapes
        </h2>
        <ul className="mt-3 divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
          {ROADMAP.map((item) => (
            <li key={item.step} className="flex gap-4 px-5 py-3">
              <span className="w-6 shrink-0 font-mono text-sm text-foreground-muted">
                {item.step}
              </span>
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-sm text-foreground-muted">{item.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
