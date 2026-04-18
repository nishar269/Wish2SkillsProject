import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, db } = vi.hoisted(() => ({
  auth: vi.fn(),
  db: {
    faculty: { findUnique: vi.fn() },
  },
}));

vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db }));

describe("faculty students actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthorized access", async () => {
    auth.mockResolvedValue({ user: { role: "STUDENT" } });

    const { getFacultyStudents } = await import("./faculty-students");

    await expect(getFacultyStudents()).rejects.toThrow("Unauthorized");
  });

  it("rejects when the faculty profile is missing", async () => {
    auth.mockResolvedValue({ user: { id: "faculty-user", role: "FACULTY" } });
    db.faculty.findUnique.mockResolvedValue(null);

    const { getFacultyStudents } = await import("./faculty-students");

    await expect(getFacultyStudents()).rejects.toThrow("Faculty profile not found");
  });

  it("deduplicates students across assigned batches", async () => {
    auth.mockResolvedValue({ user: { id: "faculty-user", role: "FACULTY" } });
    db.faculty.findUnique.mockResolvedValue({
      facultyAssignments: [
        {
          batch: {
            students: [
              { id: "student-1", user: { name: "Rahul" } },
              { id: "student-2", user: { name: "Asha" } },
            ],
          },
        },
        {
          batch: {
            students: [
              { id: "student-1", user: { name: "Rahul" } },
            ],
          },
        },
      ],
    });

    const { getFacultyStudents } = await import("./faculty-students");

    await expect(getFacultyStudents()).resolves.toEqual([
      { id: "student-1", user: { name: "Rahul" } },
      { id: "student-2", user: { name: "Asha" } },
    ]);
  });
});
