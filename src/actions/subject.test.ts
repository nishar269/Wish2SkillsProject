import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, revalidatePath, db } = vi.hoisted(() => ({
  auth: vi.fn(),
  revalidatePath: vi.fn(),
  db: {
    subject: {
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db }));
vi.mock("next/cache", () => ({ revalidatePath }));

describe("subject actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns subjects for authorized users", async () => {
    const subjects = [{ id: "subject-1", name: "Mathematics" }];
    auth.mockResolvedValue({ user: { id: "faculty-1", role: "FACULTY" } });
    db.subject.findMany.mockResolvedValue(subjects);

    const { getSubjects } = await import("./subject");

    await expect(getSubjects()).resolves.toEqual(subjects);
    expect(db.subject.findMany).toHaveBeenCalledWith({
      orderBy: { name: "asc" },
      include: {
        course: true,
        _count: {
          select: { classSessions: true, materials: true, tests: true },
        },
      },
    });
  });

  it("rejects subject creation when required fields are missing", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });

    const { createSubject } = await import("./subject");

    await expect(createSubject({ name: "", code: "SUB101", courseId: "course-1" })).resolves.toEqual({
      error: "Required fields are missing.",
    });
    expect(db.subject.create).not.toHaveBeenCalled();
  });

  it("creates a subject and revalidates the admin page", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });

    const { createSubject } = await import("./subject");

    await expect(
      createSubject({
        name: "Mathematics",
        code: "MTH101",
        courseId: "course-1",
        credits: "4",
      })
    ).resolves.toEqual({ success: true });

    expect(db.subject.create).toHaveBeenCalledWith({
      data: {
        name: "Mathematics",
        code: "MTH101",
        courseId: "course-1",
        credits: 4,
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/subjects");
  });
});
