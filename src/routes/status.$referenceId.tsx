import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client.ts";
import { CheckCircle2, Clock, XCircle, UserCheck, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/status/$referenceId")({
  component: StatusPage,
});

type Status = "PENDING" | "APPROVED" | "JOINED" | "REJECTED";

interface Submission {
  referenceId: string;
  applicantName: string;
  email: string;
  status: Status;
  createdAt: string;
  type: string;
}

const statusConfig: Record<Status, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  message: string;
}> = {
  PENDING: {
    label: "Pending Review",
    icon: Clock,
    color: "text-warning-foreground",
    bg: "bg-warning/20",
    message: "Your submission is under review. HR will update you shortly.",
  },
  APPROVED: {
    label: "Approved",
    icon: CheckCircle2,
    color: "text-success",
    bg: "bg-success/15",
    message: "Congratulations! Your submission has been approved. HR will contact you with next steps.",
  },
  JOINED: {
    label: "Joined",
    icon: UserCheck,
    color: "text-primary",
    bg: "bg-primary-soft",
    message: "Welcome to the team! Your onboarding is complete.",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/15",
    message: "Unfortunately your submission was not approved. Please contact HR for more details.",
  },
};

function StatusPage() {
  const { referenceId } = Route.useParams();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      const { data, error } = await supabase
        .from("Submission")
        .select("referenceId, applicantName, email, status, createdAt, type")
        .eq("referenceId", referenceId)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setSubmission(data);
      }
      setLoading(false);
    };

    fetchStatus();
  }, [referenceId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="text-sm text-muted-foreground">Loading your status...</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="text-sm text-destructive">
          Reference ID not found. Please check and try again.
        </div>
        <Link to="/" className="mt-4 inline-flex items-center gap-2 text-sm text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
      </div>
    );
  }

  const config = statusConfig[submission!.status];
  const Icon = config.icon;

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-soft text-center space-y-6">

        {/* Status Icon */}
        <div className={`mx-auto grid h-16 w-16 place-items-center rounded-full ${config.bg}`}>
          <Icon className={`h-8 w-8 ${config.color}`} />
        </div>

        {/* Status Label */}
        <div>
          <div className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${config.bg} ${config.color}`}>
            {config.label}
          </div>
          <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight">
            Application Status
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{config.message}</p>
        </div>

        {/* Details */}
        <div className="rounded-lg border border-border bg-muted/30 text-left divide-y divide-border">
          <div className="flex justify-between px-4 py-2.5 text-sm">
            <span className="text-muted-foreground">Reference ID</span>
            <span className="font-mono font-medium">{submission!.referenceId}</span>
          </div>
          <div className="flex justify-between px-4 py-2.5 text-sm">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{submission!.applicantName}</span>
          </div>
          <div className="flex justify-between px-4 py-2.5 text-sm">
            <span className="text-muted-foreground">Type</span>
            <span className="font-medium capitalize">
              {submission!.type === "PRE_JOINING" ? "Pre-Joining" : "Post-Joining"}
            </span>
          </div>
          <div className="flex justify-between px-4 py-2.5 text-sm">
            <span className="text-muted-foreground">Submitted</span>
            <span className="font-medium">
              {new Date(submission!.createdAt).toLocaleDateString(undefined, {
                day: "numeric", month: "short", year: "numeric"
              })}
            </span>
          </div>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
      </div>
    </div>
  );
}