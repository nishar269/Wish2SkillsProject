import { describe, expect, it } from "vitest";

import {
  ROLE_COLORS,
  ROLE_LABELS,
  Role,
  getDashboardPath,
  getPermissionsForRole,
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
} from "./permissions";

describe("permissions helpers", () => {
  it("checks single permissions correctly", () => {
    expect(hasPermission(Role.STUDENT, "subjects:read")).toBe(true);
    expect(hasPermission(Role.STUDENT, "users:delete")).toBe(false);
  });

  it("checks any and all permission sets", () => {
    expect(hasAnyPermission(Role.COORDINATOR, ["users:create", "batches:update"])).toBe(true);
    expect(hasAllPermissions(Role.ADMIN, ["courses:create", "reports:export"])).toBe(true);
    expect(hasAllPermissions(Role.FACULTY, ["materials:upload", "reports:read"])).toBe(false);
  });

  it("returns the permissions and presentation metadata for a role", () => {
    const recordsPermissions = getPermissionsForRole(Role.RECORDS);

    expect(recordsPermissions).toContain("reports:export");
    expect(recordsPermissions).not.toContain("users:delete");
    expect(ROLE_LABELS[Role.AUTHORITY]).toBe("Higher Authority");
    expect(ROLE_COLORS[Role.RECORDS]).toContain("cyan");
    expect(getDashboardPath(Role.AUTHORITY)).toBe("/authority");
  });
});
