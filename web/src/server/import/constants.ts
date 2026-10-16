/**
 * Profondeur plus faible qu'en partie live (16) : l'import traite des
 * centaines de positions, le débit prime sur la précision au coup près.
 * Le prototype Python utilisait la même logique (10 contre 14 en direct).
 */
export const IMPORT_ANALYSIS_DEPTH = 12;
