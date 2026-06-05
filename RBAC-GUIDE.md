# Role-Based Access Control (RBAC) Implementation Guide

## Overview

This document provides a comprehensive guide to the new Role-Based Access Control (RBAC) system implemented in StartSmart Forms. The system provides granular permission-based access control for both backend API routes and frontend components.

## Roles and Permissions

### Defined Roles

1. **Admin**: Full system access
2. **Manager**: Can manage users and submissions
3. **Employee**: Can create and manage own submissions
4. **Viewer**: Read-only access

### Permission Categories

#### User Management
- `user:manage` - Create, update, delete users
- `user:view` - View user information

#### Submission Management
- `submission:create` - Create new submissions
- `submission:read` - View submissions
- `submission:update` - Edit submissions
- `submission:delete` - Delete submissions
- `submission:approve` - Approve submissions
- `submission:reject` - Reject submissions

#### Reports & Analytics
- `report:view` - View reports and analytics
- `report:export` - Export reports in various formats

#### System Administration
- `admin:access` - Full admin access
- `system:config` - Modify system configuration

### Role-Permission Mapping

| Role | Permissions |
|------|-------------|
| **Admin** | All permissions (12 total) |
| **Manager** | user:view, submission:*, report:* |
| **Employee** | submission:create, submission:read, submission:update |
| **Viewer** | submission:read, report:view |

## Backend Implementation

### 1. Server Setup

The RBAC system uses three main files:

- `server/types/roles.ts` - Role and permission definitions
- `server/middleware/auth.ts` - Authentication middleware (updated)
- `server/middleware/permissions.ts` - Permission checking middleware

### 2. Using Permission Middleware

#### Check Single Permission

```typescript
import { requirePermission } from "../middleware/permissions";
import { PERMISSIONS } from "../types/roles";

router.post(
  "/submissions",
  requireAuth,
  requirePermission(PERMISSIONS.SUBMISSION_CREATE),
  async (req, res) => {
    // Only users with SUBMISSION_CREATE permission reach here
  }
);
```

#### Check Multiple Permissions (OR logic)

```typescript
router.post(
  "/submissions/:id/approve",
  requireAuth,
  requirePermission(
    PERMISSIONS.SUBMISSION_APPROVE,
    PERMISSIONS.SUBMISSION_UPDATE
  ),
  async (req, res) => {
    // User needs any of these permissions
  }
);
```

#### Check Role

```typescript
import { requireRole } from "../middleware/permissions";
import { ROLES } from "../types/roles";

router.get(
  "/admin/users",
  requireAuth,
  requireRole(ROLES.ADMIN),
  async (req, res) => {
    // Only Admin role
  }
);
```

#### Multiple Roles

```typescript
router.get(
  "/reports",
  requireAuth,
  requireRole(ROLES.ADMIN, ROLES.MANAGER),
  async (req, res) => {
    // Only Admin or Manager
  }
);
```

### 3. In-Route Permission Checks

Check permissions directly in your route handler:

```typescript
router.get("/submissions", requireAuth, async (req, res) => {
  if (!req.auth?.permissions.includes(PERMISSIONS.SUBMISSION_READ)) {
    return res.status(403).json({ error: "Cannot read submissions" });
  }

  // Use role for data filtering
  let query = {};
  if (req.auth.role === ROLES.EMPLOYEE) {
    query = { submittedById: req.auth.profileId };
  }

  // Fetch submissions...
});
```

### 4. Available in Request Context

After `requireAuth` middleware, the following are available in `req.auth`:

```typescript
req.auth = {
  supabaseUser: User,      // Supabase user object
  profileId: string,       // Database profile ID
  role: Role,              // "admin" | "manager" | "employee" | "viewer"
  email: string,           // User email
  permissions: Permission[] // Array of permission strings
};
```

## Frontend Implementation

### 1. Using useAuth Hook

```typescript
import { useAuth } from "@/lib/auth-context";
import { PERMISSIONS } from "@/lib/role-permissions";

function MyComponent() {
  const { 
    role, 
    permissions,
    isAdmin, 
    isManager,
    isEmployee,
    isViewer,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  } = useAuth();

  // Use in your component
}
```

### 2. Permission Checking Methods

#### Check Single Permission

```typescript
const { hasPermission } = useAuth();

if (hasPermission(PERMISSIONS.SUBMISSION_DELETE)) {
  // Show delete button
}
```

#### Check Any Permission (OR logic)

```typescript
const { hasAnyPermission } = useAuth();

if (hasAnyPermission([
  PERMISSIONS.SUBMISSION_APPROVE,
  PERMISSIONS.SUBMISSION_REJECT
])) {
  // Show approval buttons
}
```

#### Check All Permissions (AND logic)

```typescript
const { hasAllPermissions } = useAuth();

if (hasAllPermissions([
  PERMISSIONS.SUBMISSION_UPDATE,
  PERMISSIONS.ADMIN_ACCESS
])) {
  // Show advanced editing interface
}
```

### 3. Using Permission Guards

#### IfPermission Component

```typescript
import { IfPermission } from "@/lib/permission-guards";

<IfPermission role={role} permission={PERMISSIONS.SUBMISSION_UPDATE}>
  <button>Edit Submission</button>
</IfPermission>
```

#### IfAnyPermission Component

```typescript
import { IfAnyPermission } from "@/lib/permission-guards";

<IfAnyPermission 
  role={role} 
  permissions={[PERMISSIONS.SUBMISSION_APPROVE, PERMISSIONS.SUBMISSION_REJECT]}
>
  <button>Approve</button>
  <button>Reject</button>
</IfAnyPermission>
```

#### IfAllPermissions Component

```typescript
import { IfAllPermissions } from "@/lib/permission-guards";

<IfAllPermissions
  role={role}
  permissions={[PERMISSIONS.SUBMISSION_DELETE, PERMISSIONS.ADMIN_ACCESS]}
>
  <button className="text-red-600">Delete</button>
</IfAllPermissions>
```

#### PermissionButton Component

```typescript
import { PermissionButton } from "@/lib/permission-guards";

<PermissionButton
  role={role}
  requiredPermission={PERMISSIONS.REPORT_EXPORT}
  onClick={handleExport}
  className="px-4 py-2 bg-blue-500 text-white"
>
  Export Report
</PermissionButton>
```

### 4. Custom Permission Hooks

Create reusable permission checks:

```typescript
// src/lib/permission-hooks.ts
export function useCanManageUsers() {
  const { hasPermission } = useAuth();
  return hasPermission(PERMISSIONS.USER_MANAGE);
}

export function useCanApproveSubmissions() {
  const { hasAnyPermission } = useAuth();
  return hasAnyPermission([
    PERMISSIONS.SUBMISSION_APPROVE,
    PERMISSIONS.SUBMISSION_REJECT,
  ]);
}

export function useCanViewReports() {
  const { hasPermission } = useAuth();
  return hasPermission(PERMISSIONS.REPORT_VIEW);
}

// Usage in components
function Dashboard() {
  const canApprove = useCanApproveSubmissions();
  const canViewReports = useCanViewReports();
  
  return (
    <>
      {canApprove && <ApprovalPanel />}
      {canViewReports && <ReportsSection />}
    </>
  );
}
```

## Database Schema

### UserRole Enum

The Prisma schema now includes a `UserRole` enum:

```prisma
enum UserRole {
  ADMIN
  MANAGER
  EMPLOYEE
  VIEWER
}

model UserProfile {
  id             String    @id @default(uuid()) @db.Uuid
  supabaseUserId String    @unique @db.Uuid
  email          String    @unique
  fullName       String?
  role           UserRole  @default(EMPLOYEE)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  submissions    Submission[]
}
```

### Migration

A migration file has been created at:
```
prisma/migrations/20260604_add_user_roles/migration.sql
```

Run the migration with:
```bash
npx prisma migrate deploy
```

## Best Practices

### 1. Backend Route Protection

Always use middleware to protect sensitive routes:

```typescript
// ✅ Good: Permission middleware on route
router.post(
  "/submissions",
  requireAuth,
  requirePermission(PERMISSIONS.SUBMISSION_CREATE),
  handler
);

// ❌ Bad: Manual permission check in handler
router.post("/submissions", requireAuth, handler); // Needs permission check inside
```

### 2. Frontend Permission Checks

Combine role-based UI with permission checks:

```typescript
// ✅ Good: Multiple layers of permission
<IfPermission role={role} permission={PERMISSIONS.SUBMISSION_DELETE}>
  <button onClick={deleteSubmission} disabled={isDeleting}>
    Delete
  </button>
</IfPermission>

// ❌ Bad: Only hiding the button (still accessible via API)
{hasPermission && <button>Delete</button>}
// Backend MUST also validate permission
```

### 3. Data Filtering by Role

Apply role-based data filtering on the backend:

```typescript
// ✅ Good: Different query based on role
if (req.auth.role === ROLES.EMPLOYEE) {
  submissions = submissions.filter(
    s => s.submittedById === req.auth.profileId
  );
}

// ❌ Bad: Trusting frontend to send correct data
const userId = req.body.userId; // User could modify this
```

### 4. Permission Organization

Group related permissions:

```typescript
// ✅ Good: Clear naming convention
PERMISSIONS.SUBMISSION_CREATE
PERMISSIONS.SUBMISSION_READ
PERMISSIONS.SUBMISSION_UPDATE
PERMISSIONS.SUBMISSION_DELETE
PERMISSIONS.SUBMISSION_APPROVE

// ❌ Bad: Unclear naming
PERMISSIONS.CREATE_SUB
PERMISSIONS.CAN_READ
PERMISSIONS.UPDATE_S
```

## Examples

### Example 1: Protect API Route

```typescript
// server/routes/submissions.ts
router.get(
  "/",
  requireAuth,
  requirePermission(PERMISSIONS.SUBMISSION_READ),
  async (req, res) => {
    // Only users with SUBMISSION_READ permission
    const submissions = await prisma.submission.findMany({
      where: {
        submittedById: req.auth?.profileId,
      },
    });
    res.json(submissions);
  }
);
```

### Example 2: Role-Based UI

```typescript
// src/components/SubmissionCard.tsx
export function SubmissionCard({ submission }) {
  const { hasPermission, isManager } = useAuth();

  return (
    <div className="card">
      <h3>{submission.applicantName}</h3>
      
      <IfPermission role={role} permission={PERMISSIONS.SUBMISSION_UPDATE}>
        <button>Edit</button>
      </IfPermission>

      {isManager && (
        <div className="approval-section">
          <button>Approve</button>
          <button>Reject</button>
        </div>
      )}
    </div>
  );
}
```

### Example 3: Protected Admin Page

```typescript
// src/routes/admin.tsx
import { IfPermission } from "@/lib/permission-guards";
import { PERMISSIONS } from "@/lib/role-permissions";

export function AdminPage() {
  const { role } = useAuth();

  return (
    <IfPermission role={role} permission={PERMISSIONS.ADMIN_ACCESS}>
      <div>
        <h1>Admin Dashboard</h1>
        <UserManagement />
        <SystemConfig />
      </div>
    </IfPermission>
  );
}
```

## Troubleshooting

### Issue: Permission not found

**Solution:** Import `PERMISSIONS` from the correct location:
- Backend: `server/types/roles`
- Frontend: `@/lib/role-permissions` or `@/lib/supabase-client`

### Issue: Role mismatch between frontend and backend

**Solution:** Both use the same `ROLES` and `PERMISSIONS` definitions. Keep them in sync.

### Issue: User not getting expected permissions

**Solution:** 
1. Check user role in database: `SELECT email, role FROM "UserProfile"`
2. Verify role is returned correctly in `/auth/me` endpoint
3. Check `getRolePermissions()` returns expected permissions

## File Structure

```
server/
├── types/
│   └── roles.ts                 # Role and permission definitions
├── middleware/
│   ├── auth.ts                 # Authentication (updated)
│   └── permissions.ts          # Permission checking
└── routes/
    └── rbac-example.ts         # Usage examples

src/
├── lib/
│   ├── auth-context.tsx        # Updated with permissions
│   ├── role-permissions.ts     # Frontend role/permission definitions
│   ├── permission-guards.tsx   # Permission UI components
│   └── supabase-client.ts      # Updated with exports
├── components/
│   └── rbac-example.tsx        # Usage examples
└── routes/
    └── admin.tsx               # Example: admin route
```

## Next Steps

1. Run the database migration
2. Update your existing routes to use permission middleware
3. Update your components to use permission guards
4. Test the system thoroughly
5. Assign roles to your users in the database

## Support

For questions or issues, refer to:
- Backend: `server/routes/rbac-example.ts`
- Frontend: `src/components/rbac-example.tsx`
- Types: `server/types/roles.ts` and `src/lib/role-permissions.ts`
