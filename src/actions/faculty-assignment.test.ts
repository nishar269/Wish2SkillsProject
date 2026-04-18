import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, revalidatePath, db } = vi.hoisted(() => ({
  auth: vi.fn(),
  revalidatePath: vi.fn(),
  db: {
    facultyAssignment: {
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db }));
vi.mock("next/cache", () => ({ revalidatePath }));

describe("faculty assignment actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns assignments for admins", async () => {
    auth.mockResolvedValue({ user: { role: "ADMIN" } });
    db.facultyAssignment.findMany.mockResolvedValue([{ id: "assignment-1" }]);

    const { getAssignments } = await import("./faculty-assignment");

    await expect(getAssignments()).resolves.toEqual([{ id: "assignment-1" }]);
  });

  it("returns a duplicate assignment error when prisma rejects create", async () => {
    auth.mockResolvedValue({ user: { role: "ADMIN" } });
    db.facultyAssignment.create.mockRejectedValue({ code: "P2002" });

    const { createAssignment } = await import("./faculty-assignment");

    await expect(
      createAssignment({ facultyId: "faculty-1", subjectId: "subject-1", batchId: "batch-1" })
    ).resolves.toEqual({
      error: "This faculty is already assigned to this subject and batch.",
    });
  });

  it("deletes an assignment and revalidates the admin page", async () => {
    auth.mockResolvedValue({ user: { role: "ADMIN" } });

    const { deleteAssignment } = await import("./faculty-assignment");

    await expect(deleteAssignment("assignment-1")).resolves.toEqual({ success: true });
    expect(db.facultyAssignment.delete).toHaveBeenCalledWith({ where: { id: "assignment-1" } });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/assignments");
  });
});
