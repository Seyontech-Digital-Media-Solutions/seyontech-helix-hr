import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { Stepper } from "@/components/form-stepper";
import { Field, SectionTitle, Select, TextInput } from "@/components/form-fields";
import { SuccessCard } from "@/components/success-card";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase-client.ts";
import { clearDraft, loadDraft, saveDraft } from "@/lib/draft-storage";

export const Route = createFileRoute("/post-joining")({
  head: () => ({
    meta: [
      { title: "Post-Joining Form — Helix HR" },
      {
        name: "description",
        content: "Complete employment, payroll, and asset allocation details after joining.",
      },
    ],
  }),
  component: PostJoining,
});

const DRAFT_KEY = "ho_postjoin_v1";

interface FormState {
  employeeId: string;
  officialEmail: string;
  reportingManager: string;
  workLocation: string;
  employmentType: string;
  shift: string;
  joiningDate: string;
  uan: string;
  pf: string;
  esic: string;
  salaryStructure: string;
  ctc: string;
  insurance: string;
  laptop: string;
  systemId: string;
  idCard: boolean;
  emailAccess: boolean;
  softwareAccess: string;
  nda: boolean;
  companyPolicy: boolean;
  leavePolicy: boolean;
}

const initial: FormState = {
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
  leavePolicy: false,
};

function autoEmpId() {
  return "EMP-" + Math.floor(10000 + Math.random() * 89999);
}

const STEPS = [
  { id: "employment", label: "Employment" },
  { id: "payroll", label: "HR & Payroll" },
  { id: "assets", label: "Assets" },
  { id: "agreement", label: "Agreement" },
];

function PostJoining() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>(initial);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => setForm(loadDraft(DRAFT_KEY, initial)), []);
  useEffect(() => {
    if (submitted) return;
    const t = setTimeout(() => {
      saveDraft(DRAFT_KEY, form);
      setSavedAt(new Date());
    }, 600);
    return () => clearTimeout(t);
  }, [form, submitted]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

 const stepValid = useMemo(() => {
  if (step === 0)
    return !!(
      form.employeeId &&
      form.officialEmail &&
      form.joiningDate &&
      form.employmentType &&
      form.workLocation &&
      form.reportingManager &&
      form.shift
    );
  if (step === 1)
    return !!(form.uan && form.pf && form.ctc);
  if (step === 2) return true;
  if (step === 3)
    return form.nda && form.companyPolicy && form.leavePolicy;
  return true;
}, [step, form]);

  const submit = async () => {
    if (!user) {
      navigate({ to: "/login" });
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const { data, error } = await supabase
        .from("Submission")
        .insert({
          type: "POST_JOINING",
          referenceId: `POST-${Date.now()}`,
          applicantName: form.employeeId,
          email: form.officialEmail,
          position: form.employmentType,
          department: form.workLocation,
          payload: form,
          submittedById: user.id,
          updatedAt: new Date().toISOString(),
        })
        .select("id, referenceId")
        .single();

      if (error) throw new Error(error.message);

      // ✅ Send confirmation email
      await supabase.functions.invoke("send-email", {
        body: {
          type: "confirmation",
          to: form.officialEmail,        // post-joining uses officialEmail
          name: form.employeeId,
          referenceId: data.referenceId,
        },
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
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <SuccessCard
          title="Welcome aboard!"
          message="Your post-joining details have been recorded. HR will reach out with next steps."
          referenceId={submitted}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Post-Joining
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Complete your onboarding
        </h1>
        <p className="text-sm text-muted-foreground">
          Auto-generated Employee ID, payroll details, asset allocation and policy acceptance.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-7">
        <Stepper steps={STEPS} current={step} onJump={setStep} />

        <div className="mt-7 space-y-6">
          {step === 0 && (
  <div className="space-y-5">
    <SectionTitle title="Employment Details" />
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Employee ID" required hint="Auto-generated">
        <TextInput value={form.employeeId} readOnly className="font-mono" />
      </Field>

      <Field label="Official email" required>
        <TextInput
          type="email"
          value={form.officialEmail}
          onChange={(e) => set("officialEmail", e.target.value)}
          className={touched && !form.officialEmail ? "border-red-500" : ""}
        />
        {touched && !form.officialEmail && (
          <p className="mt-1 text-xs font-medium text-red-500">● Official email is required.</p>
        )}
      </Field>

      <Field label="Reporting manager" required>
        <TextInput
          value={form.reportingManager}
          onChange={(e) => set("reportingManager", e.target.value)}
          className={touched && !form.reportingManager ? "border-red-500" : ""}
        />
        {touched && !form.reportingManager && (
          <p className="mt-1 text-xs font-medium text-red-500">● Reporting manager is required.</p>
        )}
      </Field>

      <Field label="Work location" required>
        <TextInput
          value={form.workLocation}
          onChange={(e) => set("workLocation", e.target.value)}
          className={touched && !form.workLocation ? "border-red-500" : ""}
        />
        {touched && !form.workLocation && (
          <p className="mt-1 text-xs font-medium text-red-500">● Work location is required.</p>
        )}
      </Field>

      <Field label="Employment type" required>
        <Select
          value={form.employmentType}
          onChange={(e) => set("employmentType", e.target.value)}
          className={touched && !form.employmentType ? "border-red-500" : ""}
        >
          <option value="">Select</option>
          {["Full-time", "Part-time", "Contract", "Intern"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </Select>
        {touched && !form.employmentType && (
          <p className="mt-1 text-xs font-medium text-red-500">● Please select employment type.</p>
        )}
      </Field>

      <Field label="Shift timing" required>
        <TextInput
          value={form.shift}
          onChange={(e) => set("shift", e.target.value)}
          placeholder="10:00 – 19:00"
          className={touched && !form.shift ? "border-red-500" : ""}
        />
        {touched && !form.shift && (
          <p className="mt-1 text-xs font-medium text-red-500">● Shift timing is required.</p>
        )}
      </Field>

      <Field label="Date of joining" required>
        <TextInput
          type="date"
          value={form.joiningDate}
          onChange={(e) => set("joiningDate", e.target.value)}
          className={touched && !form.joiningDate ? "border-red-500" : ""}
        />
        {touched && !form.joiningDate && (
          <p className="mt-1 text-xs font-medium text-red-500">● Joining date is required.</p>
        )}
      </Field>
    </div>
  </div>
)}

          {step === 1 && (
  <div className="space-y-5">
    <SectionTitle title="HR & Payroll" />
    <div className="grid gap-4 sm:grid-cols-2">

      <Field label="UAN number" required>
        <TextInput
          value={form.uan}
          onChange={(e) => set("uan", e.target.value)}
          className={touched && !form.uan ? "border-red-500" : ""}
        />
        {touched && !form.uan && (
          <p className="mt-1 text-xs font-medium text-red-500">● UAN number is required.</p>
        )}
      </Field>

      <Field label="PF number" required>
        <TextInput
          value={form.pf}
          onChange={(e) => set("pf", e.target.value)}
          className={touched && !form.pf ? "border-red-500" : ""}
        />
        {touched && !form.pf && (
          <p className="mt-1 text-xs font-medium text-red-500">● PF number is required.</p>
        )}
      </Field>

      <Field label="ESIC number">
        <TextInput value={form.esic} onChange={(e) => set("esic", e.target.value)} />
      </Field>

      <Field label="CTC (per annum)" required>
        <TextInput
          value={form.ctc}
          onChange={(e) => set("ctc", e.target.value)}
          placeholder="₹ 12,00,000"
          className={touched && !form.ctc ? "border-red-500" : ""}
        />
        {touched && !form.ctc && (
          <p className="mt-1 text-xs font-medium text-red-500">● CTC is required.</p>
        )}
      </Field>

      <Field label="Salary structure" className="sm:col-span-2">
        <TextInput
          value={form.salaryStructure}
          onChange={(e) => set("salaryStructure", e.target.value)}
          placeholder="Basic + HRA + Special"
        />
      </Field>

      <Field label="Insurance details" className="sm:col-span-2">
        <TextInput
          value={form.insurance}
          onChange={(e) => set("insurance", e.target.value)}
        />
      </Field>

    </div>
  </div>
)}

          {step === 2 && (
            <div className="space-y-5">
              <SectionTitle title="Asset Allocation" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Laptop assigned">
                  <TextInput
                    value={form.laptop}
                    onChange={(e) => set("laptop", e.target.value)}
                    placeholder="MacBook Pro 14, 2024"
                  />
                </Field>
                <Field label="System ID">
                  <TextInput
                    value={form.systemId}
                    onChange={(e) => set("systemId", e.target.value)}
                  />
                </Field>
                <Field label="Software access" className="sm:col-span-2">
                  <TextInput
                    value={form.softwareAccess}
                    onChange={(e) => set("softwareAccess", e.target.value)}
                    placeholder="Slack, Linear, GitHub"
                  />
                </Field>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Toggle
                  label="ID card issued"
                  checked={form.idCard}
                  onChange={(v) => set("idCard", v)}
                />
                <Toggle
                  label="Email access provided"
                  checked={form.emailAccess}
                  onChange={(v) => set("emailAccess", v)}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <SectionTitle
                title="Employee Agreement"
                description="Please acknowledge each policy."
              />
              <Toggle
                label="I accept the Non-Disclosure Agreement (NDA)"
                checked={form.nda}
                onChange={(v) => set("nda", v)}
              />
              <Toggle
                label="I accept the Company Policy"
                checked={form.companyPolicy}
                onChange={(v) => set("companyPolicy", v)}
              />
              <Toggle
                label="I accept the Leave Policy"
                checked={form.leavePolicy}
                onChange={(v) => set("leavePolicy", v)}
              />
            </div>
          )}
        </div>

        {submitError && (
          <p className="mt-5 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {submitError}
          </p>
        )}

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-5">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Save className="h-3 w-3" />
            {savedAt ? `Draft saved · ${savedAt.toLocaleTimeString()}` : "Auto-save enabled"}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-border bg-card px-4 text-sm font-medium transition-colors hover:bg-secondary disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => {
  if (!stepValid) {
    setTouched(true);
    return;
  }
  setTouched(false);
  setStep((s) => Math.min(STEPS.length - 1, s + 1));
}}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={!stepValid || submitting}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit form"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
      <span className="text-foreground/90">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted-foreground/30"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow-soft transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"
            }`}
        />
      </button>
    </label>
  );
}
