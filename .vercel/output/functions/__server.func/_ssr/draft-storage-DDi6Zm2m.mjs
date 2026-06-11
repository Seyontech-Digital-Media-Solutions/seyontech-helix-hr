import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { d as CircleCheck, C as Check } from "../_libs/lucide-react.mjs";
function Stepper({
  steps,
  current,
  onJump
}) {
  const progress = (current + 1) / steps.length * 100;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium uppercase tracking-[0.15em]", children: [
        "Step ",
        current + 1,
        " of ",
        steps.length
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        Math.round(progress),
        "% complete"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 w-full overflow-hidden rounded-full bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "h-full rounded-full bg-primary transition-all duration-500 ease-out",
        style: { width: `${progress}%` }
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "hidden gap-2 md:flex md:flex-wrap", children: steps.map((s, i) => {
      const done = i < current;
      const active = i === current;
      return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => onJump?.(i),
          className: `flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${active ? "border-primary bg-primary text-primary-foreground shadow-soft" : done ? "border-primary/30 bg-primary-soft text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: `grid h-4 w-4 place-items-center rounded-full text-[10px] ${active ? "bg-primary-foreground text-primary" : done ? "bg-primary text-primary-foreground" : "bg-muted"}`,
                children: done ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-2.5 w-2.5", strokeWidth: 3 }) : i + 1
              }
            ),
            s.label
          ]
        }
      ) }, s.id);
    }) })
  ] });
}
function SuccessCard({
  title,
  message,
  referenceId,
  primaryHref = "/",
  primaryLabel = "Back to home"
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-xl rounded-2xl border border-border bg-card p-8 text-center shadow-elevated", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success animate-in zoom-in-50 duration-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-9 w-9", strokeWidth: 2 }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-5 font-display text-2xl font-semibold tracking-tight", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: message }),
    referenceId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Reference" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-semibold text-foreground", children: referenceId })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center", children: [
      referenceId && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/status/$referenceId",
          params: { referenceId },
          className: "inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Track your status"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: primaryHref,
          className: "inline-flex h-10 items-center rounded-lg border border-border bg-card px-5 text-sm font-medium text-foreground transition-colors hover:bg-secondary",
          children: primaryLabel
        }
      )
    ] })
  ] });
}
function loadDraft(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}
function saveDraft(key, value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
  }
}
function clearDraft(key) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}
export {
  Stepper as S,
  SuccessCard as a,
  clearDraft as c,
  loadDraft as l,
  saveDraft as s
};
