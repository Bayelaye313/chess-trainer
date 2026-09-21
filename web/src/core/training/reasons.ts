import type { Motif } from "../chess/types";

/**
 * Raisons inspectables en SQLite. Le code est anglais et stable ; les preuves
 * (motif, ply, ECO) voyagent dans la même chaîne pour éviter une colonne JSON
 * opaque — un `SELECT reason_code` suffit à auditer pourquoi la carte existe.
 */
export const TRAINING_REASON_CODES = [
  "puzzle-due",
  "motif-missed",
  "opening-due",
  "theory-exit",
  "game-error",
  "trap-due",
  "trap-refutation-forgotten",
  "trap-family-played",
] as const;

export type TrainingReasonCode = (typeof TRAINING_REASON_CODES)[number];

export interface TrainingEvidence {
  motif?: Motif;
  missCount?: number;
  avgCpLoss?: number;
  daysOverdue?: number;
  openingName?: string;
  theoryExitPly?: number;
  trapName?: string;
  trapFamily?: string;
  eco?: string;
  gameCount?: number;
  hintsUsed?: number;
}

export interface ParsedTrainingReason {
  code: TrainingReasonCode;
  evidence: TrainingEvidence;
}

const REASON_SET = new Set<string>(TRAINING_REASON_CODES);

export function isTrainingReasonCode(value: string): value is TrainingReasonCode {
  return REASON_SET.has(value);
}

export function encodeTrainingReason(code: TrainingReasonCode, evidence: TrainingEvidence = {}): string {
  const parts = [code];
  pushPart(parts, "motif", evidence.motif);
  pushPart(parts, "n", evidence.missCount);
  pushPart(parts, "cp", evidence.avgCpLoss == null ? undefined : Math.round(evidence.avgCpLoss));
  pushPart(parts, "overdue", evidence.daysOverdue);
  pushPart(parts, "opening", evidence.openingName);
  pushPart(parts, "ply", evidence.theoryExitPly);
  pushPart(parts, "trap", evidence.trapName);
  pushPart(parts, "family", evidence.trapFamily);
  pushPart(parts, "eco", evidence.eco);
  pushPart(parts, "games", evidence.gameCount);
  pushPart(parts, "hints", evidence.hintsUsed);
  return parts.join("|");
}

export function parseTrainingReason(raw: string): ParsedTrainingReason {
  const [head, ...rest] = raw.split("|");
  const code: TrainingReasonCode = isTrainingReasonCode(head) ? head : "puzzle-due";
  const evidence: TrainingEvidence = {};
  for (const token of rest) {
    const separator = token.indexOf("=");
    if (separator <= 0) continue;
    const key = token.slice(0, separator);
    const value = decodeURIComponent(token.slice(separator + 1));
    assignEvidence(evidence, key, value);
  }
  return { code, evidence };
}

function pushPart(parts: string[], key: string, value: string | number | undefined): void {
  if (value == null || value === "") return;
  parts.push(`${key}=${encodeURIComponent(String(value))}`);
}

function assignEvidence(evidence: TrainingEvidence, key: string, value: string): void {
  switch (key) {
    case "motif":
      evidence.motif = value as Motif;
      break;
    case "n":
      evidence.missCount = toInt(value);
      break;
    case "cp":
      evidence.avgCpLoss = toInt(value);
      break;
    case "overdue":
      evidence.daysOverdue = toInt(value);
      break;
    case "opening":
      evidence.openingName = value;
      break;
    case "ply":
      evidence.theoryExitPly = toInt(value);
      break;
    case "trap":
      evidence.trapName = value;
      break;
    case "family":
      evidence.trapFamily = value;
      break;
    case "eco":
      evidence.eco = value;
      break;
    case "games":
      evidence.gameCount = toInt(value);
      break;
    case "hints":
      evidence.hintsUsed = toInt(value);
      break;
    default:
      break;
  }
}

function toInt(value: string): number | undefined {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}
