import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAuth } from "./router-BNW6PfCf.mjs";
import { p as Sparkles, f as ClipboardList, F as FileCheckCorner, a as ArrowRight, o as ShieldCheck } from "../_libs/lucide-react.mjs";
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
function Index() {
  const navigate = useNavigate();
  const {
    user,
    loading
  } = useAuth();
  reactExports.useEffect(() => {
    if (!loading && !user) {
      navigate({
        to: "/login",
        replace: true
      });
    }
  }, [loading, navigate, user]);
  if (loading || !user) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-[calc(100vh-4rem)] place-items-center px-4 text-sm text-muted-foreground", children: "Loading..." });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 -z-10 bg-hero-gradient opacity-[0.04]" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 top-0 -z-10 h-[420px] bg-gradient-to-b from-primary-soft/60 to-transparent" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-3xl text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground shadow-soft", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3 w-3 text-accent" }),
          "Enterprise onboarding, reimagined"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-6 font-display text-4xl font-semibold tracking-tight text-balance sm:text-6xl", children: [
          "Onboard new hires ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: "in minutes" }),
          ", not weeks."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mt-5 max-w-3xl text-balance text-base text-muted-foreground sm:text-lg", children: "A single portal for pre-joining paperwork, post-joining records, document uploads, and HR review — with auto-save, smart validation, and a clean Google Forms-style flow." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-16 grid gap-4 md:grid-cols-2 py-1", children: [{
        to: "/pre-joining",
        icon: ClipboardList,
        title: "Pre-Joining Form",
        desc: "Personal, professional, documents, banking & declaration — collected before day one.",
        tag: "For new hires"
      }, {
        to: "/post-joining",
        icon: FileCheckCorner,
        title: "Post-Joining Form",
        desc: "Employment, payroll, asset allocation and policy acceptance after joining.",
        tag: "For employees"
      }].map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: m.to, className: "group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elevated", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-11 w-11 items-center justify-center rounded-lg bg-primary-soft text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(m.icon, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground", children: m.tag }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-1 font-display text-lg font-semibold tracking-tight", children: m.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 text-sm text-muted-foreground", children: m.desc })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary", children: [
          "Open",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" })
        ] })
      ] }, m.to)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-16 rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-6 sm:grid-cols-3", children: [{
        icon: ShieldCheck,
        title: "Secure by default",
        desc: "Encrypted document handling and role-aware access."
      }, {
        icon: Sparkles,
        title: "Auto-save drafts",
        desc: "Pick up exactly where you left off — across devices."
      }, {
        icon: FileCheckCorner,
        title: "Audit-friendly",
        desc: "Every submission gets a unique reference & timestamp."
      }].map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary-soft text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(f.icon, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: f.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: f.desc })
        ] })
      ] }, f.title)) }) })
    ] })
  ] }) });
}
export {
  Index as component
};
