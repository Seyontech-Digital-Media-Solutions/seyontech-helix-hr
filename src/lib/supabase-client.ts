import * as supabaseJs from "@supabase/supabase-js";
const { createClient } = supabaseJs as any;
import {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  getRolePermissions,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  type UserRole,
  type Permission,
} from "./role-permissions";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const isSupabaseConfigured =
  Boolean(supabaseUrl) && Boolean(supabaseKey);

export const supabaseConfigMessage =
  "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.";

// ✅ Safe for SSR — disables localStorage on server, uses in-memory storage instead
const isBrowser = typeof window !== "undefined";

export const supabase = createClient(supabaseUrl ?? "", supabaseKey ?? "", {
  auth: {
    storage: isBrowser ? window.localStorage : undefined,
    persistSession: isBrowser,
    detectSessionInUrl: isBrowser,
  },
});

export { ROLES, PERMISSIONS, ROLE_PERMISSIONS };
export type { UserRole, Permission };
export { getRolePermissions, hasPermission, hasAnyPermission, hasAllPermissions };

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export async function getMyProfile(): Promise<Profile | null> {
  if (!isBrowser) return null; // ✅ Skip on server entirely

  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (!userId) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("[supabase] getMyProfile error:", error.message);
    return null;
  }
  return data as Profile;
}

export async function getMyRole(): Promise<UserRole | null> {
  const profile = await getMyProfile();
  return (profile?.role ?? null) as UserRole | null;
}