import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  ClipboardList,
  FileCheck2,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Users2,
} from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Helix HR — Modern Employee Onboarding" },
      {
        name: "description",
        content:
          "A premium onboarding portal for pre-joining and post-joining employee data, with HR admin tools.",
      },
      { property: "og:title", content: "Helix HR — Modern Employee Onboarding" },
      {
        property: "og:description",
        content: "Premium onboarding portal for pre-joining and post-joining employee data.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login", replace: true });
    }
  }, [loading, navigate, user]);

  if (loading || !user) {
    return (
      <div className="grid min-h-[calc(100vh-4rem)] place-items-center px-4 text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-hero-gradient opacity-[0.04]" />
        <div className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-gradient-to-b from-primary-soft/60 to-transparent" />

        <div className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground shadow-soft">
              <Sparkles className="h-3 w-3 text-accent" />
              Enterprise onboarding, reimagined
            </div>
            <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
              Onboard new hires <span className="text-primary">in minutes</span>, not weeks.
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-balance text-base text-muted-foreground sm:text-lg">
              A single portal for pre-joining paperwork, post-joining records, document uploads, and
              HR review — with auto-save, smart validation, and a clean Google Forms-style flow.
            </p>

            {/*<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/pre-joining"
                className="group inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-soft transition-all hover:shadow-elevated"
              >
                Start pre-joining form
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/admin"
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                <LayoutDashboard className="h-4 w-4" />
                Open HR dashboard
              </Link>
              <Link
                to="/post-joining"
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Start post-joining form
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>*/}
          </div>

          {/* Module cards */}
          <div className="mt-16 grid gap-4 md:grid-cols-2 py-1">
            {[
              {
                to: "/pre-joining",
                icon: ClipboardList,
                title: "Pre-Joining Form",
                desc: "Personal, professional, documents, banking & declaration — collected before day one.",
                tag: "For new hires",
              },
              {
                to: "/post-joining",
                icon: FileCheck2,
                title: "Post-Joining Form",
                desc: "Employment, payroll, asset allocation and policy acceptance after joining.",
                tag: "For employees",
              },
            ].map((m) => (
              <Link
                key={m.to}
                to={m.to}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elevated"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <m.icon className="h-5 w-5" />
                </div>
                <div className="mt-5">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {m.tag}
                  </div>
                  <h3 className="mt-1 font-display text-lg font-semibold tracking-tight">
                    {m.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{m.desc}</p>
                </div>
                <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  Open
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>

          {/* Trust strip */}
          <div className="mt-16 rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                {
                  icon: ShieldCheck,
                  title: "Secure by default",
                  desc: "Encrypted document handling and role-aware access.",
                },
                {
                  icon: Sparkles,
                  title: "Auto-save drafts",
                  desc: "Pick up exactly where you left off — across devices.",
                },
                {
                  icon: FileCheck2,
                  title: "Audit-friendly",
                  desc: "Every submission gets a unique reference & timestamp.",
                },
              ].map((f) => (
                <div key={f.title} className="flex gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary-soft text-primary">
                    <f.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{f.title}</div>
                    <div className="text-xs text-muted-foreground">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
