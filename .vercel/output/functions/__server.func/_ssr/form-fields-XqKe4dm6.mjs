import { j as jsxRuntimeExports } from "../_libs/react.mjs";
const baseInput = "w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:opacity-50";
function Field({
  label,
  required,
  hint,
  children,
  className = ""
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: `flex flex-col gap-1.5 ${className}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium text-foreground/80", children: [
      label,
      required && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-0.5 text-destructive", children: "*" })
    ] }),
    children,
    hint && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground", children: hint })
  ] });
}
function TextInput(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ...props, className: `${baseInput} ${props.className ?? ""}` });
}
function TextArea(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { ...props, className: `${baseInput} min-h-[88px] resize-y ${props.className ?? ""}` });
}
function Select(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("select", { ...props, className: `${baseInput} ${props.className ?? ""}` });
}
function FileDrop({
  label,
  onChange,
  fileName,
  accept
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "group flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-muted/40 px-4 py-5 text-center transition-colors hover:border-primary/60 hover:bg-primary-soft/50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground", children: fileName ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: fileName }) : "Click to upload (max 5MB)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type: "file",
        accept,
        className: "hidden",
        onChange: (e) => onChange(e.target.files?.[0] ?? null)
      }
    )
  ] });
}
function SectionTitle({ title, description }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-semibold tracking-tight", children: title }),
    description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: description })
  ] });
}
export {
  Field as F,
  SectionTitle as S,
  TextInput as T,
  Select as a,
  TextArea as b,
  FileDrop as c
};
