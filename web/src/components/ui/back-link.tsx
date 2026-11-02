import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** Un seul style de retour, toujours en haut à gauche : « ← <destination> ». */
export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="-ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-sm text-foreground-muted transition-colors hover:text-foreground"
    >
      <ArrowLeft aria-hidden="true" className="size-4" />
      {children}
    </Link>
  );
}
