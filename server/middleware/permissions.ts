import type { NextFunction, Request, Response } from "express";
import { PERMISSIONS, type Permission, hasPermission, hasAnyPermission } from "./roles";

// ── Permission Middleware ──────────────────────────────────────
export function requirePermission(...requiredPermissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth?.role) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const hasRequired = hasAnyPermission(req.auth.role, requiredPermissions);
    if (!hasRequired) {
      return res.status(403).json({ 
        error: "Insufficient permissions",
        required: requiredPermissions,
        role: req.auth.role,
      });
    }

    return next();
  };
}

// ── Role-based Middleware ──────────────────────────────────────
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth?.role) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!allowedRoles.includes(req.auth.role)) {
      return res.status(403).json({ 
        error: "Access denied",
        allowed: allowedRoles,
        current: req.auth.role,
      });
    }

    return next();
  };
}

// ── Check Permission ───────────────────────────────────────────
export function hasPermissionForRole(
  role: string | undefined,
  permission: Permission
): boolean {
  if (!role) return false;
  return hasPermission(role as any, permission);
}
