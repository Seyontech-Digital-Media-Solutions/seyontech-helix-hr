// ── Role Definitions ────────────────────────────────────────────
export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  EMPLOYEE: "employee",
  VIEWER: "viewer",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// ── Permission Definitions ──────────────────────────────────────
export const PERMISSIONS = {
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
  SYSTEM_CONFIG: "system:config",
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// ── Role to Permissions Mapping ─────────────────────────────────
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
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
    PERMISSIONS.REPORT_EXPORT,
  ],
  
  [ROLES.MANAGER]: [
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.SUBMISSION_CREATE,
    PERMISSIONS.SUBMISSION_READ,
    PERMISSIONS.SUBMISSION_UPDATE,
    PERMISSIONS.SUBMISSION_APPROVE,
    PERMISSIONS.SUBMISSION_REJECT,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_EXPORT,
  ],
  
  [ROLES.EMPLOYEE]: [
    PERMISSIONS.SUBMISSION_CREATE,
    PERMISSIONS.SUBMISSION_READ,
    PERMISSIONS.SUBMISSION_UPDATE,
  ],
  
  [ROLES.VIEWER]: [
    PERMISSIONS.SUBMISSION_READ,
    PERMISSIONS.REPORT_VIEW,
  ],
};

// ── Helper Functions ────────────────────────────────────────────
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = getRolePermissions(role);
  return permissions.includes(permission);
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  const rolePermissions = getRolePermissions(role);
  return permissions.some((p) => rolePermissions.includes(p));
}

export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  const rolePermissions = getRolePermissions(role);
  return permissions.every((p) => rolePermissions.includes(p));
}
