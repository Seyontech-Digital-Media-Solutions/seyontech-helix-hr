import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { l as loadDraft, s as saveDraft, a as SuccessCard, S as Stepper, c as clearDraft } from "./draft-storage-DDi6Zm2m.mjs";
import { u as useAuth, s as supabase } from "./router-BNW6PfCf.mjs";
import { S as SectionTitle, F as Field, c as TextInput, b as Select, T as TextArea, a as FileDrop } from "./form-fields-DrPgb9Uz.mjs";
import { S as Save, A as ArrowLeft, a as ArrowRight } from "../_libs/lucide-react.mjs";
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
const BUCKETS = {
  preJoining: "pre-joining-documents"
};
function sanitizeName(name) {
  return name.toLowerCase().trim().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") || "unknown";
}
async function uploadFile(file, fieldKey, userId, formType, userName) {
  const bucket = BUCKETS.preJoining;
  const folderName = userName ? sanitizeName(userName) : userId;
  const ext = file.name.split(".").pop();
  const path = `${folderName}/${fieldKey}_${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) throw new Error(error.message);
  return path;
}
const DRAFT_KEY = "ho_prejoin_v1";
const initial = {
  fullName: "",
  dob: "",
  gender: "",
  bloodGroup: "",
  mobile: "",
  altMobile: "",
  email: "",
  currentAddress: "",
  permanentAddress: "",
  emergencyName: "",
  emergencyNumber: "",
  position: "",
  department: "",
  joinDate: "",
  prevCompany: "",
  experience: "",
  skills: "",
  linkedin: "",
  portfolio: "",
  bankName: "",
  accountHolder: "",
  accountNumber: "",
  ifsc: "",
  branch: "",
  signature: "",
  agree: false,
  fileAadhaar: "",
  filePan: "",
  fileResume: "",
  filePhoto: "",
  fileEdu: "",
  fileExp: ""
};
const STEPS = [{
  id: "personal",
  label: "Personal"
}, {
  id: "professional",
  label: "Professional"
}, {
  id: "documents",
  label: "Documents"
}, {
  id: "bank",
  label: "Banking"
}, {
  id: "review",
  label: "Review & Submit"
}];
function PreJoining() {
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
  reactExports.useEffect(() => {
    setForm(loadDraft(DRAFT_KEY, initial));
  }, []);
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
  const stepValid = reactExports.useMemo(() => validateStep(step, form), [step, form]);
  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));
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
        type: "PRE_JOINING",
        referenceId: `PRE-${Date.now()}`,
        applicantName: form.fullName,
        email: form.email,
        position: form.position,
        department: form.department,
        payload: form,
        submittedById: user.id,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).select("id, referenceId").single();
      if (error) throw new Error(error.message);
      await supabase.functions.invoke("send-email", {
        body: {
          type: "confirmation",
          to: form.email,
          // pre-joining uses email
          name: form.fullName,
          // pre-joining uses fullName
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
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SuccessCard, { title: "Submission received", message: "Thanks for completing the pre-joining form. Our HR team will review your details and get back to you shortly.", referenceId: submitted }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold uppercase tracking-[0.18em] text-primary", children: "Pre-Joining" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-semibold tracking-tight sm:text-4xl", children: "Tell us about yourself" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "We'll use this to set up your account before day one. Your progress is saved automatically." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-7", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stepper, { steps: STEPS, current: step, onJump: setStep }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-7 space-y-6", children: [
        step === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(PersonalStep, { form, set }),
        step === 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(ProfessionalStep, { form, set }),
        step === 2 && /* @__PURE__ */ jsxRuntimeExports.jsx(DocumentsStep, { form, set }),
        step === 3 && /* @__PURE__ */ jsxRuntimeExports.jsx(BankStep, { form, set }),
        step === 4 && /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewStep, { form, set })
      ] }),
      submitError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive", children: submitError }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex items-center justify-between gap-3 border-t border-border pt-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-[11px] text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-3 w-3" }),
          savedAt ? `Draft saved · ${savedAt.toLocaleTimeString()}` : "Auto-save enabled"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: back, disabled: step === 0, className: "inline-flex h-10 items-center gap-1.5 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
            " Back"
          ] }),
          step < STEPS.length - 1 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: next, disabled: !stepValid, className: "inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50", children: [
            "Continue ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: submit, disabled: !form.agree || !form.signature || submitting, className: "inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50", children: submitting ? "Submitting..." : "Submit form" })
        ] })
      ] })
    ] })
  ] });
}
function validateStep(step, f) {
  if (step === 0) return !!(f.fullName && f.email && f.mobile && f.dob && f.gender);
  if (step === 1) return !!(f.position && f.department && f.joinDate);
  if (step === 2) return true;
  if (step === 3) return !!(f.bankName && f.accountNumber && f.ifsc);
  return true;
}
function PersonalStep({
  form,
  set
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { title: "Personal Information", description: "Basic details and contact information." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Full name", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { value: form.fullName, onChange: (e) => set("fullName", e.target.value), placeholder: "Jane Doe" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Date of birth", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { type: "date", value: form.dob, onChange: (e) => set("dob", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Gender", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.gender, onChange: (e) => set("gender", e.target.value), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Female" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Male" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Non-binary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Prefer not to say" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Blood group", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.bloodGroup, onChange: (e) => set("bloodGroup", e.target.value), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select" }),
        ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: b }, b))
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Mobile number", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { type: "tel", value: form.mobile, onChange: (e) => set("mobile", e.target.value), placeholder: "+91 98765 43210" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Alternate number", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { type: "tel", value: form.altMobile, onChange: (e) => set("altMobile", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Email address", required: true, className: "sm:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { type: "email", value: form.email, onChange: (e) => set("email", e.target.value), placeholder: "jane@example.com" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Current address", className: "sm:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextArea, { value: form.currentAddress, onChange: (e) => set("currentAddress", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Permanent address", className: "sm:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextArea, { value: form.permanentAddress, onChange: (e) => set("permanentAddress", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Emergency contact person", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { value: form.emergencyName, onChange: (e) => set("emergencyName", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Emergency contact number", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { type: "tel", value: form.emergencyNumber, onChange: (e) => set("emergencyNumber", e.target.value) }) })
    ] })
  ] });
}
function ProfessionalStep({
  form,
  set
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { title: "Professional Information", description: "Your role, experience, and links." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Applied position", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { value: form.position, onChange: (e) => set("position", e.target.value), placeholder: "Software Engineer" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Department", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.department, onChange: (e) => set("department", e.target.value), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select" }),
        ["Engineering", "Design", "Product", "Marketing", "Sales", "People", "Finance", "Operations"].map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: d }, d))
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Expected joining date", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { type: "date", value: form.joinDate, onChange: (e) => set("joinDate", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Total experience", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { value: form.experience, onChange: (e) => set("experience", e.target.value), placeholder: "3 years" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Previous company", className: "sm:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { value: form.prevCompany, onChange: (e) => set("prevCompany", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Skills", hint: "Comma separated", className: "sm:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { value: form.skills, onChange: (e) => set("skills", e.target.value), placeholder: "TypeScript, React, PostgreSQL" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "LinkedIn profile", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { type: "url", value: form.linkedin, onChange: (e) => set("linkedin", e.target.value), placeholder: "https://linkedin.com/in/..." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Portfolio / GitHub URL", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { type: "url", value: form.portfolio, onChange: (e) => set("portfolio", e.target.value), placeholder: "https://github.com/..." }) })
    ] })
  ] });
}
function DocumentsStep({
  form,
  set
}) {
  const {
    user
  } = useAuth();
  const [uploading, setUploading] = reactExports.useState({});
  const files = [["fileAadhaar", "Aadhaar card"], ["filePan", "PAN card"], ["fileResume", "Resume / CV"], ["filePhoto", "Passport size photo"], ["fileEdu", "Educational certificates"], ["fileExp", "Experience certificates"]];
  const handleFile = async (key, file) => {
    if (!file || !user) return;
    setUploading((u) => ({
      ...u,
      [key]: true
    }));
    try {
      const path = await uploadFile(
        file,
        key,
        user.id,
        "pre-joining",
        form.fullName
        // 👈 pass the name here
      );
      set(key, path);
    } catch (err) {
      alert(`Upload failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setUploading((u) => ({
        ...u,
        [key]: false
      }));
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { title: "Documents", description: "Upload clear scans or photos. PDF or image formats." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: files.map(([key, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx(FileDrop, { label, fileName: uploading[key] ? "Uploading…" : form[key] ? "✅ Uploaded" : "", onChange: (file) => handleFile(key, file) }, key)) })
  ] });
}
function BankStep({
  form,
  set
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { title: "Bank Details", description: "For salary credit." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Bank name", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { value: form.bankName, onChange: (e) => set("bankName", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Account holder name", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { value: form.accountHolder, onChange: (e) => set("accountHolder", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Account number", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { value: form.accountNumber, onChange: (e) => set("accountNumber", e.target.value) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "IFSC code", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { value: form.ifsc, onChange: (e) => set("ifsc", e.target.value.toUpperCase()) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Branch name", className: "sm:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { value: form.branch, onChange: (e) => set("branch", e.target.value) }) })
    ] })
  ] });
}
function ReviewStep({
  form,
  set
}) {
  const rows = [["Full name", form.fullName], ["Email", form.email], ["Position", form.position], ["Department", form.department], ["Joining date", form.joinDate], ["Bank", `${form.bankName} · ${form.accountNumber}`]];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { title: "Review & Declaration", description: "Verify your details and sign to submit." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("dl", { className: "divide-y divide-border rounded-lg border border-border bg-muted/30", children: rows.map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3 px-4 py-2.5 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: k }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "col-span-2 font-medium text-foreground", children: v || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/60", children: "—" }) })
    ] }, k)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Digital signature (type your full name)", required: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { value: form.signature, onChange: (e) => set("signature", e.target.value), placeholder: "Jane Doe", className: "font-display italic" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: form.agree, onChange: (e) => set("agree", e.target.checked), className: "mt-0.5 h-4 w-4 rounded border-input accent-[color:var(--primary)]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/90", children: "I confirm the information provided is accurate and agree to the company's onboarding policies, code of conduct, and data privacy terms." })
    ] })
  ] });
}
export {
  PreJoining as component
};
