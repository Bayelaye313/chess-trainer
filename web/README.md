# Chess Trainer

Entraîneur d'échecs local — Next.js 16, Stockfish 18 en WebAssembly, SQLite.
Voir [docs/01-BENCHMARK.md](../docs/01-BENCHMARK.md) et
[docs/02-ARCHITECTURE.md](../docs/02-ARCHITECTURE.md) à la racine du dépôt
pour le contexte et les décisions techniques.

## Démarrer

```bash
npm install       # copie aussi les binaires Stockfish dans public/engine/
npm run db:migrate
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

## Structure

```
src/
├── app/               # routes (Next.js App Router)
├── core/              # domaine échiquéen pur — aucune dépendance React/DB
├── client/            # code qui ne tourne que dans le navigateur
│   ├── engine/         # worker Stockfish WASM
│   └── features/       # composants et hooks, par domaine métier
├── server/            # code qui ne tourne que côté serveur
│   ├── db/              # schéma Drizzle + connexion SQLite
│   └── actions/          # Server Actions ('use server')
├── components/ui/     # primitives d'interface partagées
└── lib/                # utilitaires purs partagés (ex. libellés FR)
```

## Commandes

```bash
npm run dev            # serveur de développement
npm run build           # build de production
npm test                 # tests unitaires (Vitest)
npm run typecheck         # tsc --noEmit
npm run lint                # ESLint

npm run db:generate    # génère une migration depuis le schéma
npm run db:migrate      # applique les migrations
npm run db:studio         # explorateur de base

npm run setup:engine   # recopie Stockfish dans public/engine (auto au postinstall)
npm run smoke:engine     # confronte le décodage UCI à la sortie réelle du moteur
```
