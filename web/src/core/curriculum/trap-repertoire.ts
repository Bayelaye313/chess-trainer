/**
 * Classement de la page Pièges : quelles familles de pièges relèvent de
 * « Mon répertoire » (`app/pieges/page.tsx`), les autres allant dans
 * « Autres ouvertures ».
 */
import { OFF_REPERTOIRE_COURSE_IDS } from "./opening-course-ids";
import { OPENINGS, type OpeningLine } from "./openings";

const STOP_WORDS = new Set(["partie", "defense", "gambit", "debut", "debuts", "de", "la", "le", "du", "des", "game", "opening", "attaque", "systeme"]);

/** Mots significatifs d'un nom (sans accents, sans parenthèses, sans mots vides). */
export function nameKeywords(name: string): string[] {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .split(/[^a-z0-9-]+/)
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
}

/**
 * Ouvertures que tu rencontres dans ton répertoire : les cours de ton
 * répertoire, plus un cours hors répertoire dont un cours de ton répertoire,
 * écrit pour l'AUTRE camp, prolonge la ligne caractéristique — `ruy-lopez`
 * (Blancs, 1.e4 e5 2.Nf3 Nc6 3.Bb5) que tu affrontes avec `berlin-black`,
 * `italian-game` (3.Bc4) avec `italian-game-black`.
 */
export function openingsFacedInRepertoire(openings: readonly OpeningLine[] = OPENINGS, offRepertoire: ReadonlySet<string> = OFF_REPERTOIRE_COURSE_IDS): OpeningLine[] {
  const repertoire = openings.filter((opening) => !offRepertoire.has(opening.id));
  return openings.filter(
    (opening) =>
      !offRepertoire.has(opening.id) ||
      repertoire.some(
        (mine) =>
          mine.side !== opening.side &&
          opening.moves.length > 0 &&
          mine.moves.length >= opening.moves.length &&
          opening.moves.every((san, index) => mine.moves[index] === san),
      ),
  );
}

/**
 * Familles de pièges « de ton répertoire » : tous les mots significatifs du
 * nom de famille — tel quel ou traduit par `translate` (« Ruy Lopez » comme
 * « Partie espagnole ») — se retrouvent dans le nom d'une ouverture que tu
 * rencontres dans ton répertoire (`openingsFacedInRepertoire`).
 */
export function repertoireTrapFamilies(
  families: readonly string[],
  translate: (name: string) => string = (name) => name,
  openings: readonly OpeningLine[] = openingsFacedInRepertoire(),
): string[] {
  const openingWords = openings.map((opening) => new Set(nameKeywords(opening.name)));
  const matches = (name: string) => {
    const words = nameKeywords(name);
    return words.length > 0 && openingWords.some((set) => words.every((word) => set.has(word)));
  };
  return families.filter((family) => matches(family) || matches(translate(family)));
}
