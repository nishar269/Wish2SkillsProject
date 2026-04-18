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

  it("throws for non-admin in getAssignments", async () => {
      auth.mockResolvedValue({ user: { role: "FACULTY" } });
      const { getAssignments } = await import("./faculty-assignment");
      await expect(getAssignments()).rejects.toThrow("Unauthorized");
  });

  it("creates an assignment successfully", async () => {
      auth.mockResolvedValue({ user: { role: "ADMIN" } });
      const { createAssignment } = await import("./faculty-assignment");
      await expect(createAssignment({ facultyId: "f1", subjectId: "s1", batchId: "b1" })).resolves.toEqual({ success: true });
      expect(revalidatePath).toHaveBeenCalledWith("/admin/assignments");
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

  it("returns generic error on create failure", async () => {
      auth.mockResolvedValue({ user: { role: "ADMIN" } });
      db.facultyAssignment.create.mockRejectedValue(new Error("db fail"));
      const { createAssignment } = await import("./faculty-assignment");
      const emptyPayload = {} as unknown as Parameters<typeof createAssignment>[0];
      await expect(createAssignment(emptyPayload)).resolves.toEqual({ error: "Failed to create assignment." });
  });

  it("deletes an assignment and revalidates the admin page", async () => {
    auth.mockResolvedValue({ user: { role: "ADMIN" } });
    const { deleteAssignment } = await import("./faculty-assignment");
    await expect(deleteAssignment("assignment-1")).resolves.toEqual({ success: true });
    expect(db.facultyAssignment.delete).toHaveBeenCalledWith({ where: { id: "assignment-1" } });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/assignments");
  });

  it("returns error on delete failure", async () => {
      auth.mockResolvedValue({ user: { role: "ADMIN" } });
      db.facultyAssignment.delete.mockRejectedValue(new Error("fail"));
      const { deleteAssignment } = await import("./faculty-assignment");
      await expect(deleteAssignment("a1")).resolves.toEqual({ error: "Failed to remove assignment." });
  });
});
