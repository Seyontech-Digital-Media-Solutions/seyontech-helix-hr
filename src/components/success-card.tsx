import { CheckCircle2 } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function SuccessCard({
  title,
  message,
  referenceId,
  primaryHref = "/",
  primaryLabel = "Back to home",
}: {
  title: string;
  message: string;
  referenceId?: string;
  primaryHref?: string;
  primaryLabel?: string;
}) {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-8 text-center shadow-elevated">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success animate-in zoom-in-50 duration-500">
        <CheckCircle2 className="h-9 w-9" strokeWidth={2} />
      </div>
      <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>

      {referenceId && (
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-xs">
          <span className="text-muted-foreground">Reference</span>
          <span className="font-mono font-semibold text-foreground">{referenceId}</span>
        </div>
      )}

      {/* Buttons */}
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        {/* Track Status button — only shown when referenceId exists */}
        {referenceId && (
          <Link
            to="/status/$referenceId"
            params={{ referenceId }}
            className="inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Track your status
          </Link>
        )}

        {/* Back to home button */}
        <Link
          to={primaryHref}
          className="inline-flex h-10 items-center rounded-lg border border-border bg-card px-5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          {primaryLabel}
        </Link>
      </div>
    </div>
  );
}
