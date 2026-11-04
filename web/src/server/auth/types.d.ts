import type { DefaultSession } from "next-auth";
import type { UserRole, UserStatus } from "@/server/db/schema";

declare module "next-auth" {
  interface Session {
    user: { id: string; role: UserRole } & DefaultSession["user"];
  }
  interface User {
    role?: UserRole;
    status?: UserStatus;
  }
}
