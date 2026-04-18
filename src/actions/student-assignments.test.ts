import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, revalidatePath, db } = vi.hoisted(() => ({
  auth: vi.fn(),
  revalidatePath: vi.fn(),
  db: {
    student: {
      findUnique: vi.fn(),
    },
    assignment: {
      findMany: vi.fn(),
    },
    assignmentSubmission: {
      upsert: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db }));
vi.mock("next/cache", () => ({ revalidatePath }));

import { getStudentAssignments, submitAssignment } from "./student-assignments";

describe("student assignment actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns assignments for the signed-in student batch", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.student.findUnique.mockResolvedValue({ id: "student-1", batchId: "batch-1" });
    db.assignment.findMany.mockResolvedValue([{ id: "assignment-1" }]);

    await expect(getStudentAssignments()).resolves.toEqual([{ id: "assignment-1" }]);
    expect(db.assignment.findMany).toHaveBeenCalledWith({
      where: { batchId: "batch-1" },
      include: {
        subject: true,
        faculty: { include: { user: true } },
        submissions: {
          where: { studentId: "student-1" },
        },
      },
      orderBy: { dueDate: "asc" },
    });
  });

  it("rejects assignment reads for non-students", async () => {
    auth.mockResolvedValue({ user: { id: "faculty-user", role: "FACULTY" } });

    await expect(getStudentAssignments()).rejects.toThrow("Unauthorized");
  });

  it("rejects assignment reads when the student profile is missing", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.student.findUnique.mockResolvedValue(null);

    await expect(getStudentAssignments()).rejects.toThrow("Student profile not found");
  });

  it("submits an assignment and revalidates the student page", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.student.findUnique.mockResolvedValue({ id: "student-1" });
    db.assignmentSubmission.upsert.mockResolvedValue({ id: "submission-1" });

    await expect(submitAssignment("assignment-1", "https://example.com/work")).resolves.toEqual({
      success: true,
    });
    expect(db.assignmentSubmission.upsert).toHaveBeenCalledWith({
      where: {
        assignmentId_studentId: {
          assignmentId: "assignment-1",
          studentId: "student-1",
        },
      },
      update: {
        contentUrl: "https://example.com/work",
        submittedAt: expect.any(Date),
        status: "SUBMITTED",
      },
      create: {
        assignmentId: "assignment-1",
        studentId: "student-1",
        contentUrl: "https://example.com/work",
        status: "SUBMITTED",
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/student/assignments");
  });

  it("rejects submission when the student profile is missing", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.student.findUnique.mockResolvedValue(null);

    await expect(submitAssignment("assignment-1", "https://example.com/work")).rejects.toThrow(
      "Student profile not found"
    );
  });

  it("returns an error when assignment submission fails", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.student.findUnique.mockResolvedValue({ id: "student-1" });
    db.assignmentSubmission.upsert.mockRejectedValue(new Error("db error"));

    await expect(submitAssignment("assignment-1", "https://example.com/work")).resolves.toEqual({
      error: "Failed to submit assignment.",
    });
  });
});
