import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, db } = vi.hoisted(() => ({
  auth: vi.fn(),
  db: {
    faculty: { findUnique: vi.fn() },
    classSession: { findMany: vi.fn() },
  },
}));

vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db }));

describe("faculty classes actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized for non-faculty users", async () => {
    auth.mockResolvedValue({ user: { role: "STUDENT" } });

    const { getFacultyClasses } = await import("./faculty-classes");

    await expect(getFacultyClasses()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("returns an error if the faculty profile is missing", async () => {
    auth.mockResolvedValue({ user: { id: "faculty-user", role: "FACULTY" } });
    db.faculty.findUnique.mockResolvedValue(null);

    const { getFacultyClasses } = await import("./faculty-classes");

    await expect(getFacultyClasses()).resolves.toEqual({ error: "Faculty profile not found" });
  });

  it("returns the faculty classes for the current week", async () => {
    auth.mockResolvedValue({ user: { id: "faculty-user", role: "FACULTY" } });
    db.faculty.findUnique.mockResolvedValue({ id: "faculty-1" });
    db.classSession.findMany.mockResolvedValue([{ id: "session-1" }]);

    const { getFacultyClasses } = await import("./faculty-classes");

    await expect(getFacultyClasses()).resolves.toEqual([{ id: "session-1" }]);
    expect(db.classSession.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ facultyId: "faculty-1" }),
      })
    );
  });
});
