"use client";

import { useEffect, useState } from "react";
import { getSparringMoveBias } from "@/server/actions/sparring";

export interface SparringMoveBias {
  bias: Record<string, number>;
  sessions: number;
  losses: number;
  reinforcedMoves: number;
}

const EMPTY_BIAS: SparringMoveBias = { bias: {}, sessions: 0, losses: 0, reinforcedMoves: 0 };

export function useSparringMoveBias(openingId: string, variationKey: string): SparringMoveBias {
  const [bias, setBias] = useState<SparringMoveBias>(EMPTY_BIAS);

  useEffect(() => {
    let active = true;
    getSparringMoveBias({ openingId, variationKey })
      .then((next) => {
        if (active) setBias(next);
      })
      .catch(() => {
        if (active) setBias(EMPTY_BIAS);
      });
    return () => {
      active = false;
    };
  }, [openingId, variationKey]);

  return bias;
}