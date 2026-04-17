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
    test: {
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    result: {
      upsert: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db }));
vi.mock("next/cache", () => ({ revalidatePath }));

describe("tests actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns faculty tests for the signed-in faculty member", async () => {
    const tests = [{ id: "test-1", title: "Midterm" }];
    auth.mockResolvedValue({ user: { id: "faculty-user", role: "FACULTY" } });
    db.faculty.findUnique.mockResolvedValue({ id: "faculty-1" });
    db.test.findMany.mockResolvedValue(tests);

    const { getFacultyTests } = await import("./tests");

    await expect(getFacultyTests()).resolves.toEqual(tests);
    expect(db.test.findMany).toHaveBeenCalledWith({
      where: { subject: { course: { batches: { some: { id: { not: "" } } } } } },
      include: {
        batch: true,
        subject: true,
        _count: { select: { results: true } },
      },
      orderBy: { date: "desc" },
    });
  });

  it("creates a test and revalidates faculty tests", async () => {
    auth.mockResolvedValue({ user: { id: "faculty-user", role: "FACULTY" } });

    const { createTest } = await import("./tests");

    await expect(
      createTest({
        title: "Midterm",
        batchId: "batch-1",
        subjectId: "subject-1",
        date: "2026-05-10",
        totalMarks: 100,
        questions: [
          { question: "2 + 2", options: ["3", "4"], correctAnswer: 1 },
        ],
      })
    ).resolves.toEqual({ success: true });

    expect(db.test.create).toHaveBeenCalledWith({
      data: {
        title: "Midterm",
        batchId: "batch-1",
        subjectId: "subject-1",
        date: new Date("2026-05-10"),
        totalMarks: 100,
        questions: [
          { question: "2 + 2", options: ["3", "4"], correctAnswer: 1 },
        ],
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/faculty/tests");
  });

  it("scores and stores student test results", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.student.findUnique.mockResolvedValue({ id: "student-1" });
    db.test.findUnique.mockResolvedValue({
      id: "test-1",
      totalMarks: 100,
      questions: [
        { question: "2 + 2", options: ["3", "4"], correctAnswer: 1 },
        { question: "3 + 3", options: ["5", "6"], correctAnswer: 1 },
      ],
    });

    const { submitTestResult } = await import("./tests");

    await expect(submitTestResult("test-1", [1, 0])).resolves.toEqual({
      success: true,
      score: 50,
    });
    expect(db.result.upsert).toHaveBeenCalledWith({
      where: {
        studentId_testId: {
          studentId: "student-1",
          testId: "test-1",
        },
      },
      update: {
        marksObtained: 50,
        createdAt: expect.any(Date),
      },
      create: {
        studentId: "student-1",
        testId: "test-1",
        marksObtained: 50,
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/student/tests");
  });
});
