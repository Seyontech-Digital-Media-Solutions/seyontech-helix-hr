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
 
// ── These match your existing env vars ──────────────────────────
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? "https://example.supabase.co").trim();
const supabaseKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? "placeholder-anon-key").trim();
 
export const isSupabaseConfigured =
  Boolean(import.meta.env.VITE_SUPABASE_URL) && Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY);
 
export const supabaseConfigMessage =
  "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.";
 
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// ── Re-export roles and permissions ────────────────────────────
export { ROLES, PERMISSIONS, ROLE_PERMISSIONS };
export type { UserRole, Permission };
export { getRolePermissions, hasPermission, hasAnyPermission, hasAllPermissions };
 
// ── Types ────────────────────────────────────────────────────────
export interface Profile {
  id:         string;
  full_name:  string | null;
  email:      string | null;
  role:       UserRole;
  created_at: string;
  updated_at: string;
}
 
// ── Fetch the profile (role) for the currently logged-in user ───
export async function getMyProfile(): Promise<Profile | null> {
  // Get current session to determine the logged-in user's id
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (!userId) return null;

 const { data, error } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", userId)
  .maybeSingle(); // ← returns null instead of erroring when no row found

  if (error) {
    console.error("[supabase] getMyProfile error:", error.message);
    return null;
  }
  return data as Profile;
}
 
// ── Get role string only ─────────────────────────────────────────
export async function getMyRole(): Promise<UserRole | null> {
  const profile = await getMyProfile();
  return (profile?.role ?? null) as UserRole | null;
}