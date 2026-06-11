import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { l as loadDraft, s as saveDraft, S as SuccessCard, a as Stepper, c as clearDraft } from "./draft-storage-6P7-Ot1D.mjs";
import { S as SectionTitle, F as Field, T as TextInput, a as Select } from "./form-fields-XqKe4dm6.mjs";
import { u as useAuth, a as supabase } from "./router-_4F4cu0H.mjs";
import { c as Save, A as ArrowLeft, d as ArrowRight } from "../_libs/lucide-react.mjs";
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
const DRAFT_KEY = "ho_postjoin_v1";
const initial = {
  employeeId: autoEmpId(),
  officialEmail: "",
  reportingManager: "",
  workLocation: "",
  employmentType: "",
  shift: "",
  joiningDate: "",
  uan: "",
  pf: "",
  esic: "",
  salaryStructure: "",
  ctc: "",
  insurance: "",
  laptop: "",
  systemId: "",
  idCard: false,
  emailAccess: false,
  softwareAccess: "",
  nda: false,
  companyPolicy: false,
  leavePolicy: false
};
function autoEmpId() {
  return "EMP-" + Math.floor(1e4 + Math.random() * 89999);
}
const STEPS = [{
  id: "employment",
  label: "Employment"
}, {
  id: "payroll",
  label: "HR & Payroll"
}, {
  id: "assets",
  label: "Assets"
}, {
  id: "agreement",
  label: "Agreement"
}];
function PostJoining() {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const [form, setForm] = reactExports.useState(initial);
  const [step, setStep] = reactExports.useState(0);
  const [submitted, setSubmitted] = reactExports.useState(null);
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [submitError, setSubmitError] = reactExports.useState("");
  const [savedAt, setSavedAt] = reactExports.useState(null);
  reactExports.useEffect(() => setForm(loadDraft(DRAFT_KEY, initial)), []);
  reactExports.useEffect(() => {
    if (submitted) return;
    const t = setTimeout(() => {
      saveDraft(DRAFT_KEY, form);
      setSavedAt(/* @__PURE__ */ new Date());
    }, 600);
    return () => clearTimeout(t);
  }, [form, submitted]);
  const set = (k, v) => setForm((f) => ({
    ...f,
    [k]: v
  }));
  const stepValid = reactExports.useMemo(() => {
    if (step === 0) return !!(form.employeeId && form.officialEmail && form.joiningDate);
    if (step === 3) return form.nda && form.companyPolicy && form.leavePolicy;
    return true;
  }, [step, form]);
  const submit = async () => {
    if (!user) {
      navigate({
        to: "/login"
      });
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      const {
        data,
        error
      } = await supabase.from("Submission").insert({
        type: "POST_JOINING",
        referenceId: `POST-${Date.now()}`,
        applicantName: form.employeeId,
        email: form.officialEmail,
        position: form.employmentType,
        department: form.workLocation,
        payload: form,
        submittedById: user.id,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).select("id, referenceId").single();
      if (error) throw new Error(error.message);
      await supabase.functions.invoke("send-email", {
        body: {
          type: "confirmation",
          to: form.officialEmail,
          // post-joining uses officialEmail
          name: form.employeeId,
          referenceId: data.referenceId
        }
      });
      clearDraft(DRAFT_KEY);
      setSubmitted(data.referenceId);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };
  if (submitted) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SuccessCard, { title: "Welcome aboard!", message: "Your post-joining details have been recorded. HR will reach out with next steps.", referenceId: submitted }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold uppercase tracking-[0.18em] text-primary", children: "Post-Joining" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-semibold tracking-tight sm:text-4xl", children: "Complete your onboarding" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Auto-generated Employee ID, payroll details, asset allocation and policy acceptance." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-7", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stepper, { steps: STEPS, current: step, onJump: setStep }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-7 space-y-6", children: [
        step === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { title: "Employment Details" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Employee ID", required: true, hint: "Auto-generated", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { value: form.employeeId, readOnly: true, className: "font-mono" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Official email", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { type: "email", value: form.officialEmail, onChange: (e) => set("officialEmail", e.target.value) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Reporting manager", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { value: form.reportingManager, onChange: (e) => set("reportingManager", e.target.value) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Work location", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { value: form.workLocation, onChange: (e) => set("workLocation", e.target.value) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Employment type", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.employmentType, onChange: (e) => set("employmentType", e.target.value), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select" }),
              ["Full-time", "Part-time", "Contract", "Intern"].map((x) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: x }, x))
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Shift timing", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { value: form.shift, onChange: (e) => set("shift", e.target.value), placeholder: "10:00 – 19:00" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Date of joining", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { type: "date", value: form.joiningDate, onChange: (e) => set("joiningDate", e.target.value) }) })
          ] })
        ] }),
        step === 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { title: "HR & Payroll" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "UAN number", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { value: form.uan, onChange: (e) => set("uan", e.target.value) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "PF number", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { value: form.pf, onChange: (e) => set("pf", e.target.value) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "ESIC number", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { value: form.esic, onChange: (e) => set("esic", e.target.value) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "CTC (per annum)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { value: form.ctc, onChange: (e) => set("ctc", e.target.value), placeholder: "₹ 12,00,000" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Salary structure", className: "sm:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { value: form.salaryStructure, onChange: (e) => set("salaryStructure", e.target.value), placeholder: "Basic + HRA + Special" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Insurance details", className: "sm:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { value: form.insurance, onChange: (e) => set("insurance", e.target.value) }) })
          ] })
        ] }),
        step === 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { title: "Asset Allocation" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Laptop assigned", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { value: form.laptop, onChange: (e) => set("laptop", e.target.value), placeholder: "MacBook Pro 14, 2024" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "System ID", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { value: form.systemId, onChange: (e) => set("systemId", e.target.value) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Software access", className: "sm:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { value: form.softwareAccess, onChange: (e) => set("softwareAccess", e.target.value), placeholder: "Slack, Linear, GitHub" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "ID card issued", checked: form.idCard, onChange: (v) => set("idCard", v) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Email access provided", checked: form.emailAccess, onChange: (v) => set("emailAccess", v) })
          ] })
        ] }),
        step === 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { title: "Employee Agreement", description: "Please acknowledge each policy." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "I accept the Non-Disclosure Agreement (NDA)", checked: form.nda, onChange: (v) => set("nda", v) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "I accept the Company Policy", checked: form.companyPolicy, onChange: (v) => set("companyPolicy", v) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "I accept the Leave Policy", checked: form.leavePolicy, onChange: (v) => set("leavePolicy", v) })
        ] })
      ] }),
      submitError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive", children: submitError }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex items-center justify-between gap-3 border-t border-border pt-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-[11px] text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-3 w-3" }),
          savedAt ? `Draft saved · ${savedAt.toLocaleTimeString()}` : "Auto-save enabled"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setStep((s) => Math.max(0, s - 1)), disabled: step === 0, className: "inline-flex h-10 items-center gap-1.5 rounded-lg border border-border bg-card px-4 text-sm font-medium transition-colors hover:bg-secondary disabled:opacity-40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
            " Back"
          ] }),
          step < STEPS.length - 1 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setStep((s) => Math.min(STEPS.length - 1, s + 1)), disabled: !stepValid, className: "inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50", children: [
            "Continue ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: submit, disabled: !stepValid || submitting, className: "inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50", children: submitting ? "Submitting..." : "Submit form" })
        ] })
      ] })
    ] })
  ] });
}
function Toggle({
  label,
  checked,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/90", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", role: "switch", "aria-checked": checked, onClick: () => onChange(!checked), className: `relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted-foreground/30"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `absolute top-0.5 h-5 w-5 rounded-full bg-card shadow-soft transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}` }) })
  ] });
}
export {
  PostJoining as component
};
