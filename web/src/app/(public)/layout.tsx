import Link from "next/link";
import { ChessKnight } from "lucide-react";

/** Pages accessibles sans session : connexion et confidentialité. */
export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="h-[var(--header-h)] border-b border-border">
        <div className="mx-auto flex h-full max-w-[720px] items-center px-[var(--space-page)]">
          <Link href="/connexion" className="inline-flex min-h-11 items-center gap-2 rounded-md text-foreground">
            <ChessKnight aria-hidden="true" className="size-6 text-accent" />
            <span className="font-display text-lg font-semibold tracking-tight">Chess Trainer</span>
          </Link>
        </div>
      </header>
      <main id="contenu" className="mx-auto w-full max-w-[720px] flex-1 px-[var(--space-page)] py-10 sm:py-14">
        {children}
      </main>
    </div>
  );
}
