"use client";

/**
 * Panneau de notation en ARBRE, façon Lichess Study — cahier des charges du
 * 2026-09-12. Remplace la liste de coups plate par un affichage typographique
 * complet : ligne principale en gras, variantes secondaires entre
 * parenthèses dans une couleur atténuée, chaque coup cliquable. Consommé par
 * `course-tree-viewer.tsx`, qui possède l'état de navigation (aucun état
 * local ici — composant de présentation pur).
 *
 * Perf (cahier des charges « zéro fuite mémoire, zéro re-rendu inutile ») :
 * chaque coup est un sous-composant `React.memo` (`MoveToken`), et
 * `onSelect` DOIT être stable (`useCallback` côté appelant) pour que ce memo
 * serve à quelque chose — un arbre de 300 coups imbriqués ne re-rend alors
 * que le token qui change de statut (ancien/nouveau courant), jamais les 300.
 * Le parcours de la ligne principale est une boucle `while` (pas une
 * récursion dont la profondeur suivrait le nombre de coups) : seule la
 * profondeur d'IMBRICATION DE VARIANTES récurse, typiquement < 10 même pour
 * la partie la plus commentée du catalogue (Kasparov–Topalov, module 25).
 */
import { Fragment, memo, type ReactNode } from "react";
import type { ChessMoveNode } from "@/core/chess/move-tree";

const MoveToken = memo(function MoveToken({
  node,
  label,
  isCurrent,
  isMainLine,
  hasEngineSuggestion,
  onSelect,
}: {
  node: ChessMoveNode;
  label: string;
  isCurrent: boolean;
  isMainLine: boolean;
  hasEngineSuggestion: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(node.id)}
      className={[
        "rounded px-1 py-0.5 font-mono text-[13px] leading-relaxed transition-colors",
        isCurrent
          ? "bg-accent text-accent-foreground"
          : isMainLine
            ? "font-semibold text-foreground hover:bg-surface-muted"
            : "text-foreground-muted hover:bg-surface-muted",
      ].join(" ")}
      title={hasEngineSuggestion ? "Une suggestion moteur est affichée à ce nœud" : undefined}
    >
      {label}
      {hasEngineSuggestion && (
        <span aria-hidden="true" className="ml-0.5 text-[10px]" style={{ color: "var(--engine-arrow-best)" }}>
          ⚙
        </span>
      )}
    </button>
  );
});

function moveNumberLabel(ply: number, forceBlackNumber: boolean): string {
  const moveNumber = Math.ceil(ply / 2);
  const isWhite = ply % 2 === 1;
  if (isWhite) return `${moveNumber}.`;
  return forceBlackNumber ? `${moveNumber}…` : "";
}

interface RenderOpts {
  currentId: string;
  onSelect: (id: string) => void;
}

/**
 * Rend UNE ligne (la principale ou une variante) à plat, ses embranchements
 * inclus — voir le docstring du fichier pour la discipline de récursion.
 * `isMainLine` ne descend jamais dans une parenthèse : une variante reste
 * visuellement atténuée même si ELLE-MÊME porte une sous-variante (une
 * parenthèse dans une parenthèse, ex. module 25).
 */
function renderLine(startNode: ChessMoveNode, isMainLine: boolean, opts: RenderOpts): ReactNode[] {
  const out: ReactNode[] = [];
  let node = startNode;
  let forceBlackNumber = true;
  for (;;) {
    const label = `${moveNumberLabel(node.ply, forceBlackNumber)}${node.san}`;
    out.push(
      <Fragment key={node.id}>
        <MoveToken
          node={node}
          label={label}
          isCurrent={node.id === opts.currentId}
          isMainLine={isMainLine}
          hasEngineSuggestion={node.engineSuggestion !== null}
          onSelect={opts.onSelect}
        />{" "}
        {node.comment && <span className="mr-1 text-[12px] italic text-foreground-muted">{node.comment}</span>}
      </Fragment>,
    );
    forceBlackNumber = false;

    for (let index = 1; index < node.children.length; index += 1) {
      out.push(
        <span key={`${node.id}-v${index}`} className="mr-1 text-[12px] text-foreground-muted/80">
          ({renderLine(node.children[index], false, opts)})
        </span>,
      );
      forceBlackNumber = true; // Une parenthèse interrompt visuellement la ligne — le coup suivant réaffiche "N…".
    }

    if (node.children.length === 0) break;
    node = node.children[0];
  }
  return out;
}

/**
 * `root` porte la position de DÉPART du chapitre (`san === null`) — le rendu
 * commence à son premier enfant réel (`root.children[0]`), la racine
 * elle-même n'a rien à afficher. `null` si le chapitre n'a encore aucun
 * coup (cas limite, jamais un chapitre réel du catalogue — voir
 * `course-tree.test.ts`).
 */
export function MoveTreeViewer({ root, currentId, onSelect }: { root: ChessMoveNode; currentId: string; onSelect: (id: string) => void }) {
  if (root.children.length === 0) return null;
  return (
    <div className="max-h-[26rem] overflow-y-auto rounded-md border border-border bg-surface-muted/40 p-3 text-sm leading-loose">
      {renderLine(root.children[0], true, { currentId, onSelect })}
    </div>
  );
}
