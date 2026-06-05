import { redirect } from "@tanstack/react-router";
import { supabase, getMyRole } from "@/lib/supabase-client";

// ── Helpers ──────────────────────────────────────────────────────
async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ── Guard: any authenticated user ───────────────────────────────
export async function requireAuth() {
  const session = await getSession();
  if (!session) throw redirect({ to: "/login" });
  return session;
}

// ── Guard: admin only ────────────────────────────────────────────
export async function requireAdmin() {
  const session = await getSession();
  if (!session) throw redirect({ to: "/login" });

  const role = await getMyRole();
  if (role !== "admin") throw redirect({ to: "/" }); // employees get bounced
  return session;
}

// ── Guard: user only (keeps admins out of user portal) ──────────
export async function requireUser() {
  const session = await getSession();
  if (!session) throw redirect({ to: "/login" });

  const role = (await getMyRole()) as string | null;
  if (role !== "user") throw redirect({ to: "/admin" }); // admins go back
  return session;
}

// ── Guard: redirect logged-in users away from /login & /signup ──
export async function requireGuest() {
  const session = await getSession();
  if (!session) return; // not logged in — allow through

  const role = await getMyRole();
  throw redirect({ to: role === "admin" ? "/admin" : "/" });
}