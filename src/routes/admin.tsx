import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Download, Search, Users2, CheckCircle2, Clock, UserCheck,
  Eye, ExternalLink, FileText, X, ChevronDown, Mail, XCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase-client.ts";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "HR Dashboard — Helix HR" },
      { name: "description", content: "Review onboarding submissions, filter by status, and export employee records." },
    ],
  }),
  component: Admin,
});

type Status = "Pending" | "Approved" | "Joined" | "Rejected";
type DbStatus = "PENDING" | "APPROVED" | "JOINED" | "REJECTED";
type DrawerTab = "details" | "status" | "timeline";

interface Submission {
  id: string;
  dbId: string;
  type: "pre-joining" | "post-joining";
  name: string;
  email: string;
  position: string;
  department: string;
  status: Status;
  submittedAt: string;
  payload?: Record<string, unknown>;
  isSeeded?: boolean;
}

const dbToUi: Record<DbStatus, Status> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  JOINED: "Joined",
  REJECTED: "Rejected",
};

const uiToDb: Record<Status, DbStatus> = {
  Pending: "PENDING",
  Approved: "APPROVED",
  Joined: "JOINED",
  Rejected: "REJECTED",
};

const SEED: Submission[] = [
  { id: "PRE-A8X29F1", dbId: "", type: "pre-joining", name: "Aarav Mehta", email: "aarav@example.com", position: "Senior Engineer", department: "Engineering", status: "Approved", submittedAt: "2026-05-22T10:14:00Z", isSeeded: true },
  { id: "PRE-B91KE22", dbId: "", type: "pre-joining", name: "Priya Iyer", email: "priya.i@example.com", position: "Product Designer", department: "Design", status: "Pending", submittedAt: "2026-05-24T08:02:00Z", isSeeded: true },
  { id: "POST-D14MZ7P", dbId: "", type: "post-joining", name: "EMP-58231", email: "rhea@helix.hr", position: "Full-time", department: "Bangalore", status: "Joined", submittedAt: "2026-05-19T09:30:00Z", isSeeded: true },
];

const PRE_FIELDS: Record<string, string> = {
  fullName: "Full Name", dob: "Date of Birth", gender: "Gender", bloodGroup: "Blood Group",
  mobile: "Mobile", altMobile: "Alternate Mobile", email: "Email",
  currentAddress: "Current Address", permanentAddress: "Permanent Address",
  emergencyName: "Emergency Contact", emergencyNumber: "Emergency Number",
  position: "Position", department: "Department", joinDate: "Join Date",
  prevCompany: "Previous Company", experience: "Experience", skills: "Skills",
  linkedin: "LinkedIn", portfolio: "Portfolio / Github",
  bankName: "Bank Name", accountHolder: "Account Holder", accountNumber: "Account Number",
  ifsc: "IFSC Code", branch: "Branch",
  fileAadhaar: "Aadhaar Card", filePan: "PAN Card", fileResume: "Resume / CV",
  filePhoto: "Passport Photo", fileEdu: "Educational Certificates", fileExp: "Experience Certificates",
  signature: "Digital Signature", agree: "Declaration Agreed",
};

const POST_FIELDS: Record<string, string> = {
  employeeId: "Employee ID", officialEmail: "Official Email", reportingManager: "Reporting Manager",
  workLocation: "Work Location", employmentType: "Employment Type", shift: "Shift",
  joiningDate: "Joining Date", uan: "UAN Number", pf: "PF Number", esic: "ESIC Number",
  salaryStructure: "Salary Structure", ctc: "CTC", insurance: "Insurance",
  laptop: "Laptop", systemId: "System ID", softwareAccess: "Software Access",
  idCard: "ID Card Issued", emailAccess: "Email Access",
};

const FILE_KEYS = new Set(["fileAadhaar", "filePan", "fileResume", "filePhoto", "fileEdu", "fileExp"]);
const LINK_KEYS = new Set(["linkedin", "portfolio"]);

const STORAGE_BUCKET = "onboarding-documents";



const BUCKETS = {
  preJoining: import.meta.env.VITE_BUCKET_PRE_JOINING as string,
  postJoining: import.meta.env.VITE_BUCKET_POST_JOINING as string,
}

// ✅ Replace the entire getSignedUrl function
async function getSignedUrl(filePath: string): Promise<string | null> {
  // Detect bucket based on file path prefix
  // Files are stored as: userId/fieldKey_timestamp.ext
  // Pre-joining file keys: fileAadhaar, filePan, fileResume, filePhoto, fileEdu, fileExp
  const isPreJoining = /\/(fileAadhaar|filePan|fileResume|filePhoto|fileEdu|fileExp)_/.test(filePath)
  const bucket = isPreJoining ? BUCKETS.preJoining : BUCKETS.postJoining

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, 60 * 60);

  if (error) {
    console.error("Signed URL error:", error);
    // Fallback: try old bucket for legacy files
    const { data: fallback, error: fallbackError } = await supabase.storage
      .from("onboarding-documents")
      .createSignedUrl(filePath, 60 * 60);
    if (fallbackError) { console.error("Fallback error:", fallbackError); return null; }
    return fallback.signedUrl;
  }


  return data.signedUrl;
}

// ─── Doc Preview Modal ────────────────────────────────────────────────────────

function DocPreviewModal({ url, name, onClose }: { url: string; name: string; onClose: () => void }) {
  const isPdf = url.toLowerCase().includes(".pdf") || url.includes("application/pdf");
  const isImage = /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(url);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="relative flex flex-col w-full max-w-4xl max-h-[90vh] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground truncate max-w-xs">{name}</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Open in new tab
            </a>
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-muted/20 min-h-0">
          {isPdf ? (
            <iframe src={url} title={name} className="w-full h-full min-h-[70vh]" style={{ border: "none" }} />
          ) : isImage ? (
            <div className="flex items-center justify-center p-6 min-h-[50vh]">
              <img src={url} alt={name} className="max-w-full max-h-[75vh] object-contain rounded-lg shadow" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 min-h-[40vh] text-muted-foreground">
              <FileText className="h-12 w-12 opacity-40" />
              <p className="text-sm">Preview not available for this file type.</p>
              <a href={url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                <Download className="h-4 w-4" /> Download file
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Field Value ──────────────────────────────────────────────────────────────

function FieldValue({ fieldKey, label, value }: { fieldKey: string; label: string; value: unknown }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const stringVal = typeof value === "boolean" ? (value ? "✅ Yes" : "❌ No") : String(value);
  const isStoragePath = stringVal.includes("/");

  const handleFileClick = async () => {
    if (previewUrl) { setModalOpen(true); return; }
    setLoading(true);
    const signed = await getSignedUrl(stringVal);
    setLoading(false);
    if (signed) { setPreviewUrl(signed); setModalOpen(true); }
    else { alert("Could not load document. Please check storage permissions."); }
  };

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2">
      <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</div>

      {FILE_KEYS.has(fieldKey) ? (
        isStoragePath ? (
          <button
            onClick={handleFileClick}
            disabled={loading}
            className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors disabled:opacity-60"
          >
            {loading ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
            {loading ? "Loading…" : "View Document"}
          </button>
        ) : (
          <div className="mt-0.5 flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-muted-foreground/50" />
            <span className="text-sm text-muted-foreground/70 italic">{stringVal}</span>
            <span className="text-[10px] text-muted-foreground/40">(not uploaded)</span>
          </div>
        )
      ) : LINK_KEYS.has(fieldKey) ? (
        <a
          href={stringVal.startsWith("http") ? stringVal : `https://${stringVal}`}
          target="_blank" rel="noopener noreferrer"
          className="mt-0.5 inline-flex items-center gap-1 text-sm font-medium text-primary underline underline-offset-2 hover:text-primary/80 transition-colors break-all"
        >
          {stringVal}
          <ExternalLink className="h-3 w-3 shrink-0" />
        </a>
      ) : (
        <div className="mt-0.5 text-sm font-medium text-foreground break-words">{stringVal}</div>
      )}

      {modalOpen && previewUrl && (
        <DocPreviewModal url={previewUrl} name={label} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}

// ─── Submission Drawer ────────────────────────────────────────────────────────

const STATUS_STYLES: Record<Status, string> = {
  Pending: "bg-warning/20 text-warning-foreground",
  Approved: "bg-success/15 text-success",
  Joined: "bg-primary-soft text-primary",
  Rejected: "bg-destructive/15 text-destructive",
};

function avatarInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

function InlineFieldValue({ fieldKey, value }: { fieldKey: string; value: unknown }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const stringVal = typeof value === "boolean" ? (value ? "✅ Yes" : "❌ No") : String(value);
  const isStoragePath = stringVal.includes("/");

  const handleFileClick = async () => {
    if (previewUrl) { setModalOpen(true); return; }
    setLoading(true);
    const signed = await getSignedUrl(stringVal);
    setLoading(false);
    if (signed) { setPreviewUrl(signed); setModalOpen(true); }
    else { alert("Could not load document. Please check storage permissions."); }
  };

  if (FILE_KEYS.has(fieldKey)) {
    return isStoragePath ? (
      <>
        <button onClick={handleFileClick} disabled={loading}
          className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors disabled:opacity-60">
          {loading
            ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            : <Eye className="h-3 w-3" />}
          {loading ? "Loading…" : "View"}
        </button>
        {modalOpen && previewUrl && (
          <DocPreviewModal url={previewUrl} name={fieldKey} onClose={() => setModalOpen(false)} />
        )}
      </>
    ) : (
      <span className="text-muted-foreground/50 italic text-xs">{stringVal} (not uploaded)</span>
    );
  }

  if (LINK_KEYS.has(fieldKey)) {
    return (
      <a href={stringVal.startsWith("http") ? stringVal : `https://${stringVal}`}
        target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-primary underline underline-offset-2 hover:text-primary/80 break-all">
        {stringVal}<ExternalLink className="h-3 w-3 shrink-0" />
      </a>
    );
  }

  return <>{stringVal}</>;
}

function SubmissionDrawer({
  item,
  onClose,
  onStatusChange,
}: {
  item: Submission;
  onClose: () => void;
  onStatusChange: (id: string, status: Status) => void;
}) {
  const [tab, setTab] = useState<DrawerTab>("details");
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const fields = item.type === "pre-joining" ? PRE_FIELDS : POST_FIELDS;
  const payloadEntries = Object.entries(fields).filter(([key]) => {
    const v = item.payload?.[key];
    return v !== undefined && v !== null && v !== "";
  });

  // Group pre-joining fields into sections
  const PRE_SECTIONS: { label: string; keys: string[] }[] = [
    { label: "Personal information", keys: ["fullName","dob","gender","bloodGroup","mobile","altMobile","email","currentAddress","permanentAddress","emergencyName","emergencyNumber"] },
    { label: "Professional details", keys: ["position","department","joinDate","prevCompany","experience","skills","linkedin","portfolio"] },
    { label: "Bank details", keys: ["bankName","accountHolder","accountNumber","ifsc","branch"] },
    { label: "Documents", keys: ["fileAadhaar","filePan","fileResume","filePhoto","fileEdu","fileExp"] },
    { label: "Declaration", keys: ["signature","agree"] },
  ];
  const POST_SECTIONS: { label: string; keys: string[] }[] = [
    { label: "Employment details", keys: ["employeeId","officialEmail","reportingManager","workLocation","employmentType","shift","joiningDate","uan","pf","esic"] },
    { label: "Compensation", keys: ["salaryStructure","ctc","insurance"] },
    { label: "System access", keys: ["laptop","systemId","softwareAccess","idCard","emailAccess"] },
  ];
  const sections = item.type === "pre-joining" ? PRE_SECTIONS : POST_SECTIONS;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Submission details for ${item.name}`}
        className="fixed inset-0 z-50 flex flex-col bg-card animate-in fade-in duration-300"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-border max-w-3xl mx-auto w-full">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary text-sm font-semibold select-none">
              {avatarInitials(item.name)}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-foreground truncate">{item.name}</h2>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                <span className="font-mono text-[11px] text-muted-foreground">{item.id}</span>
                <span className="text-muted-foreground/40 text-xs">·</span>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${item.type === "pre-joining" ? "bg-primary-soft text-primary" : "bg-accent/15 text-accent"}`}>
                  {item.type}
                </span>
                <span className="text-muted-foreground/40 text-xs">·</span>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[item.status]}`}>
                  {item.status}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex gap-0 px-6 max-w-3xl mx-auto w-full" role="tablist">
          {(["details", "status", "timeline"] as DrawerTab[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`relative py-3 pr-4 text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-4 after:h-[2px] after:rounded-full after:bg-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "details" ? "Form details" : t === "status" ? "Status & actions" : "Timeline"}
            </button>
          ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto py-8 space-y-8">
  <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 space-y-8">

          {/* ── Details tab ── */}
          {tab === "details" && (
            <>
              {payloadEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">No detailed form data available for this submission.</p>
              ) : (
                sections.map(({ label, keys }) => {
                  const visible = keys.filter((k) => {
                    const v = item.payload?.[k];
                    return v !== undefined && v !== null && v !== "";
                  });
                  if (visible.length === 0) return null;
                  return (
                    <div key={label}>
                      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</h3>
                      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
  {visible.map((key, idx) => (
    <div
      key={key}
      className={`group flex items-center gap-4 px-6 py-3 text-sm transition-colors hover:bg-primary/5 ${idx !== 0 ? "border-t border-border/60" : ""}`}
    >
      <span className="w-48 shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground/70 group-hover:text-muted-foreground transition-colors">
        {fields[key]}
      </span>
      <span className="h-4 w-px shrink-0 bg-border/60" />
      <span className="font-medium text-foreground flex-1 min-w-0">
        <InlineFieldValue fieldKey={key} value={item.payload![key]} />
      </span>
    </div>
  ))}
</div>
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* ── Status tab ── */}
          {tab === "status" && (
            <>
              <div>
                <h3 className="mb-2 mt-6 first:mt-0 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Update submission status</h3>
                <div className="rounded-xl border border-border bg-muted/30 p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Submission status</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Applicant will be notified by email on change.</p>
                  </div>
                  <div className="relative">
                    <select
                      value={item.status}
                      onChange={(e) => onStatusChange(item.id, e.target.value as Status)}
                      className={`cursor-pointer appearance-none rounded-full border-0 pl-3 pr-7 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring/30 ${STATUS_STYLES[item.status]}`}
                    >
                      {(["Pending", "Approved", "Joined", "Rejected"] as Status[]).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Submission info</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    { label: "Reference ID", value: item.id },
                    { label: "Email", value: item.email },
                    { label: "Position", value: item.position },
                    { label: "Department", value: item.department },
                    { label: "Form type", value: item.type },
                    { label: "Submitted", value: new Date(item.submittedAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-lg border border-border bg-card px-3 py-2">
                      <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
                      <div className="mt-0.5 text-sm font-medium text-foreground break-words font-mono text-xs">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── Timeline tab ── */}
          {tab === "timeline" && (
  <div>
    <h3 className="mb-6 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Activity</h3>
    <ol className="space-y-3">
      {[
        {
          icon: Download,
          title: "Form submitted",
          desc: `${item.type === "pre-joining" ? "Pre-joining" : "Post-joining"} form submitted by ${item.name}.`,
          time: new Date(item.submittedAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }),
          iconClass: "bg-primary/10 text-primary border-primary/20",
        },
        {
          icon: Mail,
          title: "Acknowledgement sent",
          desc: `Confirmation email dispatched to ${item.email}.`,
          time: new Date(item.submittedAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }),
          iconClass: "bg-muted text-muted-foreground border-border",
        },
        ...(item.status !== "Pending" ? [{
          icon: item.status === "Approved" ? CheckCircle2
              : item.status === "Joined"   ? UserCheck
              : item.status === "Rejected" ? XCircle
              : Clock,
          title: `Status updated to ${item.status}`,
          desc: `HR updated submission status to ${item.status}.`,
          time: "Recently",
          iconClass: item.status === "Approved" ? "bg-success/15 text-success border-success/20"
                   : item.status === "Joined"   ? "bg-primary/10 text-primary border-primary/20"
                   : item.status === "Rejected" ? "bg-destructive/10 text-destructive border-destructive/20"
                   : "bg-muted text-muted-foreground border-border",
        }] : []),
      ].map((event, idx, arr) => {
        const Icon = event.icon;
        return (
          <li key={idx} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`h-9 w-9 shrink-0 rounded-full border-2 flex items-center justify-center ${event.iconClass}`}>
                <Icon className="h-4 w-4" />
              </div>
              {idx < arr.length - 1 && (
                <div className="w-px flex-1 bg-border/60 my-1.5" />
              )}
            </div>
            <div className="flex-1 pb-4 last:pb-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{event.title}</p>
                <time className="text-[11px] text-muted-foreground/60 shrink-0">{event.time}</time>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{event.desc}</p>
            </div>
          </li>
        );
      })}
    </ol>
  </div>
)}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Admin page ───────────────────────────────────────────────────────────────

function Admin() {
  const [items, setItems] = useState<Submission[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status | "All">("All");
  const [drawerItem, setDrawerItem] = useState<Submission | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      const { data, error } = await supabase
        .from("Submission")
        .select("id, referenceId, type, applicantName, email, position, department, status, createdAt, payload")
        .order("createdAt", { ascending: false });

      if (error) { console.error("Fetch error:", error); setItems(SEED); return; }

      const mapped: Submission[] = (data ?? []).map((s: any) => ({
        id: s.referenceId ?? s.id,
        dbId: s.id,
        type: s.type === "PRE_JOINING" ? "pre-joining" : "post-joining",
        name: s.applicantName ?? "",
        email: s.email ?? "",
        position: s.position ?? "",
        department: s.department ?? "",
        status: dbToUi[s.status as DbStatus] ?? "Pending",
        submittedAt: s.createdAt,
        payload: s.payload ?? {},
      }));

      setItems(mapped.length > 0 ? mapped : SEED);
    };

    fetchSubmissions();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const q = query.trim().toLowerCase();
      const matchQ = !q || i.name.toLowerCase().includes(q) || i.email.toLowerCase().includes(q) || i.id.toLowerCase().includes(q);
      const matchS = status === "All" || i.status === status;
      return matchQ && matchS;
    });
  }, [items, query, status]);

  const counts = useMemo(() => ({
    total: items.length,
    pending: items.filter((i) => i.status === "Pending").length,
    approved: items.filter((i) => i.status === "Approved").length,
    joined: items.filter((i) => i.status === "Joined").length,
  }), [items]);

  const updateStatus = async (id: string, newStatus: Status) => {
    setItems((arr) => arr.map((i) => (i.id === id ? { ...i, status: newStatus } : i)));
    // Keep drawer item in sync
    setDrawerItem((prev) => prev?.id === id ? { ...prev, status: newStatus } : prev);

    const item = items.find((i) => i.id === id);
    if (!item || item.isSeeded) return;
    const dbStatus = uiToDb[newStatus];
    const { error } = await supabase.from("Submission").update({ status: dbStatus }).eq("id", item.dbId);
    if (error) {
      console.error("Failed to save status:", error);
      setItems((arr) => arr.map((i) => (i.id === id ? { ...i, status: item.status } : i)));
      setDrawerItem((prev) => prev?.id === id ? { ...prev, status: item.status } : prev);
      alert(`Could not save status: ${error.message}`);
      return;
    }
    supabase.functions.invoke("send-email", {
      body: { type: "status-update", to: item.email, name: item.name, referenceId: item.id, status: dbStatus },
    }).catch(console.error);
  };

  const exportCsv = () => {
    const headers = ["ID", "Type", "Name", "Email", "Position", "Department", "Status", "Submitted"];
    const rows = filtered.map((i) => [i.id, i.type, i.name, i.email, i.position, i.department, i.status, i.submittedAt]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "employee-submissions.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">HR Dashboard</div>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Employee submissions</h1>
          <p className="mt-1 text-sm text-muted-foreground">Review onboarding forms, update status, and export reports.</p>
        </div>
        <button onClick={exportCsv} className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium transition-colors hover:bg-secondary">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users2} label="Total submissions" value={counts.total} tone="primary" />
        <StatCard icon={Clock} label="Pending review" value={counts.pending} tone="warning" />
        <StatCard icon={CheckCircle2} label="Approved" value={counts.approved} tone="success" />
        <StatCard icon={UserCheck} label="Joined" value={counts.joined} tone="accent" />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, or reference…"
            className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm placeholder:text-muted-foreground/70 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["All", "Pending", "Approved", "Joined", "Rejected"] as const).map((s) => (
            <button key={s} onClick={() => setStatus(s)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${status === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Role / Type</th>
                <th className="px-4 py-3 font-medium">Submitted</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No submissions match your filters.
                  </td>
                </tr>
              )}
              {filtered.map((i) => (
                <tr
                  key={i.id}
                  className={`border-t border-border transition-colors hover:bg-muted/30 cursor-pointer ${drawerItem?.id === i.id ? "bg-muted/40" : ""}`}
                  onClick={() => setDrawerItem(i)}
                >
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs text-muted-foreground">{i.id}</div>
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${i.type === "pre-joining" ? "bg-primary-soft text-primary" : "bg-accent/15 text-accent"}`}>
                      {i.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{i.name}</div>
                    <div className="text-xs text-muted-foreground">{i.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-foreground">{i.position}</div>
                    <div className="text-xs text-muted-foreground">{i.department}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(i.submittedAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <StatusMenu current={i.status} onChange={(s) => updateStatus(i.id, s)} />
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setDrawerItem(i)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${drawerItem?.id === i.id ? "border-primary/30 bg-primary-soft text-primary" : "border-border bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      {drawerItem && (
        <SubmissionDrawer
          item={drawerItem}
          onClose={() => setDrawerItem(null)}
          onStatusChange={updateStatus}
        />
      )}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, tone }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone: "primary" | "warning" | "success" | "accent";
}) {
  const tones = {
    primary: "bg-primary-soft text-primary",
    warning: "bg-warning/20 text-warning-foreground",
    success: "bg-success/15 text-success",
    accent: "bg-accent/15 text-accent",
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        <div className={`grid h-8 w-8 place-items-center rounded-md ${tones[tone]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 font-display text-3xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}

// ─── Status Menu ──────────────────────────────────────────────────────────────

function StatusMenu({ current, onChange }: { current: Status; onChange: (s: Status) => void }) {
  const styles: Record<Status, string> = {
    Pending: "bg-warning/20 text-warning-foreground",
    Approved: "bg-success/15 text-success",
    Joined: "bg-primary-soft text-primary",
    Rejected: "bg-destructive/15 text-destructive",
  };
  return (
    <select
      value={current}
      onChange={(e) => onChange(e.target.value as Status)}
      className={`inline-flex cursor-pointer items-center gap-1 rounded-full border-0 px-3 py-1 pr-7 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring/30 ${styles[current]}`}
    >
      {(["Pending", "Approved", "Joined", "Rejected"] as Status[]).map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}