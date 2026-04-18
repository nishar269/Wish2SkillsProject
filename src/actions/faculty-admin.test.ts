import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, hash, revalidatePath, db } = vi.hoisted(() => ({
  auth: vi.fn(),
  hash: vi.fn(),
  revalidatePath: vi.fn(),
  db: {
    faculty: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    user: {
      delete: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db }));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("bcryptjs", () => ({
  default: {
    hash,
  },
}));

describe("faculty admin actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads faculty members for admins", async () => {
    const faculty = [{ id: "faculty-1" }];
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    db.faculty.findMany.mockResolvedValue(faculty);

    const { getFaculty } = await import("./faculty-admin");

    await expect(getFaculty()).resolves.toEqual(faculty);
    expect(db.faculty.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        _count: {
          select: { facultyAssignments: true, createdAssignments: true, classSessions: true },
        },
      },
    });
  });

  it("loads faculty members for coordinators", async () => {
    const faculty = [{ id: "faculty-1" }];
    auth.mockResolvedValue({ user: { id: "coord-1", role: "COORDINATOR" } });
    db.faculty.findMany.mockResolvedValue(faculty);

    const { getFaculty } = await import("./faculty-admin");

    await expect(getFaculty()).resolves.toEqual(faculty);
  });

  it("rejects faculty reads for unauthorized roles", async () => {
    auth.mockResolvedValue({ user: { id: "student-1", role: "STUDENT" } });

    const { getFaculty } = await import("./faculty-admin");

    await expect(getFaculty()).rejects.toThrow("Unauthorized");
  });

  it("creates faculty members through a transaction", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    hash.mockResolvedValue("hashed-password");
    db.$transaction.mockImplementation(async (callback: (tx: unknown) => Promise<void>) => {
      const tx = {
        user: {
          create: vi.fn().mockResolvedValue({ id: "user-1" }),
        },
        faculty: {
          create: vi.fn().mockResolvedValue({ id: "faculty-1" }),
        },
      };

      await callback(tx);
    });

    const { createFaculty } = await import("./faculty-admin");

    await expect(
      createFaculty({
        name: "Prof. Ada",
        email: "ada@example.com",
        password: "Password123",
        phone: "9999999999",
        specialization: "Physics",
        experience: "8",
        qualification: "PhD",
      })
    ).resolves.toEqual({ success: true });

    expect(hash).toHaveBeenCalledWith("Password123", 12);
    expect(db.$transaction).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalledWith("/admin/faculty");
  });

  it("rejects faculty creation when required fields are missing", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });

    const { createFaculty } = await import("./faculty-admin");

    await expect(
      createFaculty({ name: "", email: "ada@example.com", password: "Password123" })
    ).resolves.toEqual({ error: "Required fields are missing." });

    expect(hash).not.toHaveBeenCalled();
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it("returns a duplicate email error for faculty creation", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    hash.mockResolvedValue("hashed-password");
    db.$transaction.mockRejectedValue({ code: "P2002" });

    const { createFaculty } = await import("./faculty-admin");

    await expect(
      createFaculty({ name: "Prof. Ada", email: "ada@example.com", password: "Password123" })
    ).resolves.toEqual({ error: "Email already exists." });
  });

  it("returns a generic error for other faculty creation failures", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    hash.mockResolvedValue("hashed-password");
    db.$transaction.mockRejectedValue(new Error("db error"));

    const { createFaculty } = await import("./faculty-admin");

    await expect(
      createFaculty({ name: "Prof. Ada", email: "ada@example.com", password: "Password123" })
    ).resolves.toEqual({ error: "Failed to create faculty member." });
  });

  it("deletes the linked user when a faculty member is removed", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    db.faculty.findUnique.mockResolvedValue({ userId: "user-1" });

    const { deleteFaculty } = await import("./faculty-admin");

    await expect(deleteFaculty("faculty-1")).resolves.toEqual({ success: true });
    expect(db.user.delete).toHaveBeenCalledWith({ where: { id: "user-1" } });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/faculty");
  });

  it("returns success when the faculty record does not exist", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    db.faculty.findUnique.mockResolvedValue(null);

    const { deleteFaculty } = await import("./faculty-admin");

    await expect(deleteFaculty("faculty-1")).resolves.toEqual({ success: true });
    expect(db.user.delete).not.toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/admin/faculty");
  });

  it("returns an error when faculty deletion fails", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    db.faculty.findUnique.mockRejectedValue(new Error("db error"));

    const { deleteFaculty } = await import("./faculty-admin");

    await expect(deleteFaculty("faculty-1")).resolves.toEqual({ error: "Failed to delete faculty member." });
  });
});
