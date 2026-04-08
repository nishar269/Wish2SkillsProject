import { Role } from "@/generated/prisma";

// ============================================
// Permission Definitions
// ============================================

export const PERMISSIONS = {
  // User management
  "users:read": [Role.ADMIN, Role.AUTHORITY, Role.RECORDS] as Role[],
  "users:create": [Role.ADMIN] as Role[],
  "users:update": [Role.ADMIN] as Role[],
  "users:delete": [Role.ADMIN] as Role[],

  // Course management
  "courses:read": [Role.ADMIN, Role.COORDINATOR, Role.AUTHORITY, Role.RECORDS, Role.FACULTY] as Role[],
  "courses:create": [Role.ADMIN] as Role[],
  "courses:update": [Role.ADMIN] as Role[],
  "courses:delete": [Role.ADMIN] as Role[],

  // Batch management
  "batches:read": [Role.ADMIN, Role.COORDINATOR, Role.AUTHORITY, Role.RECORDS, Role.FACULTY] as Role[],
  "batches:create": [Role.ADMIN] as Role[],
  "batches:update": [Role.ADMIN, Role.COORDINATOR] as Role[],
  "batches:delete": [Role.ADMIN] as Role[],

  // Subject management
  "subjects:read": [Role.ADMIN, Role.COORDINATOR, Role.FACULTY, Role.STUDENT] as Role[],
  "subjects:create": [Role.ADMIN] as Role[],
  "subjects:update": [Role.ADMIN] as Role[],
  "subjects:delete": [Role.ADMIN] as Role[],

  // Scheduling
  "schedule:read": [Role.ADMIN, Role.COORDINATOR, Role.FACULTY, Role.STUDENT] as Role[],
  "schedule:create": [Role.ADMIN, Role.COORDINATOR] as Role[],
  "schedule:update": [Role.ADMIN, Role.COORDINATOR] as Role[],
  "schedule:delete": [Role.ADMIN, Role.COORDINATOR] as Role[],

  // Attendance
  "attendance:read-own": [Role.STUDENT] as Role[],
  "attendance:read-all": [Role.ADMIN, Role.COORDINATOR, Role.FACULTY, Role.AUTHORITY, Role.RECORDS] as Role[],
  "attendance:mark": [Role.STUDENT] as Role[],
  "attendance:control": [Role.FACULTY, Role.ADMIN] as Role[],

  // Materials
  "materials:read": [Role.ADMIN, Role.FACULTY, Role.STUDENT, Role.COORDINATOR] as Role[],
  "materials:upload": [Role.FACULTY, Role.ADMIN] as Role[],
  "materials:delete": [Role.FACULTY, Role.ADMIN] as Role[],

  // Tests & Results
  "tests:read": [Role.ADMIN, Role.FACULTY, Role.STUDENT, Role.COORDINATOR, Role.AUTHORITY] as Role[],
  "tests:create": [Role.FACULTY, Role.ADMIN] as Role[],
  "results:read-own": [Role.STUDENT] as Role[],
  "results:read-all": [Role.ADMIN, Role.COORDINATOR, Role.FACULTY, Role.AUTHORITY, Role.RECORDS] as Role[],
  "results:enter": [Role.FACULTY, Role.ADMIN] as Role[],

  // Notifications
  "notifications:read": [Role.ADMIN, Role.COORDINATOR, Role.FACULTY, Role.STUDENT, Role.AUTHORITY, Role.RECORDS] as Role[],
  "notifications:send": [Role.ADMIN, Role.COORDINATOR] as Role[],

  // Feedback
  "feedback:submit": [Role.STUDENT] as Role[],
  "feedback:read": [Role.ADMIN, Role.AUTHORITY] as Role[],

  // Reports
  "reports:read": [Role.ADMIN, Role.COORDINATOR, Role.AUTHORITY, Role.RECORDS] as Role[],
  "reports:export": [Role.ADMIN, Role.RECORDS] as Role[],

  // System settings
  "settings:read": [Role.ADMIN] as Role[],
  "settings:update": [Role.ADMIN] as Role[],

  // Audit logs
  "audit:read": [Role.ADMIN, Role.AUTHORITY] as Role[],
} as const;

export type Permission = keyof typeof PERMISSIONS;

// ============================================
// Permission Check Functions
// ============================================

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const allowedRoles = PERMISSIONS[permission];
  return allowedRoles.includes(role);
}

/**
 * Check if a role has any of the given permissions
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * Check if a role has all of the given permissions
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(role: Role): Permission[] {
  return (Object.entries(PERMISSIONS) as [Permission, Role[]][])
    .filter(([, roles]) => roles.includes(role))
    .map(([permission]) => permission);
}

// ============================================
// Role Utilities
// ============================================

export const ROLE_LABELS: Record<Role, string> = {
  STUDENT: "Student",
  FACULTY: "Faculty",
  COORDINATOR: "Coordinator",
  ADMIN: "Administrator",
  AUTHORITY: "Higher Authority",
  RECORDS: "Records Manager",
};

export const ROLE_COLORS: Record<Role, string> = {
  STUDENT: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  FACULTY: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  COORDINATOR: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  ADMIN: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  AUTHORITY: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  RECORDS: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
};

/**
 * Get the dashboard path for a given role
 */
export function getDashboardPath(role: Role): string {
  const paths: Record<Role, string> = {
    STUDENT: "/student",
    FACULTY: "/faculty",
    COORDINATOR: "/coordinator",
    ADMIN: "/admin",
    AUTHORITY: "/authority",
    RECORDS: "/records",
  };
  return paths[role] || "/student";
}
