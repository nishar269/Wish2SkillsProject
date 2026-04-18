import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, revalidatePath, db } = vi.hoisted(() => ({
  auth: vi.fn(),
  revalidatePath: vi.fn(),
  db: {
    student: {
      findUnique: vi.fn(),
    },
    leaveRequest: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db }));
vi.mock("next/cache", () => ({ revalidatePath }));

describe("leave actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the signed-in student's leave requests", async () => {
    const requests = [{ id: "leave-1" }];
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.student.findUnique.mockResolvedValue({ id: "student-1" });
    db.leaveRequest.findMany.mockResolvedValue(requests);

    const { getMyLeaveRequests } = await import("./leave");

    await expect(getMyLeaveRequests()).resolves.toEqual(requests);
    expect(db.leaveRequest.findMany).toHaveBeenCalledWith({
      where: { studentId: "student-1" },
      orderBy: { createdAt: "desc" },
      include: {
        reviewer: {
          select: { name: true, role: true },
        },
      },
    });
  });

  it("rejects leave history access for non-students", async () => {
    auth.mockResolvedValue({ user: { id: "faculty-1", role: "FACULTY" } });

    const { getMyLeaveRequests } = await import("./leave");

    await expect(getMyLeaveRequests()).rejects.toThrow("Unauthorized");
  });

  it("rejects leave history when the student record is missing", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.student.findUnique.mockResolvedValue(null);

    const { getMyLeaveRequests } = await import("./leave");

    await expect(getMyLeaveRequests()).rejects.toThrow("Student not found");
  });

  it("returns an error when leave dates are invalid", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.student.findUnique.mockResolvedValue({ id: "student-1" });

    const { applyForLeave } = await import("./leave");

    await expect(
      applyForLeave({ reason: "Medical", start: "not-a-date", end: "2026-05-01" })
    ).resolves.toEqual({ error: "Invalid leave dates provided." });
  });

  it("returns an error when student profile is missing while applying", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.student.findUnique.mockResolvedValue(null);

    const { applyForLeave } = await import("./leave");

    await expect(
      applyForLeave({ reason: "Medical", start: "2026-05-01", end: "2026-05-02" })
    ).resolves.toEqual({ error: "Student profile not found." });
  });

  it("submits a leave request and revalidates the student page", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.student.findUnique.mockResolvedValue({ id: "student-1" });

    const { applyForLeave } = await import("./leave");

    await expect(
      applyForLeave({ reason: "Medical", start: "2026-05-01", end: "2026-05-02" })
    ).resolves.toEqual({ success: true });
    expect(db.leaveRequest.create).toHaveBeenCalledWith({
      data: {
        studentId: "student-1",
        reason: "Medical",
        startDate: new Date("2026-05-01"),
        endDate: new Date("2026-05-02"),
        status: "PENDING",
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/student/leave");
  });

  it("returns an error when leave request persistence fails", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.student.findUnique.mockResolvedValue({ id: "student-1" });
    db.leaveRequest.create.mockRejectedValue(new Error("db error"));

    const { applyForLeave } = await import("./leave");

    await expect(
      applyForLeave({ reason: "Medical", start: "2026-05-01", end: "2026-05-02" })
    ).resolves.toEqual({ error: "Failed to submit leave request." });
  });

  it("rejects leave requests with inverted dates", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.student.findUnique.mockResolvedValue({ id: "student-1" });

    const { applyForLeave } = await import("./leave");

    await expect(
      applyForLeave({
        reason: "Medical",
        start: "2026-05-05",
        end: "2026-05-01",
      })
    ).resolves.toEqual({ error: "End date cannot be earlier than start date." });
    expect(db.leaveRequest.create).not.toHaveBeenCalled();
  });

  it("loads pending leaves for authorized reviewers", async () => {
    const leaves = [{ id: "leave-1" }];
    auth.mockResolvedValue({ user: { id: "faculty-1", role: "FACULTY" } });
    db.leaveRequest.findMany.mockResolvedValue(leaves);

    const { getPendingLeaves } = await import("./leave");

    await expect(getPendingLeaves()).resolves.toEqual(leaves);
    expect(db.leaveRequest.findMany).toHaveBeenCalledWith({
      where: { status: "PENDING" },
      include: {
        student: {
          include: {
            user: { select: { name: true, role: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  });

  it("rejects pending leave reads for unauthorized users", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });

    const { getPendingLeaves } = await import("./leave");

    await expect(getPendingLeaves()).rejects.toThrow("Unauthorized");
  });

  it("processes a leave request and revalidates dashboards", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });

    const { processLeaveRequest } = await import("./leave");

    await expect(processLeaveRequest("leave-1", "APPROVED", "Take rest")).resolves.toEqual({
      success: true,
    });
    expect(db.leaveRequest.update).toHaveBeenCalledWith({
      where: { id: "leave-1" },
      data: {
        status: "APPROVED",
        reviewedBy: "admin-1",
        reviewNotes: "Take rest",
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/leave");
    expect(revalidatePath).toHaveBeenCalledWith("/student/leave");
  });

  it("rejects leave processing for unauthorized users", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });

    const { processLeaveRequest } = await import("./leave");

    await expect(processLeaveRequest("leave-1", "APPROVED")).rejects.toThrow("Unauthorized");
  });

  it("returns an error when leave processing fails", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    db.leaveRequest.update.mockRejectedValue(new Error("db error"));

    const { processLeaveRequest } = await import("./leave");

    await expect(processLeaveRequest("leave-1", "REJECTED")).resolves.toEqual({ error: "Failed to process request." });
  });
});
