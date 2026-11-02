/** Squelette générique pendant le rendu serveur d'un écran. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite" className="mx-auto w-full max-w-[1200px] animate-pulse">
      <span className="sr-only">Chargement…</span>
      <div className="h-8 w-56 rounded-md bg-surface-muted" />
      <div className="mt-2 h-4 w-80 max-w-full rounded bg-surface-muted/70" />
      <div className="mt-8 grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="h-48 rounded-lg bg-surface" />
        <div className="h-48 rounded-lg bg-surface" />
      </div>
      <div className="mt-6 space-y-2">
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="h-12 rounded-md bg-surface" />
        ))}
      </div>
    </div>
  );
}
