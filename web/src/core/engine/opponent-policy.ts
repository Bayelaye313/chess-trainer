export interface BookMoveCandidate {
  uci: string;
  games: number;
  userBias?: number;
}

export interface BookPolicyOptions {
  /** 0 = toujours le plus populaire, 1 = tirage proportionnel aux parties. */
  temperature: number;
  /** Probabilité de ne pas suivre le coup le plus populaire. */
  deviationRate: number;
}

export interface RandomSource {
  next(): number;
}

export interface OpponentPolicy {
  choose(candidates: readonly BookMoveCandidate[]): string | null;
}

function weightedChoice(candidates: readonly BookMoveCandidate[], random: RandomSource): string | null {
  if (candidates.length === 0) return null;
  const weights = candidates.map((candidate) => Math.max(0, candidate.games * (candidate.userBias ?? 1)));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  if (total === 0) return candidates[0].uci;
  let roll = Math.max(0, Math.min(0.999999999, random.next())) * total;
  for (let index = 0; index < candidates.length; index += 1) {
    roll -= weights[index];
    if (roll <= 0) return candidates[index].uci;
  }
  return candidates[candidates.length - 1].uci;
}

/** Politique locale de première génération : humaine par fréquence, pas engine-perfect. */
export class BookOpponentPolicy implements OpponentPolicy {
  constructor(
    private readonly options: BookPolicyOptions,
    private readonly random: RandomSource = { next: () => Math.random() },
  ) {}

  choose(candidates: readonly BookMoveCandidate[]): string | null {
    if (candidates.length === 0) return null;
    const ordered = [...candidates].sort(
      (left, right) =>
        right.games * (right.userBias ?? 1) - left.games * (left.userBias ?? 1),
    );
    const deviationRate = Math.max(0, Math.min(1, this.options.deviationRate));
    if (ordered.length > 1 && this.random.next() >= deviationRate) return ordered[0].uci;

    const temperature = Math.max(0, Math.min(1, this.options.temperature));
    if (temperature === 0) return ordered[0].uci;
    const softened = ordered.map((candidate) => ({
      ...candidate,
      games: Math.max(1, Math.round(candidate.games ** (1 - temperature))),
    }));
    return weightedChoice(softened, this.random);
  }
}