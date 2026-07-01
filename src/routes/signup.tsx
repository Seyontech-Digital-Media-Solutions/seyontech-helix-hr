import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Chrome, Loader2, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Field, TextInput } from "@/components/form-fields";
import {
  isSupabaseConfigured,
  supabase,
  supabaseConfigMessage,
} from "@/lib/supabase-client";
import { requireGuest } from "@/lib/route-guards";
import { AuthShell } from "@/components/auth-shell";
 
// ── Admin invite code (store this only in your .env, never commit it) ──
// Set VITE_ADMIN_INVITE_CODE=your-secret-code in your .env file
const ADMIN_INVITE_CODE = import.meta.env.VITE_ADMIN_INVITE_CODE as string | undefined;
 
export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [{ title: "Create Account - Seyon Onboarding" }],
  }),
  beforeLoad: requireGuest,
  component: Signup,
});
 
function Signup() {
  const navigate  = useNavigate();
 
  const [fullName,    setFullName]    = useState("");
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [inviteCode,  setInviteCode]  = useState("");
  const [showInvite,  setShowInvite]  = useState(false);
  const [error,       setError]       = useState("");
  const [success,     setSuccess]     = useState(false);
  const [loading,     setLoading]     = useState(false);
 
  const signUpWithGoogle = async () => {
    if (!isSupabaseConfigured) { setError(supabaseConfigMessage); return; }
    setError("");
    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (googleError) setError(googleError.message);
  };
 
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isSupabaseConfigured) { setError(supabaseConfigMessage); return; }
    if (password !== confirm)  { setError("Passwords do not match."); return; }
    if (password.length < 8)   { setError("Password must be at least 8 characters."); return; }
 
    // Validate invite code if provided
    const isAdminSignup = inviteCode.trim() !== "";
    if (isAdminSignup) {
      if (!ADMIN_INVITE_CODE || inviteCode.trim() !== ADMIN_INVITE_CODE) {
        setError("Invalid invite code.");
        return;
      }
    }
 
    setLoading(true);
    setError("");
 
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
 
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }
 
    // If admin invite code was valid, promote the user to admin in profiles table
    if (isAdminSignup && data.user) {
      await supabase
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", data.user.id);
    }
 
    setLoading(false);
    setSuccess(true);
  };
 
  if (success) {
    return (
      <AuthShell
        title="Check your inbox"
        subtitle="We sent a confirmation link to your email."
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
            Click the link in your email to activate your account, then sign in.
          </div>
          <Link
            to="/login"
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Back to Sign in
          </Link>
        </div>
      </AuthShell>
    );
  }
 
  return (
    <AuthShell
      title="Create account"
      subtitle="Join to start your onboarding workflow."
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Full name" required>
          <TextInput
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Smith"
            autoComplete="name"
          />
        </Field>
 
        <Field label="Email address" required>
          <TextInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
          />
        </Field>
 
        <Field label="Password" required>
          <TextInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            autoComplete="new-password"
          />
        </Field>
 
        <Field label="Confirm password" required>
          <TextInput
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter your password"
            autoComplete="new-password"
          />
        </Field>
 
        {/* Admin invite code — hidden by default */}
        <div>
          <button
            type="button"
            onClick={() => { setShowInvite((v) => !v); setInviteCode(""); }}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
          >
            {showInvite ? "Remove invite code" : "Have an admin invite code?"}
          </button>
 
          {showInvite && (
            <div className="mt-2">
              <Field label="Admin invite code" required={false}>
                <TextInput
                  type="password"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Enter invite code"
                />
              </Field>
            </div>
          )}
        </div>
 
        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
        )}
 
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          Create account
        </button>
      </form>
 
      <button
        type="button"
        onClick={signUpWithGoogle}
        className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium transition-colors hover:bg-secondary"
      >
        <Chrome className="h-4 w-4" />
        Continue with Google
      </button>
 
      <div className="mt-5 flex items-center justify-end text-sm">
        <Link to="/login" className="text-primary hover:underline">
          Already have an account?
        </Link>
      </div>
    </AuthShell>
  );
}
 