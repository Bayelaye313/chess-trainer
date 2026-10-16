/**
 * Analyse des lignes du protocole UCI.
 *
 * Fonctions pures, sans worker ni DOM : testables directement.
 */

export interface UciInfo {
  depth?: number;
  /** Centipions, **du point de vue du camp au trait** (convention UCI). */
  scoreCp?: number;
  /** Coups avant mat, POV camp au trait. Négatif = le camp au trait est maté. */
  scoreMate?: number;
  /** Variante principale en UCI. */
  pv?: string[];
  /** Rang de la ligne quand MultiPV est actif (1 = meilleure). */
  multipv?: number;
  nodes?: number;
  nps?: number;
}

/**
 * Décode une ligne `info`. Renvoie `null` si la ligne n'en est pas une, ou si
 * elle ne porte aucune donnée utile (`info string ...`, `info currmove ...`).
 */
export function parseInfoLine(line: string): UciInfo | null {
  if (!line.startsWith("info ")) return null;

  const tokens = line.split(/\s+/);
  const info: UciInfo = {};
  let hasPayload = false;

  for (let i = 1; i < tokens.length; i += 1) {
    switch (tokens[i]) {
      case "depth":
        info.depth = Number(tokens[++i]);
        hasPayload = true;
        break;
      case "multipv":
        info.multipv = Number(tokens[++i]);
        break;
      case "nodes":
        info.nodes = Number(tokens[++i]);
        break;
      case "nps":
        info.nps = Number(tokens[++i]);
        break;
      case "score": {
        const kind = tokens[++i];
        const value = Number(tokens[++i]);
        if (kind === "cp") info.scoreCp = value;
        else if (kind === "mate") info.scoreMate = value;
        hasPayload = true;
        break;
      }
      case "pv":
        // `pv` est toujours en dernier : tout le reste est la variante.
        info.pv = tokens.slice(i + 1);
        hasPayload = true;
        i = tokens.length;
        break;
      default:
        break;
    }
  }

  return hasPayload ? info : null;
}

/**
 * Décode une ligne `bestmove`. Renvoie `null` si ce n'en est pas une, et
 * `{ bestMove: null }` quand le moteur n'a aucun coup à jouer (`bestmove (none)`).
 */
export function parseBestMove(line: string): { bestMove: string | null } | null {
  if (!line.startsWith("bestmove")) return null;
  const move = line.split(/\s+/)[1];
  if (!move || move === "(none)" || move === "0000") return { bestMove: null };
  return { bestMove: move };
}

/** Construit la commande `go` correspondant à une limite d'analyse. */
export function goCommand(limit: { depth?: number; movetimeMs?: number }): string {
  const parts = ["go"];
  if (limit.depth !== undefined) parts.push("depth", String(limit.depth));
  if (limit.movetimeMs !== undefined) parts.push("movetime", String(limit.movetimeMs));
  // Sans limite explicite, une profondeur par défaut évite un `go infinite`.
  if (parts.length === 1) parts.push("depth", "12");
  return parts.join(" ");
}
