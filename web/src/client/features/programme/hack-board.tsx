"use client";

import type { CSSProperties } from "react";
import { Chess } from "chess.js";
import { defaultPieces, type ChessboardOptions, type PieceRenderObject } from "react-chessboard";
import { ESPORT_BOARD_OPTIONS } from "@/client/features/board/board-theme";
import type { VisualHackRender } from "@/core/programme/visual-hacks";

/**
 * Traduit le rendu d'un hack visuel (`core/programme/visual-hacks.ts`) en
 * options `react-chessboard` + style du conteneur. Les pièces « masquées »
 * restent sur l'échiquier (on peut toujours les jouer) mais sont dessinées
 * vides ; leur liste est affichée sous l'échiquier (`hiddenPiecesLabel`).
 */

const LIGHT = "#c7d3df";
const DARK = "#4e6a84";
const EMPTY_PIECE = () => <svg viewBox="0 0 45 45" aria-hidden="true" />;
const PIECE_NAME: Record<string, string> = { p: "P", n: "C", b: "F", r: "T", q: "D", k: "R" };

export interface HackedBoard {
  options: Partial<ChessboardOptions>;
  wrapperStyle: CSSProperties;
  /** Orientation à appliquer, compte tenu de la rotation. */
  orientation: "white" | "black";
}

export function hackedBoard(render: VisualHackRender | null, playerColor: "w" | "b"): HackedBoard {
  const base: "white" | "black" = playerColor === "w" ? "white" : "black";
  if (!render) return { options: {}, wrapperStyle: {}, orientation: base };
  const options: Partial<ChessboardOptions> = {};
  let light = LIGHT, dark = DARK;
  if (render.invertSquares) [light, dark] = [dark, light];
  if (render.lowContrast) [light, dark] = ["#8ea2b4", "#8397aa"];
  if (render.highContrast) [light, dark] = ["#ffffff", "#000000"];
  if (light !== LIGHT || dark !== DARK) {
    options.lightSquareStyle = { backgroundColor: light };
    options.darkSquareStyle = { backgroundColor: dark };
    options.lightSquareNotationStyle = { color: dark };
    options.darkSquareNotationStyle = { color: light };
  }
  if (render.hideCoordinates) options.showNotation = false;
  if (render.hiddenPieceTypes?.length) {
    const pieces: PieceRenderObject = { ...defaultPieces };
    for (const type of render.hiddenPieceTypes) for (const color of ["w", "b"]) pieces[`${color}${type.toUpperCase()}`] = EMPTY_PIECE;
    options.pieces = pieces;
  }
  const filters = [render.grayscale ? "grayscale(1)" : "", render.blurPx ? `blur(${render.blurPx}px)` : ""].filter(Boolean).join(" ");
  const wrapperStyle: CSSProperties = {
    ...(filters ? { filter: filters } : {}),
    ...(render.boardWidth ? { maxWidth: render.boardWidth, margin: "0 auto" } : {}),
  };
  const orientation = render.rotate180 ? (base === "white" ? "black" : "white") : base;
  return { options, wrapperStyle, orientation };
}

/** « Pions masqués : Blancs a2, b3… ; Noirs … » — `null` si rien n'est masqué. */
export function hiddenPiecesLabel(fen: string, render: VisualHackRender | null): string | null {
  const types = render?.hiddenPieceTypes;
  if (!types?.length) return null;
  const board = new Chess(fen).board().flat().filter((p) => p && types.includes(p.type));
  const side = (color: "w" | "b") =>
    board
      .filter((p) => p!.color === color)
      .map((p) => `${PIECE_NAME[p!.type] === "P" ? "" : PIECE_NAME[p!.type]}${p!.square}`)
      .join(" ") || "—";
  return `Pièces masquées — Blancs : ${side("w")} · Noirs : ${side("b")}`;
}

export const BASE_BOARD_OPTIONS = ESPORT_BOARD_OPTIONS;
