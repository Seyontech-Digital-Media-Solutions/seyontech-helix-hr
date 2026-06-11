import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { F as Field, c as TextInput } from "./form-fields-DrPgb9Uz.mjs";
import { i as isSupabaseConfigured, a as supabaseConfigMessage, s as supabase } from "./router-BNW6PfCf.mjs";
import { A as AuthShell } from "./auth-shell-Da8gBbw2.mjs";
import { L as LoaderCircle, s as UserPlus, c as Chromium } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
function Signup() {
  useNavigate();
  const [fullName, setFullName] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [confirm, setConfirm] = reactExports.useState("");
  const [inviteCode, setInviteCode] = reactExports.useState("");
  const [showInvite, setShowInvite] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [success, setSuccess] = reactExports.useState(false);
  const [loading, setLoading] = reactExports.useState(false);
  const signUpWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      setError(supabaseConfigMessage);
      return;
    }
    setError("");
    const {
      error: googleError
    } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (googleError) setError(googleError.message);
  };
  const submit = async (event) => {
    event.preventDefault();
    if (!isSupabaseConfigured) {
      setError(supabaseConfigMessage);
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    const isAdminSignup = inviteCode.trim() !== "";
    if (isAdminSignup) {
      {
        setError("Invalid invite code.");
        return;
      }
    }
    setLoading(true);
    setError("");
    const {
      data,
      error: signUpError
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }
    if (isAdminSignup && data.user) {
      await supabase.from("profiles").update({
        role: "admin"
      }).eq("id", data.user.id);
    }
    setLoading(false);
    setSuccess(true);
  };
  if (success) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthShell, { title: "Check your inbox", subtitle: "We sent a confirmation link to your email.", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800", children: "Click the link in your email to activate your account, then sign in." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90", children: "Back to Sign in" })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AuthShell, { title: "Create account", subtitle: "Join to start your onboarding workflow.", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Full name", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { type: "text", value: fullName, onChange: (e) => setFullName(e.target.value), placeholder: "Jane Smith", autoComplete: "name" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Email address", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "you@company.com", autoComplete: "email" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Password", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "Min. 8 characters", autoComplete: "new-password" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Confirm password", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { type: "password", value: confirm, onChange: (e) => setConfirm(e.target.value), placeholder: "Re-enter your password", autoComplete: "new-password" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
          setShowInvite((v) => !v);
          setInviteCode("");
        }, className: "text-xs text-muted-foreground hover:text-foreground underline underline-offset-2", children: showInvite ? "Remove invite code" : "Have an admin invite code?" }),
        showInvite && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Admin invite code", required: false, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { type: "password", value: inviteCode, onChange: (e) => setInviteCode(e.target.value), placeholder: "Enter invite code" }) }) })
      ] }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "submit", disabled: loading, className: "inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60", children: [
        loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-4 w-4" }),
        "Create account"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: signUpWithGoogle, className: "mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium transition-colors hover:bg-secondary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Chromium, { className: "h-4 w-4" }),
      "Continue with Google"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 flex items-center justify-end text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "text-primary hover:underline", children: "Already have an account?" }) })
  ] });
}
export {
  Signup as component
};
