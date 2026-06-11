import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { s as supabase } from "./router-BNW6PfCf.mjs";
import { D as Download, t as UsersRound, g as Clock, d as CircleCheck, r as UserCheck, n as Search, h as Eye, X, b as ChevronDown, M as Mail, e as CircleX, E as ExternalLink, i as FileText } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tanstack__react-router.mjs";
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
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
const dbToUi = {
  PENDING: "Pending",
  APPROVED: "Approved",
  JOINED: "Joined",
  REJECTED: "Rejected"
};
const uiToDb = {
  Pending: "PENDING",
  Approved: "APPROVED",
  Joined: "JOINED",
  Rejected: "REJECTED"
};
const SEED = [{
  id: "PRE-A8X29F1",
  dbId: "",
  type: "pre-joining",
  name: "Aarav Mehta",
  email: "aarav@example.com",
  position: "Senior Engineer",
  department: "Engineering",
  status: "Approved",
  submittedAt: "2026-05-22T10:14:00Z",
  isSeeded: true
}, {
  id: "PRE-B91KE22",
  dbId: "",
  type: "pre-joining",
  name: "Priya Iyer",
  email: "priya.i@example.com",
  position: "Product Designer",
  department: "Design",
  status: "Pending",
  submittedAt: "2026-05-24T08:02:00Z",
  isSeeded: true
}, {
  id: "POST-D14MZ7P",
  dbId: "",
  type: "post-joining",
  name: "EMP-58231",
  email: "rhea@helix.hr",
  position: "Full-time",
  department: "Bangalore",
  status: "Joined",
  submittedAt: "2026-05-19T09:30:00Z",
  isSeeded: true
}];
const PRE_FIELDS = {
  fullName: "Full Name",
  dob: "Date of Birth",
  gender: "Gender",
  bloodGroup: "Blood Group",
  mobile: "Mobile",
  altMobile: "Alternate Mobile",
  email: "Email",
  currentAddress: "Current Address",
  permanentAddress: "Permanent Address",
  emergencyName: "Emergency Contact",
  emergencyNumber: "Emergency Number",
  position: "Position",
  department: "Department",
  joinDate: "Join Date",
  prevCompany: "Previous Company",
  experience: "Experience",
  skills: "Skills",
  linkedin: "LinkedIn",
  portfolio: "Portfolio / Github",
  bankName: "Bank Name",
  accountHolder: "Account Holder",
  accountNumber: "Account Number",
  ifsc: "IFSC Code",
  branch: "Branch",
  fileAadhaar: "Aadhaar Card",
  filePan: "PAN Card",
  fileResume: "Resume / CV",
  filePhoto: "Passport Photo",
  fileEdu: "Educational Certificates",
  fileExp: "Experience Certificates",
  signature: "Digital Signature",
  agree: "Declaration Agreed"
};
const POST_FIELDS = {
  employeeId: "Employee ID",
  officialEmail: "Official Email",
  reportingManager: "Reporting Manager",
  workLocation: "Work Location",
  employmentType: "Employment Type",
  shift: "Shift",
  joiningDate: "Joining Date",
  uan: "UAN Number",
  pf: "PF Number",
  esic: "ESIC Number",
  salaryStructure: "Salary Structure",
  ctc: "CTC",
  insurance: "Insurance",
  laptop: "Laptop",
  systemId: "System ID",
  softwareAccess: "Software Access",
  idCard: "ID Card Issued",
  emailAccess: "Email Access"
};
const FILE_KEYS = /* @__PURE__ */ new Set(["fileAadhaar", "filePan", "fileResume", "filePhoto", "fileEdu", "fileExp"]);
const LINK_KEYS = /* @__PURE__ */ new Set(["linkedin", "portfolio"]);
const BUCKETS = {
  preJoining: "pre-joining-documents",
  postJoining: "post-joining-documents"
};
async function getSignedUrl(filePath) {
  const isPreJoining = /\/(fileAadhaar|filePan|fileResume|filePhoto|fileEdu|fileExp)_/.test(filePath);
  const bucket = isPreJoining ? BUCKETS.preJoining : BUCKETS.postJoining;
  const {
    data,
    error
  } = await supabase.storage.from(bucket).createSignedUrl(filePath, 60 * 60);
  if (error) {
    console.error("Signed URL error:", error);
    const {
      data: fallback,
      error: fallbackError
    } = await supabase.storage.from("onboarding-documents").createSignedUrl(filePath, 60 * 60);
    if (fallbackError) {
      console.error("Fallback error:", fallbackError);
      return null;
    }
    return fallback.signedUrl;
  }
  return data.signedUrl;
}
function DocPreviewModal({
  url,
  name,
  onClose
}) {
  const isPdf = url.toLowerCase().includes(".pdf") || url.includes("application/pdf");
  const isImage = /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(url);
  reactExports.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex flex-col w-full max-w-4xl max-h-[90vh] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-5 py-3 border-b border-border bg-muted/40", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-foreground truncate max-w-xs", children: name })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: url, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3.5 w-3.5" }),
          " Open in new tab"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "grid h-8 w-8 place-items-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-auto bg-muted/20 min-h-0", children: isPdf ? /* @__PURE__ */ jsxRuntimeExports.jsx("iframe", { src: url, title: name, className: "w-full h-full min-h-[70vh]", style: {
      border: "none"
    } }) : isImage ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center p-6 min-h-[50vh]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: url, alt: name, className: "max-w-full max-h-[75vh] object-contain rounded-lg shadow" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center gap-4 min-h-[40vh] text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-12 w-12 opacity-40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Preview not available for this file type." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: url, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }),
        " Download file"
      ] })
    ] }) })
  ] }) });
}
const STATUS_STYLES = {
  Pending: "bg-warning/20 text-warning-foreground",
  Approved: "bg-success/15 text-success",
  Joined: "bg-primary-soft text-primary",
  Rejected: "bg-destructive/15 text-destructive"
};
function avatarInitials(name) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}
function InlineFieldValue({
  fieldKey,
  value
}) {
  const [previewUrl, setPreviewUrl] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(false);
  const [modalOpen, setModalOpen] = reactExports.useState(false);
  const stringVal = typeof value === "boolean" ? value ? "✅ Yes" : "❌ No" : String(value);
  const isStoragePath = stringVal.includes("/");
  const handleFileClick = async () => {
    if (previewUrl) {
      setModalOpen(true);
      return;
    }
    setLoading(true);
    const signed = await getSignedUrl(stringVal);
    setLoading(false);
    if (signed) {
      setPreviewUrl(signed);
      setModalOpen(true);
    } else {
      alert("Could not load document. Please check storage permissions.");
    }
  };
  if (FILE_KEYS.has(fieldKey)) {
    return isStoragePath ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleFileClick, disabled: loading, className: "inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors disabled:opacity-60", children: [
        loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3 w-3" }),
        loading ? "Loading…" : "View"
      ] }),
      modalOpen && previewUrl && /* @__PURE__ */ jsxRuntimeExports.jsx(DocPreviewModal, { url: previewUrl, name: fieldKey, onClose: () => setModalOpen(false) })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground/50 italic text-xs", children: [
      stringVal,
      " (not uploaded)"
    ] });
  }
  if (LINK_KEYS.has(fieldKey)) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: stringVal.startsWith("http") ? stringVal : `https://${stringVal}`, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1 text-primary underline underline-offset-2 hover:text-primary/80 break-all", children: [
      stringVal,
      /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3 shrink-0" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: stringVal });
}
function SubmissionDrawer({
  item,
  onClose,
  onStatusChange
}) {
  const [tab, setTab] = reactExports.useState("details");
  const drawerRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  reactExports.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  const fields = item.type === "pre-joining" ? PRE_FIELDS : POST_FIELDS;
  const payloadEntries = Object.entries(fields).filter(([key]) => {
    const v = item.payload?.[key];
    return v !== void 0 && v !== null && v !== "";
  });
  const PRE_SECTIONS = [{
    label: "Personal information",
    keys: ["fullName", "dob", "gender", "bloodGroup", "mobile", "altMobile", "email", "currentAddress", "permanentAddress", "emergencyName", "emergencyNumber"]
  }, {
    label: "Professional details",
    keys: ["position", "department", "joinDate", "prevCompany", "experience", "skills", "linkedin", "portfolio"]
  }, {
    label: "Bank details",
    keys: ["bankName", "accountHolder", "accountNumber", "ifsc", "branch"]
  }, {
    label: "Documents",
    keys: ["fileAadhaar", "filePan", "fileResume", "filePhoto", "fileEdu", "fileExp"]
  }, {
    label: "Declaration",
    keys: ["signature", "agree"]
  }];
  const POST_SECTIONS = [{
    label: "Employment details",
    keys: ["employeeId", "officialEmail", "reportingManager", "workLocation", "employmentType", "shift", "joiningDate", "uan", "pf", "esic"]
  }, {
    label: "Compensation",
    keys: ["salaryStructure", "ctc", "insurance"]
  }, {
    label: "System access",
    keys: ["laptop", "systemId", "softwareAccess", "idCard", "emailAccess"]
  }];
  const sections = item.type === "pre-joining" ? PRE_SECTIONS : POST_SECTIONS;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity", onClick: onClose, "aria-hidden": "true" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: drawerRef, role: "dialog", "aria-modal": "true", "aria-label": `Submission details for ${item.name}`, className: "fixed inset-0 z-50 flex flex-col bg-card animate-in fade-in duration-300", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4 px-6 py-5 border-b border-border max-w-3xl mx-auto w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary text-sm font-semibold select-none", children: avatarInitials(item.name) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-foreground truncate", children: item.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[11px] text-muted-foreground", children: item.id }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/40 text-xs", children: "·" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${item.type === "pre-joining" ? "bg-primary-soft text-primary" : "bg-accent/15 text-accent"}`, children: item.type }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/40 text-xs", children: "·" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[item.status]}`, children: item.status })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "shrink-0 grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors", "aria-label": "Close drawer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-0 px-6 max-w-3xl mx-auto w-full", role: "tablist", children: ["details", "status", "timeline"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { role: "tab", "aria-selected": tab === t, onClick: () => setTab(t), className: `relative py-3 pr-4 text-sm font-medium capitalize transition-colors ${tab === t ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-4 after:h-[2px] after:rounded-full after:bg-foreground" : "text-muted-foreground hover:text-foreground"}`, children: t === "details" ? "Form details" : t === "status" ? "Status & actions" : "Timeline" }, t)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto py-8 space-y-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto w-full max-w-3xl px-4 sm:px-6 space-y-8", children: [
        tab === "details" && /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: payloadEntries.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No detailed form data available for this submission." }) : sections.map(({
          label,
          keys
        }) => {
          const visible = keys.filter((k) => {
            const v = item.payload?.[k];
            return v !== void 0 && v !== null && v !== "";
          });
          if (visible.length === 0) return null;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground", children: label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-border bg-card overflow-hidden shadow-sm", children: visible.map((key, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `group flex items-center gap-4 px-6 py-3 text-sm transition-colors hover:bg-primary/5 ${idx !== 0 ? "border-t border-border/60" : ""}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-48 shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground/70 group-hover:text-muted-foreground transition-colors", children: fields[key] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-4 w-px shrink-0 bg-border/60" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground flex-1 min-w-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(InlineFieldValue, { fieldKey: key, value: item.payload[key] }) })
            ] }, key)) })
          ] }, label);
        }) }),
        tab === "status" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 mt-6 first:mt-0 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground", children: "Update submission status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-muted/30 p-4 flex items-center justify-between gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: "Submission status" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Applicant will be notified by email on change." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: item.status, onChange: (e) => onStatusChange(item.id, e.target.value), className: `cursor-pointer appearance-none rounded-full border-0 pl-3 pr-7 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring/30 ${STATUS_STYLES[item.status]}`, children: ["Pending", "Approved", "Joined", "Rejected"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s, children: s }, s)) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground", children: "Submission info" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 sm:grid-cols-2", children: [{
              label: "Reference ID",
              value: item.id
            }, {
              label: "Email",
              value: item.email
            }, {
              label: "Position",
              value: item.position
            }, {
              label: "Department",
              value: item.department
            }, {
              label: "Form type",
              value: item.type
            }, {
              label: "Submitted",
              value: new Date(item.submittedAt).toLocaleDateString(void 0, {
                day: "numeric",
                month: "short",
                year: "numeric"
              })
            }].map(({
              label,
              value
            }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border bg-card px-3 py-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-medium uppercase tracking-wide text-muted-foreground", children: label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 text-sm font-medium text-foreground break-words font-mono text-xs", children: value })
            ] }, label)) })
          ] })
        ] }),
        tab === "timeline" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-6 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground", children: "Activity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "space-y-3", children: [{
            icon: Download,
            title: "Form submitted",
            desc: `${item.type === "pre-joining" ? "Pre-joining" : "Post-joining"} form submitted by ${item.name}.`,
            time: new Date(item.submittedAt).toLocaleDateString(void 0, {
              day: "numeric",
              month: "short",
              year: "numeric"
            }),
            iconClass: "bg-primary/10 text-primary border-primary/20"
          }, {
            icon: Mail,
            title: "Acknowledgement sent",
            desc: `Confirmation email dispatched to ${item.email}.`,
            time: new Date(item.submittedAt).toLocaleDateString(void 0, {
              day: "numeric",
              month: "short",
              year: "numeric"
            }),
            iconClass: "bg-muted text-muted-foreground border-border"
          }, ...item.status !== "Pending" ? [{
            icon: item.status === "Approved" ? CircleCheck : item.status === "Joined" ? UserCheck : item.status === "Rejected" ? CircleX : Clock,
            title: `Status updated to ${item.status}`,
            desc: `HR updated submission status to ${item.status}.`,
            time: "Recently",
            iconClass: item.status === "Approved" ? "bg-success/15 text-success border-success/20" : item.status === "Joined" ? "bg-primary/10 text-primary border-primary/20" : item.status === "Rejected" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-muted text-muted-foreground border-border"
          }] : []].map((event, idx, arr) => {
            const Icon = event.icon;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-9 w-9 shrink-0 rounded-full border-2 flex items-center justify-center ${event.iconClass}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }) }),
                idx < arr.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px flex-1 bg-border/60 my-1.5" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 pb-4 last:pb-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground", children: event.title }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("time", { className: "text-[11px] text-muted-foreground/60 shrink-0", children: event.time })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5 leading-relaxed", children: event.desc })
              ] })
            ] }, idx);
          }) })
        ] })
      ] }) })
    ] })
  ] });
}
function Admin() {
  const [items, setItems] = reactExports.useState([]);
  const [query, setQuery] = reactExports.useState("");
  const [status, setStatus] = reactExports.useState("All");
  const [drawerItem, setDrawerItem] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const fetchSubmissions = async () => {
      const {
        data,
        error
      } = await supabase.from("Submission").select("id, referenceId, type, applicantName, email, position, department, status, createdAt, payload").order("createdAt", {
        ascending: false
      });
      if (error) {
        console.error("Fetch error:", error);
        setItems(SEED);
        return;
      }
      const mapped = (data ?? []).map((s) => ({
        id: s.referenceId ?? s.id,
        dbId: s.id,
        type: s.type === "PRE_JOINING" ? "pre-joining" : "post-joining",
        name: s.applicantName ?? "",
        email: s.email ?? "",
        position: s.position ?? "",
        department: s.department ?? "",
        status: dbToUi[s.status] ?? "Pending",
        submittedAt: s.createdAt,
        payload: s.payload ?? {}
      }));
      setItems(mapped.length > 0 ? mapped : SEED);
    };
    fetchSubmissions();
  }, []);
  const filtered = reactExports.useMemo(() => {
    return items.filter((i) => {
      const q = query.trim().toLowerCase();
      const matchQ = !q || i.name.toLowerCase().includes(q) || i.email.toLowerCase().includes(q) || i.id.toLowerCase().includes(q);
      const matchS = status === "All" || i.status === status;
      return matchQ && matchS;
    });
  }, [items, query, status]);
  const counts = reactExports.useMemo(() => ({
    total: items.length,
    pending: items.filter((i) => i.status === "Pending").length,
    approved: items.filter((i) => i.status === "Approved").length,
    joined: items.filter((i) => i.status === "Joined").length
  }), [items]);
  const updateStatus = async (id, newStatus) => {
    setItems((arr) => arr.map((i) => i.id === id ? {
      ...i,
      status: newStatus
    } : i));
    setDrawerItem((prev) => prev?.id === id ? {
      ...prev,
      status: newStatus
    } : prev);
    const item = items.find((i) => i.id === id);
    if (!item || item.isSeeded) return;
    const dbStatus = uiToDb[newStatus];
    const {
      error
    } = await supabase.from("Submission").update({
      status: dbStatus
    }).eq("id", item.dbId);
    if (error) {
      console.error("Failed to save status:", error);
      setItems((arr) => arr.map((i) => i.id === id ? {
        ...i,
        status: item.status
      } : i));
      setDrawerItem((prev) => prev?.id === id ? {
        ...prev,
        status: item.status
      } : prev);
      alert(`Could not save status: ${error.message}`);
      return;
    }
    supabase.functions.invoke("send-email", {
      body: {
        type: "status-update",
        to: item.email,
        name: item.name,
        referenceId: item.id,
        status: dbStatus
      }
    }).catch(console.error);
  };
  const exportCsv = () => {
    const headers = ["ID", "Type", "Name", "Email", "Position", "Department", "Status", "Submitted"];
    const rows = filtered.map((i) => [i.id, i.type, i.name, i.email, i.position, i.department, i.status, i.submittedAt]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], {
      type: "text/csv"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employee-submissions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold uppercase tracking-[0.18em] text-primary", children: "HR Dashboard" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl", children: "Employee submissions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Review onboarding forms, update status, and export reports." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: exportCsv, className: "inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium transition-colors hover:bg-secondary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }),
        " Export CSV"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: UsersRound, label: "Total submissions", value: counts.total, tone: "primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: Clock, label: "Pending review", value: counts.pending, tone: "warning" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: CircleCheck, label: "Approved", value: counts.approved, tone: "success" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: UserCheck, label: "Joined", value: counts.joined, tone: "accent" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 min-w-[220px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: query, onChange: (e) => setQuery(e.target.value), placeholder: "Search by name, email, or reference…", className: "h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm placeholder:text-muted-foreground/70 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: ["All", "Pending", "Approved", "Joined", "Rejected"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setStatus(s), className: `rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${status === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"}`, children: s }, s)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-soft", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-medium", children: "Reference" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-medium", children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-medium", children: "Role / Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-medium", children: "Submitted" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-medium", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-medium", children: "Details" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
        filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "px-4 py-12 text-center text-sm text-muted-foreground", children: "No submissions match your filters." }) }),
        filtered.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: `border-t border-border transition-colors hover:bg-muted/30 cursor-pointer ${drawerItem?.id === i.id ? "bg-muted/40" : ""}`, onClick: () => setDrawerItem(i), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-xs text-muted-foreground", children: i.id }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${i.type === "pre-joining" ? "bg-primary-soft text-primary" : "bg-accent/15 text-accent"}`, children: i.type })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-foreground", children: i.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: i.email })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-foreground", children: i.position }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: i.department })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: new Date(i.submittedAt).toLocaleDateString(void 0, {
            day: "numeric",
            month: "short",
            year: "numeric"
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusMenu, { current: i.status, onChange: (s) => updateStatus(i.id, s) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setDrawerItem(i), className: `inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${drawerItem?.id === i.id ? "border-primary/30 bg-primary-soft text-primary" : "border-border bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }),
            "View"
          ] }) })
        ] }, i.id))
      ] })
    ] }) }) }),
    drawerItem && /* @__PURE__ */ jsxRuntimeExports.jsx(SubmissionDrawer, { item: drawerItem, onClose: () => setDrawerItem(null), onStatusChange: updateStatus })
  ] });
}
function StatCard({
  icon: Icon,
  label,
  value,
  tone
}) {
  const tones = {
    primary: "bg-primary-soft text-primary",
    warning: "bg-warning/20 text-warning-foreground",
    success: "bg-success/15 text-success",
    accent: "bg-accent/15 text-accent"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-5 shadow-soft", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium uppercase tracking-wider text-muted-foreground", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `grid h-8 w-8 place-items-center rounded-md ${tones[tone]}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 font-display text-3xl font-semibold tracking-tight", children: value })
  ] });
}
function StatusMenu({
  current,
  onChange
}) {
  const styles = {
    Pending: "bg-warning/20 text-warning-foreground",
    Approved: "bg-success/15 text-success",
    Joined: "bg-primary-soft text-primary",
    Rejected: "bg-destructive/15 text-destructive"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: current, onChange: (e) => onChange(e.target.value), className: `inline-flex cursor-pointer items-center gap-1 rounded-full border-0 px-3 py-1 pr-7 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring/30 ${styles[current]}`, children: ["Pending", "Approved", "Joined", "Rejected"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s, children: s }, s)) });
}
export {
  Admin as component
};
