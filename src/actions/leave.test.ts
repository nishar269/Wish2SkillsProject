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
});
