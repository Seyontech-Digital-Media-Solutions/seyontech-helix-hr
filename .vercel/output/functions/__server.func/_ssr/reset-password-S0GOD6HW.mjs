import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { F as Field, T as TextInput } from "./form-fields-XqKe4dm6.mjs";
import { a as supabase } from "./router-_4F4cu0H.mjs";
import { A as AuthShell } from "./auth-shell-Da8gBbw2.mjs";
import { a as LoaderCircle, b as Lock } from "../_libs/lucide-react.mjs";
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
function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = reactExports.useState("");
  const [confirm, setConfirm] = reactExports.useState("");
  const [error, setError] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const submit = async (event) => {
    event.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");
    const {
      error: updateError
    } = await supabase.auth.updateUser({
      password
    });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    await supabase.auth.signOut();
    navigate({
      to: "/login"
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthShell, { title: "Set new password", subtitle: "Choose a strong password for your account.", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "New password", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "Min. 8 characters", autoComplete: "new-password" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Confirm new password", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { type: "password", value: confirm, onChange: (e) => setConfirm(e.target.value), placeholder: "Re-enter your new password", autoComplete: "new-password" }) }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive", children: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "submit", disabled: loading, className: "inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60", children: [
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-4 w-4" }),
      "Update password"
    ] })
  ] }) });
}
export {
  ResetPassword as component
};
