import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, db } = vi.hoisted(() => ({
  auth: vi.fn(),
  db: {
    student: { count: vi.fn(), findMany: vi.fn() },
    faculty: { count: vi.fn(), findMany: vi.fn() },
    attendance: { findMany: vi.fn() },
    batch: { count: vi.fn(), findMany: vi.fn() },
    auditLog: { count: vi.fn(), findMany: vi.fn(), create: vi.fn() },
  },
}));

vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db }));

describe("records actions", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("builds records dashboard stats for admin and records roles", async () => {
    // RECORDS role
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

    // ADMIN role
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    await expect(getRecordsStats()).resolves.toMatchObject({ totalPeople: 15 });
  });

  it("rejects stats access for unauthorized users", async () => {
    auth.mockResolvedValue({ user: { id: "student-1", role: "STUDENT" } });

    const { getRecordsStats } = await import("./records");

    await expect(getRecordsStats()).rejects.toThrow("Unauthorized");
  });

  it("logs an export request and generates CSV for students", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    db.student.findMany.mockResolvedValue([
      { id: "s1", enrollmentNo: "ENR001", user: { name: "Alice", email: "alice@test.com" }, course: { name: "CS" }, batch: { name: "A1" } },
      { id: "s2", enrollmentNo: null, user: { name: "Bob", email: "bob@test.com" }, course: null, batch: null }
    ]);
    const { triggerDataExport } = await import("./records");

    const result = await triggerDataExport("STUDENTS");
    expect(result.success).toBe(true);
    expect(result.csv).toContain("ID,Name,Email,EnrollmentNo,Course,Batch");
    expect(result.csv).toContain("s1,Alice,alice@test.com,ENR001,CS,A1");
    // Test N/A fallback
    expect(result.csv).toContain("s2,Bob,bob@test.com,N/A,N/A,N/A");

    expect(db.auditLog.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        action: "EXPORT_STUDENTS",
      })
    }));
  });

  it("logs an export request and generates CSV for faculty", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    db.faculty.findMany.mockResolvedValue([
      {
        id: "f1",
        specialization: "AI",
        user: { name: "Dr. Bob", email: "bob@test.com" },
        facultyAssignments: [{ subject: { name: "Math" } }, { subject: { name: "Physics" } }],
      },
      {
        id: "f2",
        specialization: null,
        user: { name: "Dr. No", email: "no@test.com" },
        facultyAssignments: [],
      }
    ]);
    const { triggerDataExport } = await import("./records");

    const result = await triggerDataExport("FACULTY");
    expect(result.success).toBe(true);
    expect(result.csv).toContain("ID,Name,Email,Specialization,Subjects");
    expect(result.csv).toContain('Dr. Bob');
    expect(result.csv).toContain('Math; Physics');
    expect(result.csv).toContain('Dr. No,no@test.com,N/A,');
  });

  it("logs an export request and generates CSV for attendance", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    db.attendance.findMany.mockResolvedValue([
      { status: "PRESENT", markedAt: new Date("2026-05-15T09:00:00Z"), session: { date: new Date("2026-05-15T00:00:00Z"), subject: { name: "Math" } }, student: { user: { name: "Alice" } } },
      { status: "ABSENT", markedAt: null, session: { date: new Date("2026-05-15T00:00:00Z"), subject: { name: "English" } }, student: { user: { name: "Bob" } } }
    ]);
    const { triggerDataExport } = await import("./records");

    const result = await triggerDataExport("ATTENDANCE");
    expect(result.success).toBe(true);
    expect(result.csv).toContain("Date,Subject,StudentName,Status,MarkedAt");
    expect(result.csv).toContain("Alice,PRESENT");
    expect(result.csv).toContain("Bob,ABSENT,N/A");
  });

  it("handles CSV escaping", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    db.student.findMany.mockResolvedValue([
      { id: "s1", enrollmentNo: "ENR,001", user: { name: 'Alice "Wonder"', email: "alice@test.com" }, course: { name: "A\nB" }, batch: { name: "A1" } }
    ]);
    const { triggerDataExport } = await import("./records");

    const result = await triggerDataExport("STUDENTS");
    expect(result.csv).toContain('"ENR,001"');
    expect(result.csv).toContain('"Alice ""Wonder"""');
    expect(result.csv).toContain('"A\nB"');
  });

  it("returns an error if export query fails", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    db.student.findMany.mockRejectedValue(new Error("db failing"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { triggerDataExport } = await import("./records");
    await expect(triggerDataExport("STUDENTS")).resolves.toEqual({ error: "Failed to generate STUDENTS export." });
    
    errorSpy.mockRestore();
  });

  it("returns unauthorized when a non-admin triggers an export", async () => {
    auth.mockResolvedValue({ user: { id: "records-1", role: "RECORDS" } });

    const { triggerDataExport } = await import("./records");

    await expect(triggerDataExport("STUDENTS")).resolves.toEqual({ error: "Unauthorized" });
  });

  it("returns archive inventory for admin and records users", async () => {
    // RECORDS
    auth.mockResolvedValue({ user: { id: "records-1", role: "RECORDS" } });
    db.batch.findMany.mockResolvedValue([{ id: "batch-1" }]);
    db.auditLog.findMany.mockResolvedValue([{ id: "log-1" }]);

    const { getArchiveInventory } = await import("./records");

    await expect(getArchiveInventory()).resolves.toEqual({
      completedBatches: [{ id: "batch-1" }],
      exportLogs: [{ id: "log-1" }],
    });

    // ADMIN
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    await expect(getArchiveInventory()).resolves.toMatchObject({ completedBatches: [{ id: "batch-1" }] });
  });

  it("rejects archive inventory for unauthorized users", async () => {
    auth.mockResolvedValue({ user: { id: "student-1", role: "STUDENT" } });
    const { getArchiveInventory } = await import("./records");
    await expect(getArchiveInventory()).rejects.toThrow("Unauthorized");
  });

  it("handles legacy sessions in buildCSV (empty data)", async () => {
    const { triggerDataExport } = await import("./records");
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    db.student.findMany.mockResolvedValue([]);
    const result = await triggerDataExport("STUDENTS");
    expect(result.csv).toBe("");
  });
});
