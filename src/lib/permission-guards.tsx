// ── Frontend Route Guards and Permission Utilities ─────────────

import type { Permission, UserRole } from "@/lib/role-permissions";
import { hasPermission, hasAnyPermission, hasAllPermissions } from "@/lib/role-permissions";

// ── Check if a role can access a route ────────────────────────
export function canAccessRoute(role: UserRole | null | undefined, requiredPermission: Permission): boolean {
  return hasPermission(role, requiredPermission);
}

// ── Check if a role can perform an action ──────────────────────
export function canPerformAction(role: UserRole | null | undefined, action: Permission): boolean {
  return hasPermission(role, action);
}

// ── Higher order component pattern (if using React Router) ──────
export interface ProtectedRouteProps {
  role: UserRole | null | undefined;
  requiredPermission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  role,
  requiredPermission,
  children,
  fallback = <div>Access Denied</div>,
}: ProtectedRouteProps) {
  if (!hasPermission(role, requiredPermission)) {
    return fallback;
  }
  return children;
}

// ── Button component with permission check ─────────────────────
export interface PermissionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  role: UserRole | null | undefined;
  requiredPermission: Permission;
  children: React.ReactNode;
}

export function PermissionButton({
  role,
  requiredPermission,
  children,
  ...props
}: PermissionButtonProps) {
  const canClick = hasPermission(role, requiredPermission);
  
  return (
    <button {...props} disabled={!canClick || props.disabled}>
      {children}
    </button>
  );
}

// ── Conditional render based on permissions ────────────────────
export function IfPermission({
  role,
  permission,
  children,
}: {
  role: UserRole | null | undefined;
  permission: Permission;
  children: React.ReactNode;
}) {
  if (!hasPermission(role, permission)) return null;
  return children;
}

// ── Conditional render for any permission ──────────────────────
export function IfAnyPermission({
  role,
  permissions,
  children,
}: {
  role: UserRole | null | undefined;
  permissions: Permission[];
  children: React.ReactNode;
}) {
  if (!hasAnyPermission(role, permissions)) return null;
  return children;
}

// ── Conditional render for all permissions ─────────────────────
export function IfAllPermissions({
  role,
  permissions,
  children,
}: {
  role: UserRole | null | undefined;
  permissions: Permission[];
  children: React.ReactNode;
}) {
  if (!hasAllPermissions(role, permissions)) return null;
  return children;
}
