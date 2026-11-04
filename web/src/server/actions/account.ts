"use server";

import { redirect } from "next/navigation";
import { signIn, signOut } from "@/server/auth/config";
import { requireUser } from "@/server/auth/session";
import { deleteAccountAndData } from "@/server/auth/account";

/** Mot à saisir pour confirmer la suppression du compte. */
const DELETE_CONFIRMATION = "SUPPRIMER";

/** Seuls les chemins internes sont acceptés après connexion (pas de redirection ouverte). */
function safeNext(next: FormDataEntryValue | null): string {
  const value = typeof next === "string" ? next : "";
  return value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\") ? value : "/";
}

export async function signInWithGoogle(formData: FormData): Promise<void> {
  await signIn("google", { redirectTo: safeNext(formData.get("suite")) });
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/connexion" });
}

export type DeleteAccountResult = { error: string } | undefined;

/**
 * Supprime le compte connecté et TOUTES ses données personnelles, en une
 * transaction (voir `deleteAccountAndData`). Le jeton de confirmation est
 * revérifié ici : le bouton désactivé côté client n'est qu'un confort.
 */
export async function deleteAccountAction(confirmation: string): Promise<DeleteAccountResult> {
  const user = await requireUser();
  if (confirmation.trim() !== DELETE_CONFIRMATION) {
    return { error: `Saisis ${DELETE_CONFIRMATION} pour confirmer.` };
  }
  deleteAccountAndData(user.id);
  redirect("/connexion?compte=supprime");
}
