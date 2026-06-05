// ── Example: How to use Role-Based Access Control in React Components ──
// This file demonstrates best practices for implementing RBAC in your UI

import { useAuth } from "@/lib/auth-context";
import { IfPermission, IfAnyPermission, IfAllPermissions, PermissionButton } from "@/lib/permission-guards";
import { PERMISSIONS } from "@/lib/role-permissions";

export function SubmissionManagementExample() {
  const { role, permissions, hasPermission, hasAnyPermission, isAdmin, isManager } = useAuth();

  return (
    <div className="space-y-6">
      {/* ── Example 1: Show content based on exact role ──────── */}
      <section>
        <h2>Admin-Only Section</h2>
        {isAdmin && <div>This section is only visible to admins</div>}
      </section>

      {/* ── Example 2: Check permission with hasPermission hook – */}
      <section>
        <h2>Create Submission</h2>
        {hasPermission(PERMISSIONS.SUBMISSION_CREATE) ? (
          <button>Create New Submission</button>
        ) : (
          <p>You don't have permission to create submissions</p>
        )}
      </section>

      {/* ── Example 3: Using IfPermission component ──────────── */}
      <section>
        <h2>Submission Details</h2>
        <IfPermission role={role} permission={PERMISSIONS.SUBMISSION_UPDATE}>
          <button>Edit Submission</button>
        </IfPermission>
      </section>

      {/* ── Example 4: Using IfAnyPermission for OR logic ──────– */}
      <section>
        <h2>Review Submissions</h2>
        <IfAnyPermission
          role={role}
          permissions={[PERMISSIONS.SUBMISSION_APPROVE, PERMISSIONS.SUBMISSION_REJECT]}
        >
          <div className="space-y-2">
            <button>Approve</button>
            <button>Reject</button>
          </div>
        </IfAnyPermission>
      </section>

      {/* ── Example 5: Using IfAllPermissions for AND logic ──── */}
      <section>
        <h2>Delete Submission</h2>
        <IfAllPermissions
          role={role}
          permissions={[PERMISSIONS.SUBMISSION_DELETE, PERMISSIONS.ADMIN_ACCESS]}
        >
          <button className="text-red-600">Delete</button>
        </IfAllPermissions>
      </section>

      {/* ── Example 6: Using PermissionButton component ──────── */}
      <section>
        <h2>View Reports</h2>
        <PermissionButton
          role={role}
          requiredPermission={PERMISSIONS.REPORT_EXPORT}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Export Report
        </PermissionButton>
      </section>

      {/* ── Example 7: Conditional rendering based on hasAnyPermission – */}
      <section>
        <h2>User Management</h2>
        {hasAnyPermission([PERMISSIONS.USER_MANAGE, PERMISSIONS.USER_VIEW]) ? (
          <div>
            {hasPermission(PERMISSIONS.USER_MANAGE) && (
              <button>Add User</button>
            )}
            <div>View Users List</div>
          </div>
        ) : (
          <p>You don't have access to user management</p>
        )}
      </section>

      {/* ── Example 8: Show all user permissions (debug) ──────– */}
      <section className="border p-4 bg-gray-50">
        <h2>Current User Info</h2>
        <p>Role: {role || "Not authenticated"}</p>
        <p>Permissions ({permissions.length}):</p>
        <ul className="list-disc list-inside">
          {permissions.map((perm) => (
            <li key={perm}>{perm}</li>
          ))}
        </ul>
      </section>

      {/* ── Example 9: Manager-only analytics ────────────────– */}
      {isManager && (
        <section>
          <h2>Team Analytics</h2>
          <div>Submission stats and reports for your team</div>
        </section>
      )}
    </div>
  );
}

// ── Example: Custom hook for managing access ──────────────────
export function useCanManageUsers() {
  const { hasPermission } = useAuth();
  return hasPermission(PERMISSIONS.USER_MANAGE);
}

export function useCanApproveSubmissions() {
  const { hasPermission, hasAnyPermission } = useAuth();
  return hasAnyPermission([
    PERMISSIONS.SUBMISSION_APPROVE,
    PERMISSIONS.SUBMISSION_REJECT,
  ]);
}

export function useCanViewReports() {
  const { hasPermission } = useAuth();
  return hasPermission(PERMISSIONS.REPORT_VIEW);
}

// ── Example: Using in a component ──────────────────────────────
export function SubmissionsPage() {
  const { loading, user } = useAuth();
  const canApprove = useCanApproveSubmissions();
  const canViewReports = useCanViewReports();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in</div>;

  return (
    <div className="space-y-6">
      <h1>Submissions</h1>

      {/* Show approval panel only to users with approval permissions */}
      {canApprove && (
        <div className="border p-4">
          <h2>Pending Approvals</h2>
          {/* Approval UI here */}
        </div>
      )}

      {/* Show reports only to users with report permissions */}
      {canViewReports && (
        <div className="border p-4">
          <h2>Reports & Analytics</h2>
          {/* Reports UI here */}
        </div>
      )}

      {/* Main submission list */}
      <div className="border p-4">
        <h2>All Submissions</h2>
        {/* Submissions list here */}
      </div>
    </div>
  );
}
