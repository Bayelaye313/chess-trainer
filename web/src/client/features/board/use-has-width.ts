"use client";

import { useEffect, useState } from "react";

/**
 * `true` tant que l'élément observé occupe une largeur non nulle à l'écran.
 *
 * react-chessboard mesure la largeur d'une case (`getBoundingClientRect`) pour
 * animer un coup et lève « Square width not found » quand elle vaut 0 — cas
 * d'un échiquier monté dans un onglet masqué (`display: none`), ex. le Drill
 * de `/ouvertures/[slug]` qui rejoue le premier coup blanc côté Noirs. Passer
 * ce booléen à `showAnimations` fait poser la position sans animation tant que
 * le plateau n'est pas visible, sans démonter l'échiquier (l'état est gardé).
 *
 * S'utilise avec un ref-callback (`ref={setElement}`) pour suivre aussi les
 * montages/démontages conditionnels de l'élément.
 */
export function useHasWidth(): [hasWidth: boolean, ref: (element: HTMLElement | null) => void] {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [hasWidth, setHasWidth] = useState(false);

  useEffect(() => {
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setHasWidth(entry.contentRect.width > 0));
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  return [element !== null && hasWidth, setElement];
}
