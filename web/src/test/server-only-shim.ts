// Alias de test pour le paquet `server-only` (voir vitest.config.ts).
//
// En production, `import "server-only"` fait planter volontairement tout
// module qui finirait importé côté client — Next.js sait distinguer les deux
// mondes. Vitest, lui, n'a pas cette distinction : sans cet alias, le premier
// test qui touche un fichier `server/` plante sur ce garde-fou avant même de
// pouvoir tester la vraie logique. Ce fichier ne fait rien, exprès.
export {};
