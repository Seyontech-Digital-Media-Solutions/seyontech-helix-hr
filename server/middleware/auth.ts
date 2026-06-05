import type { NextFunction, Request, Response } from "express";
import { prisma } from "../db";
import { supabaseAdmin } from "../supabase";
import { config } from "../config";
import { ROLES, getRolePermissions, type Role } from "../types/roles";

function bearerToken(req: Request) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim();
}

function roleFromSupabase(user: {
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
  email?: string;
}): Role {
  const metadataRole = user.app_metadata?.role ?? user.user_metadata?.role;
  
  // Check if user is admin
  if (metadataRole === ROLES.ADMIN || metadataRole === "admin") {
    return ROLES.ADMIN;
  }
  if (user.email && config.adminEmails.includes(user.email.toLowerCase())) {
    return ROLES.ADMIN;
  }
  
  // Check for manager role
  if (metadataRole === ROLES.MANAGER || metadataRole === "manager") {
    return ROLES.MANAGER;
  }
  
  // Default to employee
  return ROLES.EMPLOYEE;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = bearerToken(req);
  if (!token) {
    return res.status(401).json({ error: "Missing bearer token" });
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user?.email) {
    return res.status(401).json({ error: "Invalid or expired bearer token" });
  }

  const role = roleFromSupabase(data.user);
  const permissions = getRolePermissions(role);
  
  const profile = await prisma.userProfile.upsert({
    where: { supabaseUserId: data.user.id },
    update: {
      email: data.user.email,
      fullName: data.user.user_metadata?.full_name as string | undefined,
      role,
    },
    create: {
      supabaseUserId: data.user.id,
      email: data.user.email,
      fullName: data.user.user_metadata?.full_name as string | undefined,
      role,
    },
  });

  req.auth = {
    supabaseUser: data.user,
    profileId: profile.id,
    role,
    email: data.user.email,
    permissions,
  };
  return next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.auth?.role !== ROLES.ADMIN) {
    return res.status(403).json({ error: "Admin access required" });
  }
  return next();
}
