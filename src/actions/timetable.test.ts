import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, db } = vi.hoisted(() => ({
  auth: vi.fn(),
  db: {
    student: { findUnique: vi.fn() },
    classSession: { findMany: vi.fn() },
  },
}));

vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db }));

describe("timetable actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized when the user is not logged in", async () => {
    auth.mockResolvedValue(null);

    const { getStudentTimetable } = await import("./timetable");

    await expect(getStudentTimetable()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("returns an error when no student profile exists", async () => {
    auth.mockResolvedValue({ user: { id: "student-user" } });
    db.student.findUnique.mockResolvedValue(null);

    const { getStudentTimetable } = await import("./timetable");

    await expect(getStudentTimetable()).resolves.toEqual({ error: "Student not found" });
  });

  it("returns the current week timetable for a student batch", async () => {
    auth.mockResolvedValue({ user: { id: "student-user" } });
    db.student.findUnique.mockResolvedValue({ batchId: "batch-1" });
    db.classSession.findMany.mockResolvedValue([{ id: "session-1" }]);

    const { getStudentTimetable } = await import("./timetable");

    await expect(getStudentTimetable()).resolves.toEqual([{ id: "session-1" }]);
    expect(db.classSession.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ batchId: "batch-1" }),
      })
    );
  });
});
