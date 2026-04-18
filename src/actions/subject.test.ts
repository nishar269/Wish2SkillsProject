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

  it("rejects subject reads for unauthenticated users", async () => {
    auth.mockResolvedValue(null);

    const { getSubjects } = await import("./subject");

    await expect(getSubjects()).rejects.toThrow("Unauthorized");
  });

  it("rejects subject creation when required fields are missing", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });

    const { createSubject } = await import("./subject");

    await expect(createSubject({ name: "", code: "SUB101", courseId: "course-1" })).resolves.toEqual({
      error: "Required fields are missing.",
    });
    expect(db.subject.create).not.toHaveBeenCalled();
  });

  it("rejects subject creation for non-admin users", async () => {
    auth.mockResolvedValue({ user: { id: "coord-1", role: "COORDINATOR" } });

    const { createSubject } = await import("./subject");

    await expect(
      createSubject({ name: "Mathematics", code: "MTH101", courseId: "course-1" })
    ).rejects.toThrow("Unauthorized");
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

  it("defaults credits to 3 when credits are missing or invalid", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });

    const { createSubject } = await import("./subject");

    await expect(
      createSubject({ name: "Physics", code: "PHY101", courseId: "course-1" })
    ).resolves.toEqual({ success: true });
    expect(db.subject.create).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ credits: 3 }),
      })
    );

    await expect(
      createSubject({ name: "Chemistry", code: "CHE101", courseId: "course-1", credits: "not-a-number" })
    ).resolves.toEqual({ success: true });
    expect(db.subject.create).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ credits: 3 }),
      })
    );
  });

  it("returns a duplicate code error when prisma rejects create", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    db.subject.create.mockRejectedValue({ code: "P2002" });

    const { createSubject } = await import("./subject");

    await expect(
      createSubject({ name: "Mathematics", code: "MTH101", courseId: "course-1" })
    ).resolves.toEqual({ error: "Subject code already exists." });
  });

  it("returns the generic error for other create failures", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    db.subject.create.mockRejectedValue(new Error("db error"));

    const { createSubject } = await import("./subject");

    await expect(
      createSubject({ name: "Mathematics", code: "MTH101", courseId: "course-1" })
    ).resolves.toEqual({ error: "Failed to create subject." });
  });

  it("deletes subjects for admins and revalidates", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });

    const { deleteSubject } = await import("./subject");

    await expect(deleteSubject("subject-1")).resolves.toEqual({ success: true });
    expect(db.subject.delete).toHaveBeenCalledWith({ where: { id: "subject-1" } });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/subjects");
  });

  it("returns the expected guard message when subject deletion fails", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    db.subject.delete.mockRejectedValue(new Error("constraint"));

    const { deleteSubject } = await import("./subject");

    await expect(deleteSubject("subject-1")).resolves.toEqual({
      error: "Cannot delete subject because it is linked to classes or materials.",
    });
  });
});
