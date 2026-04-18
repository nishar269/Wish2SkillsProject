import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, revalidatePath, db } = vi.hoisted(() => ({
  auth: vi.fn(),
  revalidatePath: vi.fn(),
  db: {
    faculty: {
      findUnique: vi.fn(),
    },
    student: {
      findUnique: vi.fn(),
    },
    assignment: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    assignmentSubmission: {
      upsert: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db }));
vi.mock("next/cache", () => ({ revalidatePath }));

import { createAssignment, getAssignmentSubmissions, getFacultyAssignments, gradeSubmission } from "./assignments";
import { submitAssignment } from "./student-assignments";

describe("assignment actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects faculty assignment reads for unauthenticated users", async () => {
    auth.mockResolvedValue(null);

    await expect(getFacultyAssignments()).rejects.toThrow("Unauthorized");
  });

  it("rejects faculty assignment reads when the faculty profile is missing", async () => {
    auth.mockResolvedValue({ user: { id: "faculty-user", role: "FACULTY" } });
    db.faculty.findUnique.mockResolvedValue(null);

    await expect(getFacultyAssignments()).rejects.toThrow("Faculty profile not found");
  });

  it("returns faculty assignments", async () => {
    auth.mockResolvedValue({ user: { id: "faculty-user", role: "FACULTY" } });
    db.faculty.findUnique.mockResolvedValue({ id: "faculty-1" });
    db.assignment.findMany.mockResolvedValue([{ id: "assignment-1" }]);

    await expect(getFacultyAssignments()).resolves.toEqual([{ id: "assignment-1" }]);
    expect(db.assignment.findMany).toHaveBeenCalledWith({
      where: { facultyId: "faculty-1" },
      include: {
        batch: true,
        subject: true,
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  });

  it("creates an assignment for a faculty member", async () => {
    auth.mockResolvedValue({ user: { id: "faculty-user", role: "FACULTY" } });
    db.faculty.findUnique.mockResolvedValue({ id: "faculty-1" });
    db.assignment.create.mockResolvedValue({ id: "assignment-1" });

    await expect(
      createAssignment({
        title: "REST API Build",
        batchId: "batch-1",
        subjectId: "subject-1",
        dueDate: "2026-04-20",
        totalPoints: "100",
        description: "Build a CRUD API",
      })
    ).resolves.toEqual({ success: true });
    expect(revalidatePath).toHaveBeenCalledWith("/faculty/assignments");
  });

  it("defaults total points to 100 when parsing fails", async () => {
    auth.mockResolvedValue({ user: { id: "faculty-user", role: "FACULTY" } });
    db.faculty.findUnique.mockResolvedValue({ id: "faculty-1" });
    db.assignment.create.mockResolvedValue({ id: "assignment-1" });

    await expect(
      createAssignment({
        title: "REST API Build",
        batchId: "batch-1",
        subjectId: "subject-1",
        dueDate: "2026-04-20",
        totalPoints: "not-a-number",
      })
    ).resolves.toEqual({ success: true });

    expect(db.assignment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ totalPoints: 100 }),
      })
    );
  });

  it("returns an error when assignment creation fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    auth.mockResolvedValue({ user: { id: "faculty-user", role: "FACULTY" } });
    db.faculty.findUnique.mockResolvedValue({ id: "faculty-1" });
    db.assignment.create.mockRejectedValue(new Error("db error"));

    await expect(
      createAssignment({
        title: "REST API Build",
        batchId: "batch-1",
        subjectId: "subject-1",
        dueDate: "2026-04-20",
        totalPoints: "100",
      })
    ).resolves.toEqual({ error: "Failed to create assignment." });

    expect(errorSpy).toHaveBeenCalled();
  });

  it("returns submissions for a specific assignment", async () => {
    auth.mockResolvedValue({ user: { id: "faculty-user", role: "FACULTY" } });
    db.assignmentSubmission.findMany.mockResolvedValue([{ id: "submission-1" }]);

    await expect(getAssignmentSubmissions("assignment-1")).resolves.toEqual([{ id: "submission-1" }]);
    expect(db.assignmentSubmission.findMany).toHaveBeenCalledWith({
      where: { assignmentId: "assignment-1" },
      include: {
        student: { include: { user: true } },
      },
      orderBy: { submittedAt: "desc" },
    });
  });

  it("submits an assignment for a student", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.student.findUnique.mockResolvedValue({ id: "student-1" });
    db.assignmentSubmission.upsert.mockResolvedValue({ id: "submission-1" });

    await expect(submitAssignment("assignment-1", "https://example.com/work")).resolves.toEqual({
      success: true,
    });
    expect(db.assignmentSubmission.upsert).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalledWith("/student/assignments");
  });

  it("grades a submission", async () => {
    auth.mockResolvedValue({ user: { id: "faculty-user", role: "FACULTY" } });
    db.assignmentSubmission.update.mockResolvedValue({ id: "submission-1" });

    await expect(gradeSubmission("submission-1", { grade: 92, feedback: "Well structured work." })).resolves.toEqual({
      success: true,
    });
    expect(db.assignmentSubmission.update).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalledWith("/faculty/assignments");
  });

  it("returns an error when grading fails", async () => {
    auth.mockResolvedValue({ user: { id: "faculty-user", role: "FACULTY" } });
    db.assignmentSubmission.update.mockRejectedValue(new Error("db error"));

    await expect(gradeSubmission("submission-1", { grade: 92 })).resolves.toEqual({ error: "Failed to grade submission." });
  });
});
