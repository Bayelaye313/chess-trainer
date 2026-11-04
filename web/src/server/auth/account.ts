import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";

/**
 * Efface le compte et ses données personnelles en UNE transaction : soit tout
 * disparaît, soit rien. Les sessions et les comptes liés partent par cascade.
 */
export function deleteAccountAndData(userId: string): void {
  db.transaction((tx) => {
    tx.delete(users).where(eq(users.id, userId)).run();
  });
}
