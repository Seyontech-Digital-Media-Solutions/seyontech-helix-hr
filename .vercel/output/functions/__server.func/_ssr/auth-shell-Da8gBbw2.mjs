import { j as jsxRuntimeExports } from "../_libs/react.mjs";
function AuthShell({
  title,
  subtitle,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4 py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "w-full rounded-lg border border-border bg-card p-6 shadow-soft", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl font-semibold tracking-tight", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: subtitle })
    ] }),
    children
  ] }) });
}
export {
  AuthShell as A
};
