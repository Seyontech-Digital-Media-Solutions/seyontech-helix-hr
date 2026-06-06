import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { Stepper } from "@/components/form-stepper";
import {
  Field,
  FileDrop,
  Select,
  TextArea,
  TextInput,
  SectionTitle,
} from "@/components/form-fields";
import { SuccessCard } from "@/components/success-card";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase-client.ts";
import { clearDraft, loadDraft, saveDraft } from "@/lib/draft-storage";

export const Route = createFileRoute("/pre-joining")({
  head: () => ({
    meta: [
      { title: "Pre-Joining Form — Helix HR" },
      {
        name: "description",
        content:
          "Submit your personal, professional, banking and document information before joining.",
      },
    ],
  }),
  component: PreJoining,
});

const DRAFT_KEY = "ho_prejoin_v1";

interface FormState {
  // personal
  fullName: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  mobile: string;
  altMobile: string;
  email: string;
  currentAddress: string;
  permanentAddress: string;
  emergencyName: string;
  emergencyNumber: string;
  // professional
  position: string;
  department: string;
  joinDate: string;
  prevCompany: string;
  experience: string;
  skills: string;
  linkedin: string;
  portfolio: string;
  // bank
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  branch: string;
  // declaration
  signature: string;
  agree: boolean;
  // file names (placeholders)
  fileAadhaar: string;
  filePan: string;
  fileResume: string;
  filePhoto: string;
  fileEdu: string;
  fileExp: string;
}

const initial: FormState = {
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
  fileExp: "",
};

const STEPS = [
  { id: "personal", label: "Personal" },
  { id: "professional", label: "Professional" },
  { id: "documents", label: "Documents" },
  { id: "bank", label: "Banking" },
  { id: "review", label: "Review & Submit" },
];

function PreJoining() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>(initial);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    setForm(loadDraft(DRAFT_KEY, initial));
  }, []);

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

  const stepValid = useMemo(() => validateStep(step, form), [step, form]);

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

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
        type: "PRE_JOINING",
        referenceId: `PRE-${Date.now()}`,
        applicantName: form.fullName,
        email: form.email,
        position: form.position,
        department: form.department,
        payload: form,
        submittedById: user.id,
        updatedAt: new Date().toISOString(),
      })
      .select("id, referenceId")  // ✅ added referenceId here
      .single();

    if (error) throw new Error(error.message);

    // ✅ Send confirmation email
    await supabase.functions.invoke("send-email", {
      body: {
        type: "confirmation",
        to: form.email,          // pre-joining uses email
        name: form.fullName,     // pre-joining uses fullName
        referenceId: data.referenceId,
      },
    });

    clearDraft(DRAFT_KEY);
    setSubmitted(data.referenceId); // ✅ fixed: was data.id before
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
          title="Submission received"
          message="Thanks for completing the pre-joining form. Our HR team will review your details and get back to you shortly."
          referenceId={submitted}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Pre-Joining
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Tell us about yourself
        </h1>
        <p className="text-sm text-muted-foreground">
          We'll use this to set up your account before day one. Your progress is saved
          automatically.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-7">
        <Stepper steps={STEPS} current={step} onJump={setStep} />

        <div className="mt-7 space-y-6">
          {step === 0 && <PersonalStep form={form} set={set} />}
          {step === 1 && <ProfessionalStep form={form} set={set} />}
          {step === 2 && <DocumentsStep form={form} set={set} />}
          {step === 3 && <BankStep form={form} set={set} />}
          {step === 4 && <ReviewStep form={form} set={set} />}
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
              onClick={back}
              disabled={step === 0}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={next}
                disabled={!stepValid}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={!form.agree || !form.signature || submitting}
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

function validateStep(step: number, f: FormState): boolean {
  if (step === 0) return !!(f.fullName && f.email && f.mobile && f.dob && f.gender);
  if (step === 1) return !!(f.position && f.department && f.joinDate);
  if (step === 2) return true;
  if (step === 3) return !!(f.bankName && f.accountNumber && f.ifsc);
  return true;
}

type StepProps = {
  form: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
};

function PersonalStep({ form, set }: StepProps) {
  return (
    <div className="space-y-5">
      <SectionTitle
        title="Personal Information"
        description="Basic details and contact information."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" required>
          <TextInput
            value={form.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            placeholder="Jane Doe"
          />
        </Field>
        <Field label="Date of birth" required>
          <TextInput type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} />
        </Field>
        <Field label="Gender" required>
          <Select value={form.gender} onChange={(e) => set("gender", e.target.value)}>
            <option value="">Select</option>
            <option>Female</option>
            <option>Male</option>
            <option>Non-binary</option>
            <option>Prefer not to say</option>
          </Select>
        </Field>
        <Field label="Blood group">
          <Select value={form.bloodGroup} onChange={(e) => set("bloodGroup", e.target.value)}>
            <option value="">Select</option>
            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => (
              <option key={b}>{b}</option>
            ))}
          </Select>
        </Field>
        <Field label="Mobile number" required>
          <TextInput
            type="tel"
            value={form.mobile}
            onChange={(e) => set("mobile", e.target.value)}
            placeholder="+91 98765 43210"
          />
        </Field>
        <Field label="Alternate number">
          <TextInput
            type="tel"
            value={form.altMobile}
            onChange={(e) => set("altMobile", e.target.value)}
          />
        </Field>
        <Field label="Email address" required className="sm:col-span-2">
          <TextInput
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="jane@example.com"
          />
        </Field>
        <Field label="Current address" className="sm:col-span-2">
          <TextArea
            value={form.currentAddress}
            onChange={(e) => set("currentAddress", e.target.value)}
          />
        </Field>
        <Field label="Permanent address" className="sm:col-span-2">
          <TextArea
            value={form.permanentAddress}
            onChange={(e) => set("permanentAddress", e.target.value)}
          />
        </Field>
        <Field label="Emergency contact person">
          <TextInput
            value={form.emergencyName}
            onChange={(e) => set("emergencyName", e.target.value)}
          />
        </Field>
        <Field label="Emergency contact number">
          <TextInput
            type="tel"
            value={form.emergencyNumber}
            onChange={(e) => set("emergencyNumber", e.target.value)}
          />
        </Field>
      </div>
    </div>
  );
}

function ProfessionalStep({ form, set }: StepProps) {
  return (
    <div className="space-y-5">
      <SectionTitle
        title="Professional Information"
        description="Your role, experience, and links."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Applied position" required>
          <TextInput
            value={form.position}
            onChange={(e) => set("position", e.target.value)}
            placeholder="Software Engineer"
          />
        </Field>
        <Field label="Department" required>
          <Select value={form.department} onChange={(e) => set("department", e.target.value)}>
            <option value="">Select</option>
            {[
              "Engineering",
              "Design",
              "Product",
              "Marketing",
              "Sales",
              "People",
              "Finance",
              "Operations",
            ].map((d) => (
              <option key={d}>{d}</option>
            ))}
          </Select>
        </Field>
        <Field label="Expected joining date" required>
          <TextInput
            type="date"
            value={form.joinDate}
            onChange={(e) => set("joinDate", e.target.value)}
          />
        </Field>
        <Field label="Total experience">
          <TextInput
            value={form.experience}
            onChange={(e) => set("experience", e.target.value)}
            placeholder="3 years"
          />
        </Field>
        <Field label="Previous company" className="sm:col-span-2">
          <TextInput
            value={form.prevCompany}
            onChange={(e) => set("prevCompany", e.target.value)}
          />
        </Field>
        <Field label="Skills" hint="Comma separated" className="sm:col-span-2">
          <TextInput
            value={form.skills}
            onChange={(e) => set("skills", e.target.value)}
            placeholder="TypeScript, React, PostgreSQL"
          />
        </Field>
        <Field label="LinkedIn profile">
          <TextInput
            type="url"
            value={form.linkedin}
            onChange={(e) => set("linkedin", e.target.value)}
            placeholder="https://linkedin.com/in/..."
          />
        </Field>
        <Field label="Portfolio / GitHub URL">
          <TextInput
            type="url"
            value={form.portfolio}
            onChange={(e) => set("portfolio", e.target.value)}
            placeholder="https://github.com/..."
          />
        </Field>
      </div>
    </div>
  );
}

function DocumentsStep({ form, set }: StepProps) {
  const files: Array<[keyof FormState, string]> = [
    ["fileAadhaar", "Aadhaar card"],
    ["filePan", "PAN card"],
    ["fileResume", "Resume / CV"],
    ["filePhoto", "Passport size photo"],
    ["fileEdu", "Educational certificates"],
    ["fileExp", "Experience certificates"],
  ];
  return (
    <div className="space-y-5">
      <SectionTitle
        title="Documents"
        description="Upload clear scans or photos. PDF or image formats."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {files.map(([key, label]) => (
          <FileDrop
            key={key}
            label={label}
            fileName={form[key] as string}
            onChange={(file) => set(key, (file?.name ?? "") as FormState[typeof key])}
          />
        ))}
      </div>
    </div>
  );
}

function BankStep({ form, set }: StepProps) {
  return (
    <div className="space-y-5">
      <SectionTitle title="Bank Details" description="For salary credit." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Bank name" required>
          <TextInput value={form.bankName} onChange={(e) => set("bankName", e.target.value)} />
        </Field>
        <Field label="Account holder name">
          <TextInput
            value={form.accountHolder}
            onChange={(e) => set("accountHolder", e.target.value)}
          />
        </Field>
        <Field label="Account number" required>
          <TextInput
            value={form.accountNumber}
            onChange={(e) => set("accountNumber", e.target.value)}
          />
        </Field>
        <Field label="IFSC code" required>
          <TextInput
            value={form.ifsc}
            onChange={(e) => set("ifsc", e.target.value.toUpperCase())}
          />
        </Field>
        <Field label="Branch name" className="sm:col-span-2">
          <TextInput value={form.branch} onChange={(e) => set("branch", e.target.value)} />
        </Field>
      </div>
    </div>
  );
}

function ReviewStep({ form, set }: StepProps) {
  const rows: Array<[string, string]> = [
    ["Full name", form.fullName],
    ["Email", form.email],
    ["Position", form.position],
    ["Department", form.department],
    ["Joining date", form.joinDate],
    ["Bank", `${form.bankName} · ${form.accountNumber}`],
  ];
  return (
    <div className="space-y-5">
      <SectionTitle
        title="Review & Declaration"
        description="Verify your details and sign to submit."
      />
      <dl className="divide-y divide-border rounded-lg border border-border bg-muted/30">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-3 gap-3 px-4 py-2.5 text-sm">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="col-span-2 font-medium text-foreground">
              {v || <span className="text-muted-foreground/60">—</span>}
            </dd>
          </div>
        ))}
      </dl>

      <Field label="Digital signature (type your full name)" required>
        <TextInput
          value={form.signature}
          onChange={(e) => set("signature", e.target.value)}
          placeholder="Jane Doe"
          className="font-display italic"
        />
      </Field>

      <label className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4 text-sm">
        <input
          type="checkbox"
          checked={form.agree}
          onChange={(e) => set("agree", e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-input accent-[color:var(--primary)]"
        />
        <span className="text-foreground/90">
          I confirm the information provided is accurate and agree to the company's onboarding
          policies, code of conduct, and data privacy terms.
        </span>
      </label>
    </div>
  );
}
