import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, db } = vi.hoisted(() => ({
  auth: vi.fn(),
  db: {
    student: { findUnique: vi.fn() },
  },
}));

vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db }));

describe("performance actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized when no session exists", async () => {
    auth.mockResolvedValue(null);

    const { getStudentPerformanceData } = await import("./performance");

    await expect(getStudentPerformanceData()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("returns an error when the student profile is missing", async () => {
    auth.mockResolvedValue({ user: { id: "student-user" } });
    db.student.findUnique.mockResolvedValue(null);

    const { getStudentPerformanceData } = await import("./performance");

    await expect(getStudentPerformanceData()).resolves.toEqual({ error: "Student not found" });
  });

  it("computes student performance stats", async () => {
    auth.mockResolvedValue({ user: { id: "student-user" } });
    db.student.findUnique.mockResolvedValue({
      results: [
        {
          marksObtained: 80,
          test: { totalMarks: 100, subjectId: "subject-1", subject: { name: "React" } },
        },
        {
          marksObtained: 45,
          test: { totalMarks: 50, subjectId: "subject-2", subject: { name: "Node" } },
        },
      ],
      attendances: [
        { status: "PRESENT", session: { id: "s1" } },
        { status: "ABSENT", session: { id: "s2" } },
        { status: "PRESENT", session: { id: "s3" } },
      ],
    });

    const { getStudentPerformanceData } = await import("./performance");

    await expect(getStudentPerformanceData()).resolves.toEqual({
      results: [
        {
          marksObtained: 80,
          test: { totalMarks: 100, subjectId: "subject-1", subject: { name: "React" } },
        },
        {
          marksObtained: 45,
          test: { totalMarks: 50, subjectId: "subject-2", subject: { name: "Node" } },
        },
      ],
      stats: {
        totalTests: 2,
        avgMarks: 85,
        attendanceRate: 67,
        subjectsMastered: 2,
      },
    });
  });
});
