import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { F as Field, T as TextInput } from "./form-fields-XqKe4dm6.mjs";
import { i as isSupabaseConfigured, s as supabaseConfigMessage, a as supabase, g as getMyRole } from "./router-_4F4cu0H.mjs";
import { A as AuthShell } from "./auth-shell-Da8gBbw2.mjs";
import { g as User, h as ShieldCheck, a as LoaderCircle, i as LogIn, C as Chromium } from "../_libs/lucide-react.mjs";
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
function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = reactExports.useState("user");
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [error, setError] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const switchMode = (m) => {
    setMode(m);
    setError("");
    setEmail("");
    setPassword("");
  };
  const submit = async (event) => {
    event.preventDefault();
    if (!isSupabaseConfigured) {
      setError(supabaseConfigMessage);
      return;
    }
    setLoading(true);
    setError("");
    const {
      error: signInError
    } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }
    const role = await getMyRole();
    if (mode === "admin" && role !== "admin") {
      await supabase.auth.signOut();
      setError("You do not have admin access.");
      setLoading(false);
      return;
    }
    setLoading(false);
    navigate({
      to: role === "admin" ? "/admin" : "/"
    });
  };
  const loginWithGoogle = async () => {
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
  const isAdmin = mode === "admin";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AuthShell, { title: isAdmin ? "Admin sign in" : "Welcome back", subtitle: isAdmin ? "Sign in to access the HR dashboard." : "Sign in to continue your onboarding workflow.", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex rounded-lg border border-border bg-muted/40 p-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => switchMode("user"), className: `flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors ${mode === "user" ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4" }),
        "User"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => switchMode("admin"), className: `flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors ${mode === "admin" ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4" }),
        "Admin"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Email address", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: isAdmin ? "admin@company.com" : "you@gmail.com", autoComplete: "email" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Password", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "••••••••", autoComplete: "current-password" }) }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "submit", disabled: loading, className: `inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium text-primary-foreground transition-colors disabled:opacity-60 ${isAdmin ? "bg-foreground hover:bg-foreground/90" : "bg-primary hover:bg-primary/90"}`, children: [
        loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(LogIn, { className: "h-4 w-4" }),
        isAdmin ? "Sign in as Admin" : "Sign in"
      ] })
    ] }),
    !isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: loginWithGoogle, className: "mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium transition-colors hover:bg-secondary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Chromium, { className: "h-4 w-4" }),
      "Continue with Google"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex items-center justify-between text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/forgot-password", className: "text-primary hover:underline", children: "Forgot password?" }),
      !isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/signup", className: "text-primary hover:underline", children: "Create account" })
    ] })
  ] });
}
export {
  Login as component
};
