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
    },
    assignmentSubmission: {
      upsert: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db }));
vi.mock("next/cache", () => ({ revalidatePath }));

import { createAssignment, gradeSubmission } from "./assignments";
import { submitAssignment } from "./student-assignments";

describe("assignment actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
