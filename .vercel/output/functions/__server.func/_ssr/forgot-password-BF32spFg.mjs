import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { F as Field, T as TextInput } from "./form-fields-XqKe4dm6.mjs";
import { i as isSupabaseConfigured, s as supabaseConfigMessage, a as supabase } from "./router-_4F4cu0H.mjs";
import { A as AuthShell } from "./auth-shell-Da8gBbw2.mjs";
import { a as LoaderCircle, j as Mail } from "../_libs/lucide-react.mjs";
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
function ForgotPassword() {
  const [email, setEmail] = reactExports.useState("");
  const [sent, setSent] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const submit = async (event) => {
    event.preventDefault();
    if (!isSupabaseConfigured) {
      setError(supabaseConfigMessage);
      return;
    }
    setLoading(true);
    setError("");
    const {
      error: resetError
    } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  };
  if (sent) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(AuthShell, { title: "Check your inbox", subtitle: "A password reset link has been sent to your email.", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 mb-4", children: "The link expires in 1 hour. Check your spam folder if you don't see it." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90", children: "Back to Sign in" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AuthShell, { title: "Forgot password?", subtitle: "Enter your email and we'll send you a reset link.", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Email address", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "you@company.com", autoComplete: "email" }) }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "submit", disabled: loading, className: "inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60", children: [
        loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-4 w-4" }),
        "Send reset link"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 text-sm text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "text-primary hover:underline", children: "Back to Sign in" }) })
  ] });
}
export {
  ForgotPassword as component
};
