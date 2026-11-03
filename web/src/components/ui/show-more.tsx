"use client";

import { Children, useState, type ReactNode } from "react";
import { Button } from "./button";

/**
 * Affiche les `limit` premiers enfants, puis « Voir tout (N de plus) ».
 * `variant="list"` : enfants = <li>, rendus dans un <ul className>.
 * `variant="table"` : enfants = <tr>, rendus dans un <tbody> après `head`.
 * (Props sérialisables : utilisable depuis un composant serveur.)
 */
export function ShowMore({
  limit,
  children,
  variant = "list",
  className,
  head,
}: {
  limit: number;
  children: ReactNode;
  variant?: "list" | "table";
  className?: string;
  head?: ReactNode;
}) {
  const [all, setAll] = useState(false);
  const items = Children.toArray(children);
  const hidden = items.length - limit;
  const visible = all ? items : items.slice(0, limit);
  return (
    <>
      {variant === "table" ? (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className={className}>
            {head}
            <tbody className="divide-y divide-border">{visible}</tbody>
          </table>
        </div>
      ) : (
        <ul className={className}>{visible}</ul>
      )}
      {hidden > 0 && (
        <Button variant="ghost" className="mt-2" onClick={() => setAll((value) => !value)}>
          {all ? "Réduire" : `Voir tout (${hidden} de plus)`}
        </Button>
      )}
    </>
  );
}
