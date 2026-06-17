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
  fullName: string;
  employeeId: string;
  officialEmail: string;
  reportingManager: string;
  workLocation: string;
  department: string;
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

type FormErrors = Partial<Record<keyof FormState, string>>;

function autoEmpId() {
  return "EMP-" + Math.floor(10000 + Math.random() * 89999);
}

const initial: FormState = {
  fullName: "",
  employeeId: autoEmpId(),
  officialEmail: "",
  reportingManager: "",
  workLocation: "",
  department: "",
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

const STEPS = [
  { id: "employment", label: "Employment" },
  { id: "payroll", label: "HR & Payroll" },
  { id: "assets", label: "Assets" },
  { id: "agreement", label: "Agreement" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateStepFields(step: number, f: FormState): FormErrors {
  const errors: FormErrors = {};

  if (step === 0) {
    if (!f.fullName.trim()) errors.fullName = "Full name is required.";
    if (!f.officialEmail.trim()) {
      errors.officialEmail = "Official email is required.";
    } else if (!EMAIL_RE.test(f.officialEmail.trim())) {
      errors.officialEmail = "Enter a valid email address.";
    }
    if (!f.reportingManager.trim()) errors.reportingManager = "Reporting manager is required.";
    if (!f.workLocation.trim()) errors.workLocation = "Work location is required.";
    if (!f.department.trim()) errors.department = "Department is required.";
    if (!f.employmentType) errors.employmentType = "Please select an employment type.";
    if (!f.shift.trim()) errors.shift = "Shift timing is required.";
    if (!f.joiningDate) errors.joiningDate = "Date of joining is required.";
  }

  if (step === 1) {
    if (!f.uan.trim()) errors.uan = "UAN number is required.";
    if (!f.pf.trim()) errors.pf = "PF number is required.";
    if (!f.esic.trim()) errors.esic = "ESIC number is required.";
    if (!f.ctc.trim()) errors.ctc = "CTC is required.";
    if (!f.salaryStructure.trim()) errors.salaryStructure = "Salary structure is required.";
    if (!f.insurance.trim()) errors.insurance = "Insurance details are required.";
  }

  if (step === 2) {
    if (!f.laptop.trim()) errors.laptop = "Laptop assignment is required.";
    if (!f.systemId.trim()) errors.systemId = "System ID is required.";
    if (!f.softwareAccess.trim()) errors.softwareAccess = "Software access details are required.";
    if (!f.idCard) errors.idCard = "ID card must be issued before proceeding.";
    if (!f.emailAccess) errors.emailAccess = "Email access must be provided before proceeding.";
  }

  if (step === 3) {
    if (!f.nda) errors.nda = "You must accept the NDA.";
    if (!f.companyPolicy) errors.companyPolicy = "You must accept the Company Policy.";
    if (!f.leavePolicy) errors.leavePolicy = "You must accept the Leave Policy.";
  }

  return errors;
}

function PostJoining() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>(initial);
  const [step, setStep] = useState(0);
  const [touchedFields, setTouchedFields] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [stepSubmitAttempted, setStepSubmitAttempted] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  useEffect(() => setForm(loadDraft(DRAFT_KEY, initial)), []);

  useEffect(() => {
    if (submitted) return;
    const t = setTimeout(() => {
      saveDraft(DRAFT_KEY, form);
      setSavedAt(new Date());
    }, 600);
    return () => clearTimeout(t);
  }, [form, submitted]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setTouchedFields((t) => ({ ...t, [k]: true }));
  };

  const stepErrors = useMemo(() => validateStepFields(step, form), [step, form]);
  const stepValid = Object.keys(stepErrors).length === 0;

  const visibleErrors: FormErrors = {};
  for (const key of Object.keys(stepErrors) as (keyof FormState)[]) {
    if (stepSubmitAttempted || touchedFields[key]) {
      visibleErrors[key] = stepErrors[key as keyof FormErrors];
    }
  }

  const next = () => {
    setStepSubmitAttempted(true);
    if (!stepValid) return;
    setStepSubmitAttempted(false);
    setTouchedFields({});
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const back = () => {
    setStepSubmitAttempted(false);
    setTouchedFields({});
    setStep((s) => Math.max(0, s - 1));
  };

  const handleJump = (target: number) => {
    if (target < step) {
      setStepSubmitAttempted(false);
      setTouchedFields({});
      setStep(target);
    }
  };

  const submit = async () => {
    setStepSubmitAttempted(true);
    if (!stepValid) return;

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
          applicantName: form.fullName,
          email: form.officialEmail,
          position: form.employmentType,
          department: form.department,
          payload: form,
          submittedById: user.id,
          updatedAt: new Date().toISOString(),
        })
        .select("id, referenceId")
        .single();

      if (error) throw new Error(error.message);

      await supabase.functions.invoke("send-email", {
        body: {
          type: "confirmation",
          to: form.officialEmail,
          name: form.fullName,
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
        <Stepper steps={STEPS} current={step} onJump={handleJump} />

        <div className="mt-7 space-y-6">
          {step === 0 && <EmploymentStep form={form} set={set} errors={visibleErrors} />}
          {step === 1 && <PayrollStep form={form} set={set} errors={visibleErrors} />}
          {step === 2 && <AssetsStep form={form} set={set} errors={visibleErrors} />}
          {step === 3 && <AgreementStep form={form} set={set} errors={visibleErrors} />}
        </div>

        {stepSubmitAttempted && !stepValid && (
          <p className="mt-5 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Please fill in all required fields before continuing.
          </p>
        )}

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
              onClick={back}
              disabled={step === 0}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-border bg-card px-4 text-sm font-medium transition-colors hover:bg-secondary disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={next}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
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

type StepProps = {
  form: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  errors: FormErrors;
};

function EmploymentStep({ form, set, errors }: StepProps) {
  return (
    <div className="space-y-5">
      <SectionTitle title="Employment Details" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" required error={errors.fullName} className="sm:col-span-2">
  <TextInput
    value={form.fullName}
    onChange={(e) => set("fullName", e.target.value)}
    placeholder="e.g. Arun Kumar"
    aria-invalid={!!errors.fullName}
  />
</Field>
        <Field label="Employee ID" required hint="Auto-generated">
          <TextInput value={form.employeeId} readOnly className="font-mono" />
        </Field>
        <Field label="Official email" required error={errors.officialEmail}>
          <TextInput
            type="email"
            value={form.officialEmail}
            onChange={(e) => set("officialEmail", e.target.value)}
            aria-invalid={!!errors.officialEmail}
          />
        </Field>
        <Field label="Reporting manager" required error={errors.reportingManager}>
          <TextInput
            value={form.reportingManager}
            onChange={(e) => set("reportingManager", e.target.value)}
            aria-invalid={!!errors.reportingManager}
          />
        </Field>
        <Field label="Work location" required error={errors.workLocation}>
          <TextInput
            value={form.workLocation}
            onChange={(e) => set("workLocation", e.target.value)}
            aria-invalid={!!errors.workLocation}
          />
        </Field>
        <Field label="Department" required error={errors.department}>
  <TextInput
    value={form.department}
    onChange={(e) => set("department", e.target.value)}
    placeholder="e.g. Engineering"
    aria-invalid={!!errors.department}
  />
</Field>
        <Field label="Employment type" required error={errors.employmentType}>
          <Select
            value={form.employmentType}
            onChange={(e) => set("employmentType", e.target.value)}
            aria-invalid={!!errors.employmentType}
          >
            <option value="">Select</option>
            {["Full-time", "Part-time", "Contract", "Intern"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </Select>
        </Field>
        <Field label="Shift timing" required error={errors.shift}>
          <TextInput
            value={form.shift}
            onChange={(e) => set("shift", e.target.value)}
            placeholder="10:00 – 19:00"
            aria-invalid={!!errors.shift}
          />
        </Field>
        <Field label="Date of joining" required error={errors.joiningDate}>
          <TextInput
            type="date"
            value={form.joiningDate}
            onChange={(e) => set("joiningDate", e.target.value)}
            aria-invalid={!!errors.joiningDate}
          />
        </Field>
      </div>
    </div>
  );
}

function PayrollStep({ form, set, errors }: StepProps) {
  return (
    <div className="space-y-5">
      <SectionTitle title="HR & Payroll" description="Filled by HR after joining." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="UAN number" required error={errors.uan}>
          <TextInput value={form.uan} onChange={(e) => set("uan", e.target.value)} aria-invalid={!!errors.uan} />
        </Field>
        <Field label="PF number" required error={errors.pf}>
          <TextInput value={form.pf} onChange={(e) => set("pf", e.target.value)} aria-invalid={!!errors.pf} />
        </Field>
        <Field label="ESIC number" required error={errors.esic}>
          <TextInput value={form.esic} onChange={(e) => set("esic", e.target.value)} aria-invalid={!!errors.esic} />
        </Field>
        <Field label="CTC (per annum)" required error={errors.ctc}>
          <TextInput value={form.ctc} onChange={(e) => set("ctc", e.target.value)} placeholder="₹ 12,00,000" aria-invalid={!!errors.ctc} />
        </Field>
        <Field label="Salary structure" required className="sm:col-span-2" error={errors.salaryStructure}>
          <TextInput value={form.salaryStructure} onChange={(e) => set("salaryStructure", e.target.value)} placeholder="Basic + HRA + Special" aria-invalid={!!errors.salaryStructure} />
        </Field>
        <Field label="Insurance details" required className="sm:col-span-2" error={errors.insurance}>
          <TextInput value={form.insurance} onChange={(e) => set("insurance", e.target.value)} aria-invalid={!!errors.insurance} />
        </Field>
      </div>
    </div>
  );
}

function AssetsStep({ form, set, errors }: StepProps) {
  return (
    <div className="space-y-5">
      <SectionTitle title="Asset Allocation" description="Filled by IT after joining." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Laptop assigned" required error={errors.laptop}>
          <TextInput value={form.laptop} onChange={(e) => set("laptop", e.target.value)} placeholder="MacBook Pro 14, 2024" aria-invalid={!!errors.laptop} />
        </Field>
        <Field label="System ID" required error={errors.systemId}>
          <TextInput value={form.systemId} onChange={(e) => set("systemId", e.target.value)} aria-invalid={!!errors.systemId} />
        </Field>
        <Field label="Software access" required className="sm:col-span-2" error={errors.softwareAccess}>
          <TextInput value={form.softwareAccess} onChange={(e) => set("softwareAccess", e.target.value)} placeholder="Slack, Linear, GitHub" aria-invalid={!!errors.softwareAccess} />
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Toggle label="ID card issued" checked={form.idCard} onChange={(v) => set("idCard", v)} error={errors.idCard} />
        <Toggle label="Email access provided" checked={form.emailAccess} onChange={(v) => set("emailAccess", v)} error={errors.emailAccess} />
      </div>
    </div>
  );
}

function AgreementStep({ form, set, errors }: StepProps) {
  return (
    <div className="space-y-4">
      <SectionTitle title="Employee Agreement" description="All three policies must be accepted to submit." />
      <Toggle label="I accept the Non-Disclosure Agreement (NDA)" checked={form.nda} onChange={(v) => set("nda", v)} error={errors.nda} />
      <Toggle label="I accept the Company Policy" checked={form.companyPolicy} onChange={(v) => set("companyPolicy", v)} error={errors.companyPolicy} />
      <Toggle label="I accept the Leave Policy" checked={form.leavePolicy} onChange={(v) => set("leavePolicy", v)} error={errors.leavePolicy} />
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  error,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  error?: string;
}) {
  return (
    <div className="space-y-1">
      <label
        className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm transition-colors ${
          error ? "border-destructive bg-destructive/5" : "border-border bg-muted/30"
        }`}
      >
        <span className="text-foreground/90">{label}</span>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            checked ? "bg-primary" : "bg-muted-foreground/30"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow-soft transition-transform ${
              checked ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </label>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}