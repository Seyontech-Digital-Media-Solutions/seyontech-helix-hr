# Seyon Auth — Dual Role System (Admin + User)
TanStack Router · TypeScript · Supabase

---

## File map

```
src/
├── lib/
│   ├── supabase-client.ts     ← Supabase singleton + typed helpers
│   ├── auth-context.tsx       ← React context: user, role, profile
│   └── route-guards.ts        ← beforeLoad guards (requireAdmin, requireUser …)
│
├── components/
│   └── auth-shell.tsx         ← Shared card wrapper for auth pages
│
├── routes/
│   ├── login.tsx              ← /login  (redirects by role after sign-in)
│   ├── signup.tsx             ← /signup (users only; admins created via SQL)
│   ├── forgot-password.tsx    ← /forgot-password
│   │
│   ├── auth/
│   │   ├── callback.tsx       ← /auth/callback  (OAuth + email confirm)
│   │   └── reset-password.tsx ← /auth/reset-password
│   │
│   ├── admin/
│   │   ├── index.tsx          ← /admin  (layout + sidebar, admin-only)
│   │   └── users.tsx          ← /admin/users  (promote/demote users)
│   │
│   └── user/
│       └── dashboard.tsx      ← /dashboard  (layout + sidebar, user-only)
│
└── main.tsx                   ← Wrap <RouterProvider> with <AuthProvider>

supabase/
└── migration.sql              ← Run once in Supabase SQL Editor
```

---

## Setup — 4 steps

### 1. Run the SQL migration
Supabase Dashboard → SQL Editor → New Query → paste `supabase/migration.sql` → Run

### 2. Environment variables
Your existing `.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Wrap your router with AuthProvider
In `src/main.tsx` (already done in the file above):
```tsx
<AuthProvider>
  <RouterProvider router={router} />
</AuthProvider>
```

### 4. Add Google OAuth redirect URL (if using Google)
Supabase Dashboard → Authentication → URL Configuration →
Add `http://localhost:8080/auth/callback` (and your production URL)

---

## Route guard cheat-sheet

| Guard | Where used | Who gets through | Others sent to |
|---|---|---|---|
| `requireGuest` | `/login`, `/signup` | Unauthenticated | `/admin` or `/dashboard` |
| `requireAuth` | Any protected page | Any logged-in user | `/login` |
| `requireAdmin` | `/admin/*` | `role = admin` | `/dashboard` |
| `requireUser` | `/dashboard/*` | `role = user` | `/admin` |

Usage in any route file:
```ts
export const Route = createFileRoute("/your-path")({
  beforeLoad: requireAdmin, // or requireUser, requireAuth, requireGuest
  component: YourComponent,
});
```

---

## Promote a user to admin
In Supabase SQL Editor:
```sql
update public.profiles set role = 'admin' where email = 'admin@example.com';
```
Or use the `/admin/users` page in the app (promote/demote buttons).

---

## Adding new protected routes

**Admin-only page:**
```tsx
export const Route = createFileRoute("/admin/settings")({
  beforeLoad: requireAdmin,
  component: AdminSettings,
});
```

**User-only page (e.g. application form):**
```tsx
export const Route = createFileRoute("/apply")({
  beforeLoad: requireUser,
  component: ApplyPage,
});
```

**Any logged-in user (both roles):**
```tsx
export const Route = createFileRoute("/profile")({
  beforeLoad: requireAuth,
  component: ProfilePage,
});
```

---

## How role-based redirect works

1. User signs in at `/login`
2. `supabase.auth.signInWithPassword()` succeeds
3. `getMyRole()` reads the `profiles` table → returns `'admin'` or `'user'`
4. `navigate({ to: role === 'admin' ? '/admin' : '/dashboard' })`
5. Each route's `beforeLoad` guard double-checks the role — even if someone types the URL manually
