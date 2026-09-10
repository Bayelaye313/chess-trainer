"use client";

import { useEffect, useState } from "react";

/**
 * Renvoie `value`, mais retardé de `delayMs` après sa dernière modification —
 * la brique générique derrière la recherche instantanée débouncée
 * (`GamesSearchList`) : évite de relancer une requête serveur à chaque frappe.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
