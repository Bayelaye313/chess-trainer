/**
 * Bornes du nombre de parties à importer — partagées entre le formulaire
 * (client) et l'action qui les fait respecter (serveur). Neutre comme
 * `lib/labels.ts` : aucun des deux ne doit importer l'autre directement.
 */
export const DEFAULT_MAX_GAMES = 30;
export const MAX_MAX_GAMES = 1000;
export const MIN_MAX_GAMES = 1;
