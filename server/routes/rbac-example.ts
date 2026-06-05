// ── Example: How to use Role-Based Access Control in your routes ──
// This file shows best practices for implementing RBAC in your API routes

import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { requirePermission, requireRole } from "../middleware/permissions";
import { PERMISSIONS, ROLES } from "../types/roles";

export const rbacExampleRouter = Router();

// ── Example 1: Using permission-based middleware ────────────────
// This route requires users to have SUBMISSION_CREATE permission
rbacExampleRouter.post(
  "/submissions",
  requireAuth,
  requirePermission(PERMISSIONS.SUBMISSION_CREATE),
  async (req, res) => {
    // Only users with SUBMISSION_CREATE permission can reach here
    // This includes: Admin, Manager, Employee
    const data = z
      .object({
        title: z.string(),
        content: z.string(),
      })
      .parse(req.body);

    // Create submission...
    res.json({ success: true, data });
  }
);

// ── Example 2: Using role-based middleware ──────────────────────
// This route only allows Admin and Manager roles
rbacExampleRouter.get(
  "/submissions/stats",
  requireAuth,
  requireRole(ROLES.ADMIN, ROLES.MANAGER),
  async (req, res) => {
    // Only Admin and Manager can see statistics
    res.json({ success: true, stats: {} });
  }
);

// ── Example 3: Multiple permissions with AND logic ──────────────
// For approval, users need both UPDATE and APPROVE permissions
rbacExampleRouter.post(
  "/submissions/:id/approve",
  requireAuth,
  requirePermission(PERMISSIONS.SUBMISSION_APPROVE, PERMISSIONS.SUBMISSION_UPDATE),
  async (req, res) => {
    // Only Admin and Manager reach here
    const submissionId = req.params.id;
    res.json({ success: true, submissionId, approved: true });
  }
);

// ── Example 4: Checking permissions in route handler ────────────
rbacExampleRouter.get(
  "/users",
  requireAuth,
  async (req, res) => {
    // Check permission inside the handler
    const canManageUsers = req.auth?.permissions.includes(PERMISSIONS.USER_MANAGE);
    
    if (!canManageUsers) {
      return res.status(403).json({ error: "Cannot manage users" });
    }

    // Get users...
    res.json({ success: true, users: [] });
  }
);

// ── Example 5: Admin-only route ────────────────────────────────
rbacExampleRouter.post(
  "/system/config",
  requireAuth,
  requireRole(ROLES.ADMIN),
  async (req, res) => {
    // Only Admin can access system configuration
    res.json({ success: true });
  }
);

// ── Example 6: Different logic based on user role ───────────────
rbacExampleRouter.get(
  "/submissions",
  requireAuth,
  async (req, res) => {
    let query = {};

    // Return different results based on user role
    if (req.auth?.role === ROLES.ADMIN) {
      // Admins see all submissions
      query = {};
    } else if (req.auth?.role === ROLES.MANAGER) {
      // Managers see submissions from their team
      query = { department: req.auth?.email?.split("@")[0] };
    } else if (req.auth?.role === ROLES.EMPLOYEE) {
      // Employees only see their own submissions
      query = { submittedById: req.auth?.profileId };
    } else {
      // Viewers can't see submissions
      return res.status(403).json({ error: "Access denied" });
    }

    res.json({ success: true, submissions: [], query });
  }
);

export default rbacExampleRouter;
