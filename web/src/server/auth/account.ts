import "server-only";
import { deleteUserAndData } from "@/server/db/user-scope";

/**
 * Efface le compte et TOUTES ses données personnelles en une transaction :
 * soit tout disparaît, soit rien (voir `deleteUserAndData`).
 */
export function deleteAccountAndData(userId: string): Record<string, number> {
  return deleteUserAndData(userId);
}
