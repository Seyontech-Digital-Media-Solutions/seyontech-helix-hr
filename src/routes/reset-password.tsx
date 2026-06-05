import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, Lock } from "lucide-react";
import { useState } from "react";
import { Field, TextInput } from "@/components/form-fields";
import { supabase } from "@/lib/supabase-client";
import { AuthShell } from "@/components/auth-shell";
 
export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{ title: "Reset Password - Seyon Onboarding" }],
  }),
  component: ResetPassword,
});
 
function ResetPassword() {
  const navigate = useNavigate();
  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [error,     setError]     = useState("");
  const [loading,   setLoading]   = useState(false);
 
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirm)  { setError("Passwords do not match."); return; }
    if (password.length < 8)   { setError("Password must be at least 8 characters."); return; }
 
    setLoading(true);
    setError("");
 
    const { error: updateError } = await supabase.auth.updateUser({ password });
 
    setLoading(false);
    if (updateError) { setError(updateError.message); return; }
 
    // Sign out so the user re-authenticates with the new password
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };
 
  return (
    <AuthShell title="Set new password" subtitle="Choose a strong password for your account.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="New password" required>
          <TextInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            autoComplete="new-password"
          />
        </Field>
 
        <Field label="Confirm new password" required>
          <TextInput
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter your new password"
            autoComplete="new-password"
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
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
          Update password
        </button>
      </form>
    </AuthShell>
  );
}
 
