
import type { ReactNode } from "react";
 
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4 py-10">
      <section className="w-full rounded-lg border border-border bg-card p-6 shadow-soft">
        <div className="mb-6 space-y-1">
          <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {children}
      </section>
    </div>
  );
}

