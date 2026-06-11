import { Q as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { b as createRouter, a as createRootRouteWithContext, d as useRouter, L as Link, e as useRouterState, O as Outlet, H as HeadContent, S as Scripts, c as createFileRoute, l as lazyRouteComponent } from "../_libs/tanstack__react-router.mjs";
import { I as redirect } from "../_libs/tanstack__router-core.mjs";
import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { c as createClient } from "../_libs/supabase__supabase-js.mjs";
import { l as LogOut, q as Sun, m as Moon } from "../_libs/lucide-react.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
const appCss = "/assets/styles-D6Kc0a1p.css";
const KEY = "ho_theme";
function useTheme() {
  const [theme, setTheme] = reactExports.useState("light");
  const [mounted, setMounted] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const saved = localStorage.getItem(KEY);
    const nextTheme = saved ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(nextTheme);
    setMounted(true);
  }, []);
  reactExports.useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem(KEY, theme);
  }, [mounted, theme]);
  return { theme, toggle: () => setTheme((t) => t === "dark" ? "light" : "dark") };
}
const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  EMPLOYEE: "employee",
  VIEWER: "viewer"
};
const PERMISSIONS = {
  // User Management
  USER_MANAGE: "user:manage",
  USER_VIEW: "user:view",
  // Submission Management
  SUBMISSION_CREATE: "submission:create",
  SUBMISSION_READ: "submission:read",
  SUBMISSION_UPDATE: "submission:update",
  SUBMISSION_DELETE: "submission:delete",
  SUBMISSION_APPROVE: "submission:approve",
  SUBMISSION_REJECT: "submission:reject",
  // Report & Analytics
  REPORT_VIEW: "report:view",
  REPORT_EXPORT: "report:export",
  // Admin Access
  ADMIN_ACCESS: "admin:access",
  SYSTEM_CONFIG: "system:config"
};
const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.ADMIN_ACCESS,
    PERMISSIONS.SYSTEM_CONFIG,
    PERMISSIONS.USER_MANAGE,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.SUBMISSION_CREATE,
    PERMISSIONS.SUBMISSION_READ,
    PERMISSIONS.SUBMISSION_UPDATE,
    PERMISSIONS.SUBMISSION_DELETE,
    PERMISSIONS.SUBMISSION_APPROVE,
    PERMISSIONS.SUBMISSION_REJECT,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_EXPORT
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.SUBMISSION_CREATE,
    PERMISSIONS.SUBMISSION_READ,
    PERMISSIONS.SUBMISSION_UPDATE,
    PERMISSIONS.SUBMISSION_APPROVE,
    PERMISSIONS.SUBMISSION_REJECT,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_EXPORT
  ],
  [ROLES.EMPLOYEE]: [
    PERMISSIONS.SUBMISSION_CREATE,
    PERMISSIONS.SUBMISSION_READ,
    PERMISSIONS.SUBMISSION_UPDATE
  ],
  [ROLES.VIEWER]: [
    PERMISSIONS.SUBMISSION_READ,
    PERMISSIONS.REPORT_VIEW
  ]
};
function getRolePermissions(role) {
  if (!role) return [];
  return ROLE_PERMISSIONS[role] || [];
}
const supabaseUrl = "https://nawrzdyjtafcbjczjejh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hd3J6ZHlqdGFmY2JqY3pqZWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyOTU5NjYsImV4cCI6MjA5NTg3MTk2Nn0.Cvb_mspR37AT9N3iD77h00b0LDk0ecF37saz5kjRx_c";
const isSupabaseConfigured = Boolean(supabaseUrl) && Boolean(supabaseKey);
const supabaseConfigMessage = "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.";
const supabase = createClient(supabaseUrl, supabaseKey);
async function getMyProfile() {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (!userId) return null;
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) {
    console.error("[supabase] getMyProfile error:", error.message);
    return null;
  }
  return data;
}
async function getMyRole() {
  const profile = await getMyProfile();
  return profile?.role ?? null;
}
const AuthContext = reactExports.createContext(null);
function AuthProvider({ children }) {
  const [session, setSession] = reactExports.useState(null);
  const [profile, setProfile] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const loadProfile = async () => {
    const p = await getMyProfile();
    setProfile(p);
  };
  reactExports.useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s);
      if (s) await loadProfile();
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        setSession(s);
        if (s) {
          await loadProfile();
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );
    return () => subscription.unsubscribe();
  }, []);
  const refresh = async () => {
    await loadProfile();
  };
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Sign out error:", e);
    } finally {
      setSession(null);
      setProfile(null);
      setTimeout(() => {
        window.location.href = "/login";
      }, 100);
    }
  };
  const role = profile?.role ?? null;
  const permissions = role ? getRolePermissions(role) : [];
  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };
  const hasAnyPermission = (perms) => {
    return perms.some((p) => permissions.includes(p));
  };
  const hasAllPermissions = (perms) => {
    return perms.every((p) => permissions.includes(p));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    AuthContext.Provider,
    {
      value: {
        session,
        user: session?.user ?? null,
        profile,
        role,
        permissions,
        loading,
        isAdmin: role === "admin",
        isManager: role === "manager",
        isEmployee: role === "employee",
        isViewer: role === "viewer",
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        refresh,
        signOut
      },
      children
    }
  );
}
function useAuth() {
  const ctx = reactExports.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
function SiteHeader() {
  const { theme, toggle } = useTheme();
  const { user, role, loading, signOut } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const userLinks = [
    { to: "/", label: "Home" },
    { to: "/pre-joining", label: "Pre-Joining" },
    { to: "/post-joining", label: "Post-Joining" }
  ];
  const adminLinks = [
    { to: "/admin", label: "Admin" }
  ];
  const links = loading || !user ? [] : role === "admin" ? adminLinks : userLinks;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Link,
      {
        to: role === "admin" ? "/admin" : "/",
        className: "flex items-center gap-3 group",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative flex h-12 w-36 items-center py-1 pr-2 transition-transform group-hover:scale-105", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: "/seyon-logo.png",
                alt: "Seyon Technology Digital Solutions logo",
                className: "max-h-39 w-full object-contain object-left dark:hidden"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: "/seyon-logo-dark.png",
                alt: "Seyon Technology Digital Solutions logo",
                className: "hidden max-h-39 w-full object-contain object-left dark:block"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "leading-tight", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-base font-semibold tracking-tight", children: "Helix HR" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-[0.18em] text-muted-foreground", children: "Onboarding Suite" })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "hidden items-center gap-1 md:flex", children: links.map((l) => {
      const active = path === l.to;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: l.to,
          className: `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${active ? "bg-primary-soft text-primary" : "text-muted-foreground hover:text-foreground"}`,
          children: l.label
        },
        l.to
      );
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      user ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: signOut,
          "aria-label": "Sign out",
          className: "inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4" }),
            "Sign out"
          ]
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/login",
          className: "inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Login"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: toggle,
          "aria-label": "Toggle theme",
          className: "grid h-9 w-9 place-items-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:text-foreground",
          children: theme === "dark" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { className: "h-4 w-4" })
        }
      )
    ] })
  ] }) });
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$a = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovable App" },
      {
        name: "description",
        content: "Welcome Portal is a modern, professional employee onboarding system for collecting pre- and post-joining data."
      },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      {
        property: "og:description",
        content: "Welcome Portal is a modern, professional employee onboarding system for collecting pre- and post-joining data."
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Lovable App" },
      {
        name: "twitter:description",
        content: "Welcome Portal is a modern, professional employee onboarding system for collecting pre- and post-joining data."
      },
      {
        property: "og:image",
        content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/480d1836-4a2d-4b6f-a5cc-483d057ec73c/id-preview-d45590f9--75e3d4dd-ca5f-4c62-8e36-6d2370187ef8.lovable.app-1779964057604.png"
      },
      {
        name: "twitter:image",
        content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/480d1836-4a2d-4b6f-a5cc-483d057ec73c/id-preview-d45590f9--75e3d4dd-ca5f-4c62-8e36-6d2370187ef8.lovable.app-1779964057604.png"
      }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap"
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$a.useRouteContext();
  const path = useRouterState({ select: (state) => state.location.pathname });
  const hideHeader = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/auth/callback"
  ].includes(path) || path.startsWith("/status/");
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AuthProvider, { children: [
    !hideHeader && /* @__PURE__ */ jsxRuntimeExports.jsx(SiteHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: hideHeader ? "min-h-screen" : "min-h-[calc(100vh-4rem)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) })
  ] }) });
}
async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
async function requireGuest() {
  const session = await getSession();
  if (!session) return;
  const role = await getMyRole();
  throw redirect({ to: role === "admin" ? "/admin" : "/" });
}
const $$splitComponentImporter$9 = () => import("./signup-CrRcaa_S.mjs");
const Route$9 = createFileRoute("/signup")({
  head: () => ({
    meta: [{
      title: "Create Account - Seyon Onboarding"
    }]
  }),
  beforeLoad: requireGuest,
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./reset-password-CxaR0ECt.mjs");
const Route$8 = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{
      title: "Reset Password - Seyon Onboarding"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./pre-joining-q1aFgo_L.mjs");
const Route$7 = createFileRoute("/pre-joining")({
  head: () => ({
    meta: [{
      title: "Pre-Joining Form — Helix HR"
    }, {
      name: "description",
      content: "Submit your personal, professional, banking and document information before joining."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./post-joining-BjgU2Vta.mjs");
const Route$6 = createFileRoute("/post-joining")({
  head: () => ({
    meta: [{
      title: "Post-Joining Form — Helix HR"
    }, {
      name: "description",
      content: "Complete employment, payroll, and asset allocation details after joining."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./login-Bps4bl6m.mjs");
const Route$5 = createFileRoute("/login")({
  head: () => ({
    meta: [{
      title: "Login - Seyon Onboarding"
    }]
  }),
  beforeLoad: requireGuest,
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./forgot-password-BJMLJ-FV.mjs");
const Route$4 = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [{
      title: "Forgot Password - Seyon Onboarding"
    }]
  }),
  beforeLoad: requireGuest,
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./admin-CiHCABb4.mjs");
const Route$3 = createFileRoute("/admin")({
  head: () => ({
    meta: [{
      title: "HR Dashboard — Helix HR"
    }, {
      name: "description",
      content: "Review onboarding submissions, filter by status, and export employee records."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./index-qgwwgCnq.mjs");
const Route$2 = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "Helix HR — Modern Employee Onboarding"
    }, {
      name: "description",
      content: "A premium onboarding portal for pre-joining and post-joining employee data, with HR admin tools."
    }, {
      property: "og:title",
      content: "Helix HR — Modern Employee Onboarding"
    }, {
      property: "og:description",
      content: "Premium onboarding portal for pre-joining and post-joining employee data."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./status._referenceId-Cq2xA4oM.mjs");
const Route$1 = createFileRoute("/status/$referenceId")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./auth.callback-DwV-UCU7.mjs");
const Route = createFileRoute("/auth/callback")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const SignupRoute = Route$9.update({
  id: "/signup",
  path: "/signup",
  getParentRoute: () => Route$a
});
const ResetPasswordRoute = Route$8.update({
  id: "/reset-password",
  path: "/reset-password",
  getParentRoute: () => Route$a
});
const PreJoiningRoute = Route$7.update({
  id: "/pre-joining",
  path: "/pre-joining",
  getParentRoute: () => Route$a
});
const PostJoiningRoute = Route$6.update({
  id: "/post-joining",
  path: "/post-joining",
  getParentRoute: () => Route$a
});
const LoginRoute = Route$5.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$a
});
const ForgotPasswordRoute = Route$4.update({
  id: "/forgot-password",
  path: "/forgot-password",
  getParentRoute: () => Route$a
});
const AdminRoute = Route$3.update({
  id: "/admin",
  path: "/admin",
  getParentRoute: () => Route$a
});
const IndexRoute = Route$2.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$a
});
const StatusReferenceIdRoute = Route$1.update({
  id: "/status/$referenceId",
  path: "/status/$referenceId",
  getParentRoute: () => Route$a
});
const AuthCallbackRoute = Route.update({
  id: "/auth/callback",
  path: "/auth/callback",
  getParentRoute: () => Route$a
});
const rootRouteChildren = {
  IndexRoute,
  AdminRoute,
  ForgotPasswordRoute,
  LoginRoute,
  PostJoiningRoute,
  PreJoiningRoute,
  ResetPasswordRoute,
  SignupRoute,
  AuthCallbackRoute,
  StatusReferenceIdRoute
};
const routeTree = Route$a._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Route$1 as R,
  supabaseConfigMessage as a,
  getMyRole as g,
  isSupabaseConfigured as i,
  router as r,
  supabase as s,
  useAuth as u
};
