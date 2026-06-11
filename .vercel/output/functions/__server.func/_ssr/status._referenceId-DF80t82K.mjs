import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { R as Route$1, a as supabase } from "./router-_4F4cu0H.mjs";
import { A as ArrowLeft, p as CircleX, m as UserCheck, e as CircleCheck, l as Clock } from "../_libs/lucide-react.mjs";
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
const statusConfig = {
  PENDING: {
    label: "Pending Review",
    icon: Clock,
    color: "text-warning-foreground",
    bg: "bg-warning/20",
    message: "Your submission is under review. HR will update you shortly."
  },
  APPROVED: {
    label: "Approved",
    icon: CircleCheck,
    color: "text-success",
    bg: "bg-success/15",
    message: "Congratulations! Your submission has been approved. HR will contact you with next steps."
  },
  JOINED: {
    label: "Joined",
    icon: UserCheck,
    color: "text-primary",
    bg: "bg-primary-soft",
    message: "Welcome to the team! Your onboarding is complete."
  },
  REJECTED: {
    label: "Rejected",
    icon: CircleX,
    color: "text-destructive",
    bg: "bg-destructive/15",
    message: "Unfortunately your submission was not approved. Please contact HR for more details."
  }
};
function StatusPage() {
  const {
    referenceId
  } = Route$1.useParams();
  const [submission, setSubmission] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [notFound, setNotFound] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const fetchStatus = async () => {
      const {
        data,
        error
      } = await supabase.from("Submission").select("referenceId, applicantName, email, status, createdAt, type").eq("referenceId", referenceId).single();
      if (error || !data) {
        setNotFound(true);
      } else {
        setSubmission(data);
      }
      setLoading(false);
    };
    fetchStatus();
  }, [referenceId]);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-lg px-4 py-20 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Loading your status..." }) });
  }
  if (notFound) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-lg px-4 py-20 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-destructive", children: "Reference ID not found. Please check and try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "mt-4 inline-flex items-center gap-2 text-sm text-primary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
        " Back to home"
      ] })
    ] });
  }
  const config = statusConfig[submission.status];
  const Icon = config.icon;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-lg px-4 py-16 sm:px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-8 shadow-soft text-center space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mx-auto grid h-16 w-16 place-items-center rounded-full ${config.bg}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `h-8 w-8 ${config.color}` }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `inline-block rounded-full px-3 py-1 text-xs font-semibold ${config.bg} ${config.color}`, children: config.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 font-display text-2xl font-semibold tracking-tight", children: "Application Status" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: config.message })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border bg-muted/30 text-left divide-y divide-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between px-4 py-2.5 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Reference ID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-medium", children: submission.referenceId })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between px-4 py-2.5 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: submission.applicantName })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between px-4 py-2.5 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium capitalize", children: submission.type === "PRE_JOINING" ? "Pre-Joining" : "Post-Joining" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between px-4 py-2.5 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Submitted" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: new Date(submission.createdAt).toLocaleDateString(void 0, {
          day: "numeric",
          month: "short",
          year: "numeric"
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "inline-flex items-center gap-2 text-sm text-primary hover:underline", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
      " Back to home"
    ] })
  ] }) });
}
export {
  StatusPage as component
};
