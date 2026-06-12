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

// ✅ Lazy singleton — createClient is NEVER called on the server
let _supabase: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  // Server: return a no-op stub so imports don't crash
  if (typeof window === "undefined") {
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signOut: async () => {},
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: null, error: null }),
            single: async () => ({ data: null, error: null }),
          }),
        }),
        insert: () => ({
          select: () => ({
            single: async () => ({ data: null, error: null }),
          }),
        }),
      }),
      functions: {
        invoke: async () => ({ data: null, error: null }),
      },
    } as any;
  }

  // Browser: create once and reuse
  if (!_supabase) {
    _supabase = createClient(supabaseUrl ?? "", supabaseKey ?? "", {
      auth: {
        storage: window.localStorage,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  }

  return _supabase;
}

// ✅ Export as a proxy — all .auth, .from, .functions calls go through getSupabaseClient()
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    return getSupabaseClient()[prop as string];
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
  if (typeof window === "undefined") return null;

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