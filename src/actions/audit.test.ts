import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, db } = vi.hoisted(() => ({
  auth: vi.fn(),
  db: {
    auditLog: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db }));

describe("audit actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skips log creation when no session is available", async () => {
    auth.mockResolvedValue(null);

    const { logAction } = await import("./audit");

    await expect(logAction("CREATE", "Course")).resolves.toBeUndefined();
    expect(db.auditLog.create).not.toHaveBeenCalled();
  });

  it("writes an audit log when a session exists", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1" } });

    const { logAction } = await import("./audit");

    await expect(logAction("DELETE", "Batch", "batch-1", "Deleted batch")).resolves.toBeUndefined();
    expect(db.auditLog.create).toHaveBeenCalledWith({
      data: {
        userId: "admin-1",
        action: "DELETE",
        entity: "Batch",
        entityId: "batch-1",
        details: "Deleted batch",
      },
    });
  });

  it("swallows audit log write failures", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1" } });
    db.auditLog.create.mockRejectedValue(new Error("db down"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { logAction } = await import("./audit");

    await expect(logAction("CREATE", "Course")).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalled();
  });

  it("returns recent logs for admins", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    db.auditLog.findMany.mockResolvedValue([{ id: "log-1" }]);

    const { getAuditLogs } = await import("./audit");

    await expect(getAuditLogs()).resolves.toEqual([{ id: "log-1" }]);
  });

  it("rejects non-admin access to audit logs", async () => {
    auth.mockResolvedValue({ user: { id: "user-1", role: "FACULTY" } });

    const { getAuditLogs } = await import("./audit");

    await expect(getAuditLogs()).rejects.toThrow("Unauthorized");
  });
});
