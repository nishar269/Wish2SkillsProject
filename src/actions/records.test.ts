import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, db } = vi.hoisted(() => ({
  auth: vi.fn(),
  db: {
    student: { count: vi.fn() },
    faculty: { count: vi.fn() },
    batch: { count: vi.fn(), findMany: vi.fn() },
    auditLog: { count: vi.fn(), findMany: vi.fn(), create: vi.fn() },
  },
}));

vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db }));

describe("records actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds records dashboard stats for admin and records roles", async () => {
    auth.mockResolvedValue({ user: { id: "records-1", role: "RECORDS" } });
    db.student.count.mockResolvedValue(12);
    db.faculty.count.mockResolvedValue(3);
    db.batch.count.mockResolvedValue(2);
    db.auditLog.count.mockResolvedValue(7);
    db.auditLog.findMany.mockResolvedValue([{ id: "export-1" }]);

    const { getRecordsStats } = await import("./records");

    await expect(getRecordsStats()).resolves.toEqual({
      totalPeople: 15,
      archives: 2,
      generatedReports: 7,
      recentExports: [{ id: "export-1" }],
      pendingExports: 0,
    });
  });

  it("rejects stats access for unauthorized users", async () => {
    auth.mockResolvedValue({ user: { id: "student-1", role: "STUDENT" } });

    const { getRecordsStats } = await import("./records");

    await expect(getRecordsStats()).rejects.toThrow("Unauthorized");
  });

  it("logs an export request for admins", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });

    const { triggerDataExport } = await import("./records");

    await expect(triggerDataExport("ATTENDANCE")).resolves.toEqual({
      success: true,
      message: "ATTENDANCE export started. Check back in a few moments.",
    });

    expect(db.auditLog.create).toHaveBeenCalledWith({
      data: {
        userId: "admin-1",
        action: "EXPORT_ATTENDANCE",
        entity: "DATABASE",
        details: "User initiated a full ATTENDANCE export.",
      },
    });
  });

  it("returns unauthorized when a non-admin triggers an export", async () => {
    auth.mockResolvedValue({ user: { id: "records-1", role: "RECORDS" } });

    const { triggerDataExport } = await import("./records");

    await expect(triggerDataExport("STUDENTS")).resolves.toEqual({ error: "Unauthorized" });
  });

  it("returns archive inventory for records users", async () => {
    auth.mockResolvedValue({ user: { id: "records-1", role: "RECORDS" } });
    db.batch.findMany.mockResolvedValue([{ id: "batch-1" }]);
    db.auditLog.findMany.mockResolvedValue([{ id: "log-1" }]);

    const { getArchiveInventory } = await import("./records");

    await expect(getArchiveInventory()).resolves.toEqual({
      completedBatches: [{ id: "batch-1" }],
      exportLogs: [{ id: "log-1" }],
    });
  });
});
