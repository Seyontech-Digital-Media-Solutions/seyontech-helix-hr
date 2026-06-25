import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { Field, TextInput } from "@/components/form-fields";
import { isSupabaseConfigured, supabase, supabaseConfigMessage } from "@/lib/supabase-client";
import { requireGuest } from "@/lib/route-guards";
import { AuthShell } from "@/components/auth-shell";
 
export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [{ title: "Forgot Password - Seyon Onboarding" }],
  }),
  beforeLoad: requireGuest,
  component: ForgotPassword,
});
 
function ForgotPassword() {
  const [email,   setEmail]   = useState("");
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
 
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isSupabaseConfigured) { setError(supabaseConfigMessage); return; }
 
    setLoading(true);
    setError("");
 
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
 
    setLoading(false);
    if (resetError) { setError(resetError.message); return; }
    setSent(true);
  };
 
  if (sent) {
    return (
      <AuthShell title="Check your inbox" subtitle="A password reset link has been sent to your email.">
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 mb-4">
          The link expires in 1 hour. Check your spam folder if you don't see it.
        </div>
        <Link
          to="/login"
          className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Back to Sign in
        </Link>
      </AuthShell>
    );
  }
 
  return (
    <AuthShell title="Forgot password?" subtitle="Enter your email and we'll send you a reset link.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email address" required>
          <TextInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
          />
        </Field>
 
        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
        )}
 
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
          Send reset link
        </button>
      </form>
 
      <div className="mt-5 text-sm text-center">
        <Link to="/login" className="text-primary hover:underline">
          Back to Sign in
        </Link>
      </div>
    </AuthShell>
  );
}