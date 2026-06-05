# Role-Based Authentication - Quick Start Guide

## What Was Implemented

A complete Role-Based Access Control (RBAC) system has been implemented with:

### ✅ Roles (4 types)
- **Admin**: Full access to everything
- **Manager**: Can manage submissions, approve/reject, view reports
- **Employee**: Can create and manage own submissions
- **Viewer**: Read-only access

### ✅ Permissions (12 types)
- User management (manage, view)
- Submission management (create, read, update, delete, approve, reject)
- Reports (view, export)
- Admin access (access, config)

### ✅ Backend
- Role definitions: `server/types/roles.ts`
- Permission middleware: `server/middleware/permissions.ts`
- Updated auth middleware with permissions: `server/middleware/auth.ts`
- Updated types: `server/types.ts`
- Updated Prisma schema with UserRole enum
- Database migration ready

### ✅ Frontend
- Role/permission definitions: `src/lib/role-permissions.ts`
- Permission guards (components): `src/lib/permission-guards.tsx`
- Updated auth context: `src/lib/auth-context.tsx`
- Updated Supabase client: `src/lib/supabase-client.ts`

### ✅ Examples & Documentation
- Backend route examples: `server/routes/rbac-example.ts`
- Frontend component examples: `src/components/rbac-example.tsx`
- Comprehensive guide: `RBAC-GUIDE.md`

## Quick Setup (5 steps)

### 1. Run Database Migration

```bash
npx prisma migrate deploy
```

This creates the UserRole enum and updates the UserProfile table.

### 2. Update Your Routes

Add permission middleware to your API endpoints:

```typescript
import { requirePermission } from "../middleware/permissions";
import { PERMISSIONS } from "../types/roles";

router.post(
  "/submissions",
  requireAuth,
  requirePermission(PERMISSIONS.SUBMISSION_CREATE),
  async (req, res) => {
    // Your route logic
  }
);
```

### 3. Update Your Components

Use permission checks in React components:

```typescript
import { useAuth } from "@/lib/auth-context";
import { PERMISSIONS } from "@/lib/role-permissions";

function MyComponent() {
  const { hasPermission, role, isAdmin } = useAuth();

  return (
    <>
      {hasPermission(PERMISSIONS.SUBMISSION_APPROVE) && (
        <button>Approve</button>
      )}
    </>
  );
}
```

### 4. Assign User Roles

Set user roles in the database:

```sql
UPDATE "UserProfile" 
SET role = 'ADMIN' 
WHERE email = 'admin@example.com';

UPDATE "UserProfile" 
SET role = 'MANAGER' 
WHERE email = 'manager@example.com';
```

Or in your user creation logic:

```typescript
const profile = await prisma.userProfile.create({
  data: {
    supabaseUserId: userId,
    email,
    fullName: name,
    role: "EMPLOYEE", // or other role
  },
});
```

### 5. Test Your Setup

Visit `/auth/me` endpoint to verify permissions are included:

```json
{
  "user": {
    "supabaseUser": { ... },
    "profileId": "...",
    "role": "employee",
    "email": "user@example.com",
    "permissions": [
      "submission:create",
      "submission:read",
      "submission:update"
    ]
  }
}
```

## Usage Examples

### Backend - Protect Route with Permissions

```typescript
import { requirePermission } from "../middleware/permissions";
import { PERMISSIONS } from "../types/roles";

// Require specific permission
router.post(
  "/submissions",
  requireAuth,
  requirePermission(PERMISSIONS.SUBMISSION_CREATE),
  handler
);

// Require any of multiple permissions (OR logic)
router.post(
  "/submissions/:id/approve",
  requireAuth,
  requirePermission(PERMISSIONS.SUBMISSION_APPROVE, PERMISSIONS.SUBMISSION_UPDATE),
  handler
);

// Require specific role
router.get(
  "/admin/stats",
  requireAuth,
  requireRole(ROLES.ADMIN),
  handler
);
```

### Frontend - Show Components Based on Permissions

```typescript
function Dashboard() {
  const { hasPermission, hasAnyPermission, isAdmin } = useAuth();

  return (
    <div>
      {/* Show edit button if user can update */}
      {hasPermission(PERMISSIONS.SUBMISSION_UPDATE) && (
        <button>Edit</button>
      )}

      {/* Show approval panel if user can approve or reject */}
      {hasAnyPermission([
        PERMISSIONS.SUBMISSION_APPROVE,
        PERMISSIONS.SUBMISSION_REJECT
      ]) && (
        <ApprovalPanel />
      )}

      {/* Show admin panel only to admins */}
      {isAdmin && <AdminPanel />}
    </div>
  );
}
```

### Frontend - Using Permission Components

```typescript
import { IfPermission, IfAnyPermission, PermissionButton } from "@/lib/permission-guards";
import { PERMISSIONS } from "@/lib/role-permissions";

<IfPermission role={role} permission={PERMISSIONS.SUBMISSION_UPDATE}>
  <button>Edit</button>
</IfPermission>

<IfAnyPermission role={role} permissions={[PERMISSIONS.SUBMISSION_APPROVE, PERMISSIONS.SUBMISSION_REJECT]}>
  <button>Approve</button>
  <button>Reject</button>
</IfAnyPermission>

<PermissionButton role={role} requiredPermission={PERMISSIONS.REPORT_EXPORT}>
  Export
</PermissionButton>
```

## File Locations

| File | Purpose |
|------|---------|
| `server/types/roles.ts` | Role and permission definitions |
| `server/middleware/permissions.ts` | Permission checking middleware |
| `server/middleware/auth.ts` | Updated authentication (includes permissions) |
| `server/types.ts` | Updated AuthenticatedUser type |
| `src/lib/role-permissions.ts` | Frontend role/permission definitions |
| `src/lib/auth-context.tsx` | Updated auth context with permissions |
| `src/lib/permission-guards.tsx` | Permission UI components |
| `src/lib/supabase-client.ts` | Updated with permission re-exports |
| `RBAC-GUIDE.md` | Comprehensive documentation |
| `server/routes/rbac-example.ts` | Backend usage examples |
| `src/components/rbac-example.tsx` | Frontend usage examples |
| `prisma/migrations/20260604_add_user_roles/` | Database migration |

## Common Tasks

### Add a New Permission

1. Add to `PERMISSIONS` in `server/types/roles.ts` and `src/lib/role-permissions.ts`
2. Update `ROLE_PERMISSIONS` mapping
3. Use in routes/components

### Change Role Permissions

Update `ROLE_PERMISSIONS` in both:
- `server/types/roles.ts`
- `src/lib/role-permissions.ts`

### Check Permissions in Route

```typescript
if (!req.auth?.permissions.includes(PERMISSIONS.SUBMISSION_APPROVE)) {
  return res.status(403).json({ error: "Cannot approve" });
}
```

### Check Permissions in Component

```typescript
const { hasPermission } = useAuth();
const canApprove = hasPermission(PERMISSIONS.SUBMISSION_APPROVE);
```

## Verification Checklist

- [ ] Database migration executed
- [ ] Updated existing routes with permission middleware
- [ ] Updated UI components with permission checks
- [ ] Assigned roles to test users
- [ ] Tested with different role levels
- [ ] Verified `/auth/me` returns permissions
- [ ] Tested permission denial (403 responses)

## Troubleshooting

### "Missing bearer token" error
- Ensure client is sending authorization header
- Check token format: `Bearer <token>`

### "Insufficient permissions" error (403)
- Verify user role in database
- Check permission is in role mapping
- Verify route has correct permission middleware

### Role not updating
- Run `SELECT * FROM "UserProfile" WHERE email = '...';` to check database
- Restart server/client after role change
- Check in `/auth/me` endpoint

## Next Steps

1. ✅ Database migration
2. ✅ Update your API routes
3. ✅ Update your UI components
4. ✅ Assign roles to users
5. ✅ Test all permission levels
6. Consider adding RLS policies for additional data protection

## Support

Refer to comprehensive guides:
- `RBAC-GUIDE.md` - Complete documentation
- `server/routes/rbac-example.ts` - Backend examples
- `src/components/rbac-example.tsx` - Frontend examples
