import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Chrome, Loader2, LogIn, ShieldCheck, User } from "lucide-react";
import { useState } from "react";
import { Field, TextInput } from "@/components/form-fields";
import { isSupabaseConfigured, supabase, supabaseConfigMessage, getMyRole } from "@/lib/supabase-client";
import { requireGuest } from "@/lib/route-guards";
import { AuthShell } from "@/components/auth-shell";
 
export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Login - Seyon Onboarding" }],
  }),
  beforeLoad: requireGuest,
  component: Login,
});
 
type LoginMode = "user" | "admin";
 
function Login() {
  const navigate = useNavigate();
  const [mode,     setMode]     = useState<LoginMode>("user");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
 
  const switchMode = (m: LoginMode) => {
    setMode(m);
    setError("");
    setEmail("");
    setPassword("");
  };
 
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isSupabaseConfigured) { setError(supabaseConfigMessage); return; }
 
    setLoading(true);
    setError("");
 
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
 
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }
 
    const role = await getMyRole();
 
    // If user picked "Admin" tab but their role isn't admin — block them
    if (mode === "admin" && role !== "admin") {
      await supabase.auth.signOut();
      setError("You do not have admin access.");
      setLoading(false);
      return;
    }
 
    // If user picked "User" tab but they're actually an admin — redirect correctly
    setLoading(false);
    navigate({ to: role === "admin" ? "/admin" : "/" });
  };
 
  const loginWithGoogle = async () => {
    if (!isSupabaseConfigured) { setError(supabaseConfigMessage); return; }
    setError("");
    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (googleError) setError(googleError.message);
  };
 
  const isAdmin = mode === "admin";
 
  return (
    <AuthShell
      title={isAdmin ? "Admin sign in" : "Welcome back"}
      subtitle={
        isAdmin
          ? "Sign in to access the HR dashboard."
          : "Sign in to continue your onboarding workflow."
      }
    >
      {/* Toggle */}
      <div className="mb-6 flex rounded-lg border border-border bg-muted/40 p-1">
        <button
          type="button"
          onClick={() => switchMode("user")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors ${
            mode === "user"
              ? "bg-card text-foreground shadow-soft"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <User className="h-4 w-4" />
          User
        </button>
        <button
          type="button"
          onClick={() => switchMode("admin")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors ${
            mode === "admin"
              ? "bg-card text-foreground shadow-soft"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          Admin
        </button>
      </div>
 
      {/* Form */}
      {/* Form */}
<form onSubmit={submit} className="space-y-4">
  <Field label="Email address" required>
    <TextInput
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder={isAdmin ? "admin@company.com" : "you@gmail.com"}
      autoComplete="email"
    />
  </Field>

  <Field label="Password" required>
    <TextInput
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="••••••••"
      autoComplete="current-password"
    />
  </Field>

  {error && (
    <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
  )}

  <button
    type="submit"
    disabled={loading}
    className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium text-primary-foreground transition-colors disabled:opacity-60 ${
      isAdmin
        ? "bg-foreground hover:bg-foreground/90"
        : "bg-primary hover:bg-primary/90"
    }`}
  >
    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
    {isAdmin ? "Sign in as Admin" : "Sign in"}
  </button>
</form>

{/* Google — now for both users and admins */}
<button
  type="button"
  onClick={loginWithGoogle}
  className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium transition-colors hover:bg-secondary"
>
  <Chrome className="h-4 w-4" />
  Continue with Google
</button>

<div className="mt-5 flex items-center justify-between text-sm">
  <Link to="/forgot-password" className="text-primary hover:underline">
    Forgot password?
  </Link>
  {/* Create account — now for both users and admins */}
  <Link to="/signup" className="text-primary hover:underline">
    Create account
  </Link>
</div>
    </AuthShell>
  );
}