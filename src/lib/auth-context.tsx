import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { 
  supabase, 
  getMyProfile, 
  type Profile, 
  type UserRole,
  getRolePermissions,
  type Permission,
} from "@/lib/supabase-client";

// ── Context shape ────────────────────────────────────────────────
interface AuthContextValue {
  session:  Session | null;
  user:     User    | null;
  profile:  Profile | null;
  role:     UserRole | null;
  permissions: Permission[];
  loading:  boolean;
  isAdmin:  boolean;
  isManager: boolean;
  isEmployee: boolean;
  isViewer: boolean;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  refresh:  () => Promise<void>;
  signOut:  () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession]   = useState<Session | null>(null);
  const [profile, setProfile]   = useState<Profile | null>(null);
  const [loading, setLoading]   = useState(true);

  const loadProfile = async () => {
    const p = await getMyProfile();
    setProfile(p);
  };

  useEffect(() => {
    // initial session
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s);
      if (s) await loadProfile();
      setLoading(false);
    });

    // listen for sign-in / sign-out
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        setSession(s);
        if (s) {
          await loadProfile();
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const refresh = async () => {
    await loadProfile();
  };

const signOut = async () => {
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.error("Sign out error:", e);
  } finally {
    setSession(null);
    setProfile(null);
    setTimeout(() => {
      window.location.href = "/login";
    }, 100);
  }
};

  const role = profile?.role ?? null;
  const permissions = role ? getRolePermissions(role) : [];

  // ── Permission Helpers ─────────────────────────────────────────
  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (perms: Permission[]): boolean => {
    return perms.some((p) => permissions.includes(p));
  };

  const hasAllPermissions = (perms: Permission[]): boolean => {
    return perms.every((p) => permissions.includes(p));
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user:    session?.user ?? null,
        profile,
        role,
        permissions,
        loading,
        isAdmin: role === "admin",
        isManager: role === "manager",
        isEmployee: role === "employee",
        isViewer: role === "viewer",
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        refresh,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}