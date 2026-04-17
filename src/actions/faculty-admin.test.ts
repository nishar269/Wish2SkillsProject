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

  it("deletes the linked user when a faculty member is removed", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    db.faculty.findUnique.mockResolvedValue({ userId: "user-1" });

    const { deleteFaculty } = await import("./faculty-admin");

    await expect(deleteFaculty("faculty-1")).resolves.toEqual({ success: true });
    expect(db.user.delete).toHaveBeenCalledWith({ where: { id: "user-1" } });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/faculty");
  });
});
