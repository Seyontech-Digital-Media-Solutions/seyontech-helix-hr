import type { User } from "@supabase/supabase-js";
import type { Permission, Role } from "./types/roles";

export type AuthenticatedUser = {
  supabaseUser: User;
  profileId: string;
  role: Role;
  email: string;
  permissions: Permission[];
};

declare global {
  namespace Express {
    interface Request {
      auth?: AuthenticatedUser;
    }
  }
}
