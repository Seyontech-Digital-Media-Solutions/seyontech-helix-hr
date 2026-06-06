import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Download, Search, Users2, CheckCircle2, Clock, UserCheck } from "lucide-react";
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

// UI display values (Title case)
type Status = "Pending" | "Approved" | "Joined" | "Rejected";

// Supabase ENUM values (UPPERCASE) — must match exactly
type DbStatus = "PENDING" | "APPROVED" | "JOINED" | "REJECTED";

interface Submission {
  id: string;       // referenceId for display
  dbId: string;     // real Supabase UUID for updates
  type: "pre-joining" | "post-joining";
  name: string;
  email: string;
  position: string;
  department: string;
  status: Status;
  submittedAt: string;
  isSeeded?: boolean;
}

// Convert Supabase UPPERCASE → UI Title case
const dbToUi: Record<DbStatus, Status> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  JOINED: "Joined",
  REJECTED: "Rejected",
};

// Convert UI Title case → Supabase UPPERCASE
const uiToDb: Record<Status, DbStatus> = {
  Pending: "PENDING",
  Approved: "APPROVED",
  Joined: "JOINED",
  Rejected: "REJECTED",
};

// Only shown if Supabase returns zero rows
const SEED: Submission[] = [
  { id: "PRE-A8X29F1", dbId: "", type: "pre-joining", name: "Aarav Mehta", email: "aarav@example.com", position: "Senior Engineer", department: "Engineering", status: "Approved", submittedAt: "2026-05-22T10:14:00Z", isSeeded: true },
  { id: "PRE-B91KE22", dbId: "", type: "pre-joining", name: "Priya Iyer", email: "priya.i@example.com", position: "Product Designer", department: "Design", status: "Pending", submittedAt: "2026-05-24T08:02:00Z", isSeeded: true },
  { id: "PRE-C77NQ4Z", dbId: "", type: "pre-joining", name: "Liam Carter", email: "liam@example.com", position: "Sales Lead", department: "Sales", status: "Rejected", submittedAt: "2026-05-21T16:48:00Z", isSeeded: true },
  { id: "POST-D14MZ7P", dbId: "", type: "post-joining", name: "EMP-58231", email: "rhea@helix.hr", position: "Full-time", department: "Bangalore", status: "Joined", submittedAt: "2026-05-19T09:30:00Z", isSeeded: true },
  { id: "POST-E22LP3Q", dbId: "", type: "post-joining", name: "EMP-58244", email: "noah@helix.hr", position: "Full-time", department: "Remote", status: "Joined", submittedAt: "2026-05-18T11:11:00Z", isSeeded: true },
];

function Admin() {
  const [items, setItems] = useState<Submission[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status | "All">("All");

  useEffect(() => {
    const fetchSubmissions = async () => {
      const { data, error } = await supabase
        .from("Submission")
        .select("id, referenceId, type, applicantName, email, position, department, status, createdAt")
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("Fetch error:", error);
        setItems(SEED);
        return;
      }

      const mapped: Submission[] = (data ?? []).map((s) => ({
        id: s.referenceId ?? s.id,
        dbId: s.id,                                          // real UUID for DB updates
        type: s.type === "PRE_JOINING" ? "pre-joining" : "post-joining",
        name: s.applicantName ?? "",
        email: s.email ?? "",
        position: s.position ?? "",
        department: s.department ?? "",
        status: dbToUi[s.status as DbStatus] ?? "Pending",  // UPPERCASE → Title case
        submittedAt: s.createdAt,
      }));

      // Only show seed if DB is empty
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

  // ✅ Persists status to Supabase with correct UPPERCASE enum value
  const updateStatus = async (id: string, newStatus: Status) => {
    // 1. Optimistic UI update
    setItems((arr) => arr.map((i) => (i.id === id ? { ...i, status: newStatus } : i)));

    const item = items.find((i) => i.id === id);
    if (!item || item.isSeeded) return; // skip seed rows

    // 2. Convert UI "Approved" → DB "APPROVED" before saving
    const dbStatus = uiToDb[newStatus];

    const { error } = await supabase
      .from("Submission")
      .update({ status: dbStatus })
      .eq("id", item.dbId);

    if (error) {
      console.error("Failed to save status:", error);
      // 3. Revert on failure
      setItems((arr) => arr.map((i) => (i.id === id ? { ...i, status: item.status } : i)));
      alert(`Could not save status: ${error.message}`);
    }
  };

  const exportCsv = () => {
    const headers = ["ID", "Type", "Name", "Email", "Position", "Department", "Status", "Submitted"];
    const rows = filtered.map((i) => [i.id, i.type, i.name, i.email, i.position, i.department, i.status, i.submittedAt]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "employee-submissions.csv"; a.click();
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
        <button
          onClick={exportCsv}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium transition-colors hover:bg-secondary"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Stat cards */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users2} label="Total submissions" value={counts.total} tone="primary" />
        <StatCard icon={Clock} label="Pending review" value={counts.pending} tone="warning" />
        <StatCard icon={CheckCircle2} label="Approved" value={counts.approved} tone="success" />
        <StatCard icon={UserCheck} label="Joined" value={counts.joined} tone="accent" />
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, or reference…"
            className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm placeholder:text-muted-foreground/70 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["All", "Pending", "Approved", "Joined", "Rejected"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                status === s
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
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
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">No submissions match your filters.</td></tr>
              )}
              {filtered.map((i) => (
                <tr key={i.id} className="border-t border-border transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs text-muted-foreground">{i.id}</div>
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                      i.type === "pre-joining" ? "bg-primary-soft text-primary" : "bg-accent/15 text-accent"
                    }`}>{i.type}</span>
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
                  <td className="px-4 py-3">
                    <StatusMenu current={i.status} onChange={(s) => updateStatus(i.id, s)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; tone: "primary" | "warning" | "success" | "accent" }) {
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