"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

/**
 * Connexion de développement (fournisseur « dev-login »), rendue seulement si
 * NODE_ENV=development ET DEV_LOGIN=1. Elle sert aux tests et aux captures
 * sans Google.
 */
export function DevLoginForm({ suite }: { suite: string }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <form
      className="space-y-3 rounded-lg border border-dashed border-border-strong p-4"
      onSubmit={(event) => {
        event.preventDefault();
        setPending(true);
        void signIn("dev-login", { email, name, redirectTo: suite });
      }}
    >
      <p className="text-sm font-medium">Connexion de développement</p>
      <label className="block text-sm">
        <span className="text-foreground-muted">Email</span>
        <input
          name="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1 block min-h-11 w-full rounded-md border border-border-strong bg-surface-muted px-3 text-foreground"
        />
      </label>
      <label className="block text-sm">
        <span className="text-foreground-muted">Nom (facultatif)</span>
        <input
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-1 block min-h-11 w-full rounded-md border border-border-strong bg-surface-muted px-3 text-foreground"
        />
      </label>
      <Button type="submit" disabled={pending}>
        Se connecter (dev)
      </Button>
    </form>
  );
}
