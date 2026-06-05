import { Link, useRouterState } from "@tanstack/react-router";
import { LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/lib/auth-context";

export function SiteHeader() {
  const { theme, toggle } = useTheme();
  const { user, role, loading, signOut } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });

  // User links — no Admin
  const userLinks = [
    { to: "/",            label: "Home"         },
    { to: "/pre-joining", label: "Pre-Joining"  },
    { to: "/post-joining",label: "Post-Joining" },
  ];

  // Admin links — no Home, Pre-Joining, Post-Joining
  const adminLinks = [
    
    { to: "/admin", label: "Admin" },
  ];

 const links = loading || !user ? [] : role === "admin" ? adminLinks : userLinks;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">

        {/* Logo — admin clicks go to /admin, users go to / */}
        <Link
          to={role === "admin" ? "/admin" : "/"}
          className="flex items-center gap-3 group"
        >
          <span className="relative flex h-12 w-36 items-center py-1 pr-2 transition-transform group-hover:scale-105">
            <img
              src="/seyon-logo.png"
              alt="Seyon Technology Digital Solutions logo"
              className="max-h-39 w-full object-contain object-left dark:hidden"
            />
            <img
              src="/seyon-logo-dark.png"
              alt="Seyon Technology Digital Solutions logo"
              className="hidden max-h-39 w-full object-contain object-left dark:block"
            />
          </span>
          <div className="leading-tight">
            <div className="font-display text-base font-semibold tracking-tight">Helix HR</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Onboarding Suite
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = path === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary-soft text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <button
              onClick={signOut}
              aria-label="Sign out"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          ) : (
            <Link
              to="/login"
              className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Login
            </Link>
          )}
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="grid h-9 w-9 place-items-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}