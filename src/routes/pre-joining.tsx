import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { Stepper } from "@/components/form-stepper";
import { uploadFile } from "@/lib/supabaseStorage";
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
        content: "Submit your personal, professional, banking and document information before joining.",
      },
    ],
  }),
  component: PreJoining,
});

const DRAFT_KEY = "ho_prejoin_v1";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
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
  position: string;
  department: string;
  joinDate: string;
  prevCompany: string;
  experience: string;
  skills: string;
  linkedin: string;
  portfolio: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  branch: string;
  signature: string;
  agree: boolean;
  fileAadhaar: string;
  filePan: string;
  fileResume: string;
  filePhoto: string;
  fileEdu: string;
  fileExp: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

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

// ─── Validation ───────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s\-()]{7,14}$/;
const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const URL_RE = /^https?:\/\/.+/;

function validateStepFields(step: number, f: FormState): FormErrors {
  const errors: FormErrors = {};

  if (step === 0) {
    if (!f.fullName.trim()) errors.fullName = "Full name is required.";
    if (!f.dob) errors.dob = "Date of birth is required.";
    if (!f.gender) errors.gender = "Please select a gender.";
    if (!f.mobile.trim()) {
      errors.mobile = "Mobile number is required.";
    } else if (!PHONE_RE.test(f.mobile.trim())) {
      errors.mobile = "Enter a valid phone number.";
    }
    if (f.altMobile.trim() && !PHONE_RE.test(f.altMobile.trim())) {
      errors.altMobile = "Enter a valid alternate phone number.";
    }
    if (!f.email.trim()) {
      errors.email = "Email address is required.";
    } else if (!EMAIL_RE.test(f.email.trim())) {
      errors.email = "Enter a valid email address.";
    }
    if (!f.currentAddress.trim()) errors.currentAddress = "Current address is required.";
    if (!f.permanentAddress.trim()) errors.permanentAddress = "Permanent address is required.";
    if (!f.emergencyName.trim()) errors.emergencyName = "Emergency contact person is required.";
    if (!f.emergencyNumber.trim()) {
      errors.emergencyNumber = "Emergency contact number is required.";
    } else if (!PHONE_RE.test(f.emergencyNumber.trim())) {
      errors.emergencyNumber = "Enter a valid emergency contact number.";
    }
  }

  if (step === 1) {
    if (!f.position.trim()) errors.position = "Position is required.";
    if (!f.department) errors.department = "Please select a department.";
    if (!f.joinDate) errors.joinDate = "Expected joining date is required.";
    if (!f.experience.trim()) errors.experience = "Total experience is required.";
    if (!f.prevCompany.trim()) errors.prevCompany = "Previous company is required.";
    if (!f.skills.trim()) errors.skills = "Skills are required.";
    // LinkedIn and Portfolio/GitHub URL are optional — no validation.
  }

  if (step === 2) {
    if (!f.fileAadhaar) errors.fileAadhaar = "Aadhaar card is required.";
    if (!f.filePan) errors.filePan = "PAN card is required.";
    if (!f.fileResume) errors.fileResume = "Resume / CV is required.";
    if (!f.filePhoto) errors.filePhoto = "Passport size photo is required.";
    if (!f.fileEdu) errors.fileEdu = "Educational certificates are required.";
    //if (!f.fileExp) errors.fileExp = "Experience certificates are required.";
  }

  if (step === 3) {
    // No validation — Banking step is fully optional.
  }

  if (step === 4) {
    if (!f.signature.trim()) errors.signature = "Digital signature is required.";
    if (!f.agree) errors.agree = "You must accept the declaration to submit.";
  }

  return errors;
}

// ─── Component ────────────────────────────────────────────────────────────────

function PreJoining() {
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
        .select("id, referenceId")
        .single();

      if (error) throw new Error(error.message);

      await supabase.functions.invoke("send-email", {
        body: {
          type: "confirmation",
          to: form.email,
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
          We'll use this to set up your account before day one. Your progress is saved automatically.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-7">
        <Stepper steps={STEPS} current={step} onJump={handleJump} />

        <div className="mt-7 space-y-6">
          {step === 0 && <PersonalStep form={form} set={set} errors={visibleErrors} />}
          {step === 1 && <ProfessionalStep form={form} set={set} errors={visibleErrors} />}
          {step === 2 && <DocumentsStep form={form} set={set} errors={visibleErrors} />}
          {step === 3 && <BankStep form={form} set={set} errors={visibleErrors} />}
          {step === 4 && <ReviewStep form={form} set={set} errors={visibleErrors} />}
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
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
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

// ─── Step prop types ──────────────────────────────────────────────────────────

type StepProps = {
  form: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  errors: FormErrors;
};

// ─── Steps ────────────────────────────────────────────────────────────────────

function PersonalStep({ form, set, errors }: StepProps) {
  return (
    <div className="space-y-5">
      <SectionTitle title="Personal Information" description="Basic details and contact information." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" required error={errors.fullName}>
          <TextInput value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Jane Doe" aria-invalid={!!errors.fullName} />
        </Field>
        <Field label="Date of birth" required error={errors.dob}>
          <TextInput type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} aria-invalid={!!errors.dob} />
        </Field>
        <Field label="Gender" required error={errors.gender}>
          <Select value={form.gender} onChange={(e) => set("gender", e.target.value)} aria-invalid={!!errors.gender}>
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
        <Field label="Mobile number" required error={errors.mobile}>
          <TextInput type="tel" value={form.mobile} onChange={(e) => set("mobile", e.target.value)} placeholder="+91 98765 43210" aria-invalid={!!errors.mobile} />
        </Field>
        <Field label="Alternate number" error={errors.altMobile}>
          <TextInput type="tel" value={form.altMobile} onChange={(e) => set("altMobile", e.target.value)} aria-invalid={!!errors.altMobile} />
        </Field>
        <Field label="Email address" required className="sm:col-span-2" error={errors.email}>
          <TextInput type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="jane@example.com" aria-invalid={!!errors.email} />
        </Field>
        <Field label="Current address" required className="sm:col-span-2" error={errors.currentAddress}>
          <TextArea value={form.currentAddress} onChange={(e) => set("currentAddress", e.target.value)} aria-invalid={!!errors.currentAddress} />
        </Field>
        <Field label="Permanent address" required className="sm:col-span-2" error={errors.permanentAddress}>
          <TextArea value={form.permanentAddress} onChange={(e) => set("permanentAddress", e.target.value)} aria-invalid={!!errors.permanentAddress} />
        </Field>
        <Field label="Emergency contact person" required error={errors.emergencyName}>
          <TextInput value={form.emergencyName} onChange={(e) => set("emergencyName", e.target.value)} aria-invalid={!!errors.emergencyName} />
        </Field>
        <Field label="Emergency contact number" required error={errors.emergencyNumber}>
          <TextInput type="tel" value={form.emergencyNumber} onChange={(e) => set("emergencyNumber", e.target.value)} aria-invalid={!!errors.emergencyNumber} />
        </Field>
      </div>
    </div>
  );
}

function ProfessionalStep({ form, set, errors }: StepProps) {
  return (
    <div className="space-y-5">
      <SectionTitle title="Professional Information" description="Your role, experience, and links." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Applied position" required error={errors.position}>
          <TextInput value={form.position} onChange={(e) => set("position", e.target.value)} placeholder="Software Engineer" aria-invalid={!!errors.position} />
        </Field>
        <Field label="Department" required error={errors.department}>
          <Select value={form.department} onChange={(e) => set("department", e.target.value)} aria-invalid={!!errors.department}>
            <option value="">Select</option>
            {["Engineering","Design","Product","Marketing","Sales","People","Finance","Operations"].map((d) => (
              <option key={d}>{d}</option>
            ))}
          </Select>
        </Field>
        <Field label="Expected joining date" required error={errors.joinDate}>
          <TextInput type="date" value={form.joinDate} onChange={(e) => set("joinDate", e.target.value)} aria-invalid={!!errors.joinDate} />
        </Field>
        <Field label="Total experience" required error={errors.experience}>
          <TextInput value={form.experience} onChange={(e) => set("experience", e.target.value)} placeholder="3 years" aria-invalid={!!errors.experience} />
        </Field>
        <Field label="Previous company" required className="sm:col-span-2" error={errors.prevCompany}>
          <TextInput value={form.prevCompany} onChange={(e) => set("prevCompany", e.target.value)} aria-invalid={!!errors.prevCompany} />
        </Field>
        <Field label="Skills" hint="Comma separated" required className="sm:col-span-2" error={errors.skills}>
          <TextInput value={form.skills} onChange={(e) => set("skills", e.target.value)} placeholder="TypeScript, React, PostgreSQL" aria-invalid={!!errors.skills} />
        </Field>
        <Field label="LinkedIn profile" error={errors.linkedin}>
          <TextInput type="url" value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} placeholder="https://linkedin.com/in/..." aria-invalid={!!errors.linkedin} />
        </Field>
        <Field label="Portfolio / GitHub URL" error={errors.portfolio}>
          <TextInput type="url" value={form.portfolio} onChange={(e) => set("portfolio", e.target.value)} placeholder="https://github.com/..." aria-invalid={!!errors.portfolio} />
        </Field>
      </div>
    </div>
  );
}

function DocumentsStep({ form, set, errors }: StepProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [uploadErrors, setUploadErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const files: Array<[keyof FormState, string, boolean]> = [
    ["fileAadhaar", "Aadhaar card", true],
    ["filePan", "PAN card", true],
    ["fileResume", "Resume / CV", true],
    ["filePhoto", "Passport size photo", true],
    ["fileEdu", "Educational certificates", true],
    ["fileExp", "Experience certificates", false],
  ];

  const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
  const ALLOWED_EXT = /\.(pdf|jpe?g|png)$/i;
  const MAX_SIZE_MB = 5;

  const handleFile = async (key: keyof FormState, file: File | null) => {
    if (!file || !user) return;

    if (key === "fileEdu") {
      const validType = ALLOWED_TYPES.includes(file.type) || ALLOWED_EXT.test(file.name);
      if (!validType) {
        setUploadErrors((e) => ({
          ...e,
          [key]: "Only PDF, JPG, or PNG files are allowed.",
        }));
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setUploadErrors((e) => ({
          ...e,
          [key]: `File must be smaller than ${MAX_SIZE_MB}MB.`,
        }));
        return;
      }
    }

    setUploading((u) => ({ ...u, [key]: true }));
    setUploadErrors((e) => ({ ...e, [key]: undefined }));
    try {
      const path = await uploadFile(file, key, user.id, "pre-joining", form.fullName);
      set(key, path as FormState[typeof key]);
    } catch (err) {
      setUploadErrors((e) => ({
        ...e,
        [key]: err instanceof Error ? err.message : "Upload failed",
      }));
    } finally {
      setUploading((u) => ({ ...u, [key]: false }));
    }
  };

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Documents"
        description="Upload clear scans or photos. PDF, JPG, or PNG only, max 5MB. Aadhaar, PAN, resume, photo, and educational certificates are mandatory. Experience certificates are optional for freshers."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {files.map(([key, label, required]) => (
          <div key={key} className="space-y-1">
            <FileDrop
              label={label}
              required={required}
              fileName={uploading[key] ? "Uploading…" : form[key] ? "✅ Uploaded" : ""}
              onChange={(file) => handleFile(key, file)}
            />
            {uploadErrors[key] && <p className="text-xs text-destructive">{uploadErrors[key]}</p>}
            {!form[key] && !uploading[key] && errors[key] && (
              <p className="text-xs text-destructive">{errors[key]}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function BankStep({ form, set, errors }: StepProps) {
  return (
    <div className="space-y-5">
      <SectionTitle title="Bank Details" description="For salary credit. These details are optional and can be added later." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Bank name" error={errors.bankName}>
          <TextInput value={form.bankName} onChange={(e) => set("bankName", e.target.value)} aria-invalid={!!errors.bankName} />
        </Field>
        <Field label="Account holder name" error={errors.accountHolder}>
          <TextInput value={form.accountHolder} onChange={(e) => set("accountHolder", e.target.value)} aria-invalid={!!errors.accountHolder} />
        </Field>
        <Field label="Account number" error={errors.accountNumber}>
          <TextInput value={form.accountNumber} onChange={(e) => set("accountNumber", e.target.value)} aria-invalid={!!errors.accountNumber} />
        </Field>
        <Field label="IFSC code" error={errors.ifsc}>
          <TextInput value={form.ifsc} onChange={(e) => set("ifsc", e.target.value.toUpperCase())} placeholder="SBIN0001234" aria-invalid={!!errors.ifsc} />
        </Field>
        <Field label="Branch name" className="sm:col-span-2" error={errors.branch}>
          <TextInput value={form.branch} onChange={(e) => set("branch", e.target.value)} aria-invalid={!!errors.branch} />
        </Field>
      </div>
    </div>
  );
}

function ReviewStep({ form, set, errors }: StepProps) {
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
      <SectionTitle title="Review & Declaration" description="Verify your details and sign to submit." />
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

      <Field label="Digital signature (type your full name)" required error={errors.signature}>
        <TextInput
          value={form.signature}
          onChange={(e) => set("signature", e.target.value)}
          placeholder="Jane Doe"
          className="font-display italic"
          aria-invalid={!!errors.signature}
        />
      </Field>

      <div className="space-y-1">
        <label
          className={`flex items-start gap-3 rounded-lg border p-4 text-sm transition-colors ${
            errors.agree ? "border-destructive bg-destructive/5" : "border-border bg-muted/30"
          }`}
        >
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
        {errors.agree && <p className="text-xs text-destructive">{errors.agree}</p>}
      </div>
    </div>
  );
}