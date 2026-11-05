"use server";

/**
 * Actions de l'écran Jouer. La logique (et le contrôle de propriété des
 * parties) vit dans `server/queries/play.ts` ; ici on ne fait que lire
 * l'utilisateur de la session. Un fichier "use server" n'exporte JAMAIS de
 * fonction qui prendrait un `userId` en paramètre (le client pourrait le choisir).
 */
import { requireUser } from "@/server/auth/session";
import * as play from "@/server/queries/play";
import type {
  CreateGameInput,
  DeletePlayerMoveInput,
  FinishGameInput,
  RecordPlayerMoveInput,
  SaveBotGameResultInput,
} from "@/server/queries/play";

export type { CreateGameInput, DeletePlayerMoveInput, FinishGameInput, RecordPlayerMoveInput, SaveBotGameResultInput };

export async function createGame(input: CreateGameInput): Promise<{ gameId: string }> {
  return play.createGame((await requireUser()).id, input);
}

export async function recordPlayerMove(input: RecordPlayerMoveInput): Promise<void> {
  await play.recordPlayerMove((await requireUser()).id, input);
}

export async function deletePlayerMove(input: DeletePlayerMoveInput): Promise<void> {
  await play.deletePlayerMove((await requireUser()).id, input);
}

export async function finishGame(input: FinishGameInput): Promise<void> {
  await play.finishGame((await requireUser()).id, input);
}

export async function saveBotGameResult(input: SaveBotGameResultInput): Promise<void> {
  await play.saveBotGameResult((await requireUser()).id, input);
}
