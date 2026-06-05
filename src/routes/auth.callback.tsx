import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase, getMyRole } from "@/lib/supabase-client";
import { Loader2 } from "lucide-react";
 
export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});
 
/**
 * Supabase redirects here after:
 *  - Google OAuth sign-in
 *  - Email confirmation link click
 *  - Password reset link click (goes to /auth/reset-password instead)
 *
 * We wait for the session to settle then route by role.
 */
function AuthCallback() {
  const navigate = useNavigate();
 
  useEffect(() => {
    const handle = async () => {
      // Give Supabase a moment to exchange the code for a session
      const { data: { session } } = await supabase.auth.getSession();
 
      if (!session) {
        // No session — redirect to login
        navigate({ to: "/login" });
        return;
      }
 
      const role = await getMyRole();
      navigate({ to: role === "admin" ? "/admin" : "/" });
    };
 
    handle();
  }, [navigate]);
 
  return (
    <div className="flex min-h-screen items-center justify-center flex-col gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Completing sign-in…</p>
    </div>
  );
}
