/** Écran d'attente pour une section dont l'étape n'est pas encore développée. */
export function ComingSoon({
  title,
  step,
  children,
}: {
  title: string;
  step: number;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-dashed border-border p-8">
      <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
        Étape {step}
      </p>
      <h1 className="mt-2 text-xl font-semibold">{title}</h1>
      <p className="mt-3 max-w-prose text-sm text-foreground-muted">{children}</p>
    </section>
  );
}
