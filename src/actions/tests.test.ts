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

  // ----- checkFaculty / getFacultyTests -----

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

  it("rejects getFacultyTests when there is no session", async () => {
    auth.mockResolvedValue(null);

    const { getFacultyTests } = await import("./tests");

    await expect(getFacultyTests()).rejects.toThrow("Unauthorized");
  });

  it("rejects getFacultyTests for non-faculty roles", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });

    const { getFacultyTests } = await import("./tests");

    await expect(getFacultyTests()).rejects.toThrow("Unauthorized");
  });

  it("throws when faculty profile is not found", async () => {
    auth.mockResolvedValue({ user: { id: "faculty-user", role: "FACULTY" } });
    db.faculty.findUnique.mockResolvedValue(null);

    const { getFacultyTests } = await import("./tests");

    await expect(getFacultyTests()).rejects.toThrow("Faculty profile not found");
  });

  // ----- createTest -----

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

  it("returns an error when createTest db call throws", async () => {
    auth.mockResolvedValue({ user: { id: "faculty-user", role: "FACULTY" } });
    db.test.create.mockRejectedValue(new Error("db error"));

    const { createTest } = await import("./tests");

    await expect(
      createTest({
        title: "Midterm",
        batchId: "batch-1",
        subjectId: "subject-1",
        date: "2026-05-10",
        totalMarks: 100,
        questions: [],
      })
    ).resolves.toEqual({ error: "Failed to create test." });
  });

  // ----- getTestDetails -----

  it("returns test details by id", async () => {
    const testData = { id: "test-1", title: "Final", subject: {}, batch: {} };
    db.test.findUnique.mockResolvedValue(testData);

    const { getTestDetails } = await import("./tests");

    await expect(getTestDetails("test-1")).resolves.toEqual(testData);
    expect(db.test.findUnique).toHaveBeenCalledWith({
      where: { id: "test-1" },
      include: { subject: true, batch: true },
    });
  });

  it("returns null when test is not found", async () => {
    db.test.findUnique.mockResolvedValue(null);

    const { getTestDetails } = await import("./tests");

    await expect(getTestDetails("missing")).resolves.toBeNull();
  });

  // ----- submitTestResult -----

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

  it("rejects submitTestResult for non-student roles", async () => {
    auth.mockResolvedValue({ user: { id: "faculty-user", role: "FACULTY" } });

    const { submitTestResult } = await import("./tests");

    await expect(submitTestResult("test-1", [1])).rejects.toThrow("Unauthorized");
  });

  it("rejects submitTestResult when there is no session", async () => {
    auth.mockResolvedValue(null);

    const { submitTestResult } = await import("./tests");

    await expect(submitTestResult("test-1", [1])).rejects.toThrow("Unauthorized");
  });

  it("throws when student profile is not found for submitTestResult", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.student.findUnique.mockResolvedValue(null);

    const { submitTestResult } = await import("./tests");

    await expect(submitTestResult("test-1", [1])).rejects.toThrow("Student not found");
  });

  it("throws when test is not found for submitTestResult", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.student.findUnique.mockResolvedValue({ id: "student-1" });
    db.test.findUnique.mockResolvedValue(null);

    const { submitTestResult } = await import("./tests");

    await expect(submitTestResult("test-1", [1])).rejects.toThrow("Test not found");
  });

  it("returns an error when submitTestResult db upsert throws", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.student.findUnique.mockResolvedValue({ id: "student-1" });
    db.test.findUnique.mockResolvedValue({
      id: "test-1",
      totalMarks: 50,
      questions: [
        { question: "1 + 1", options: ["2", "3"], correctAnswer: 0 },
      ],
    });
    db.result.upsert.mockRejectedValue(new Error("db error"));

    const { submitTestResult } = await import("./tests");

    await expect(submitTestResult("test-1", [0])).resolves.toEqual({
      error: "Failed to submit test results.",
    });
  });
});
