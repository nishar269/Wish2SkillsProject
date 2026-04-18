import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, hash, revalidatePath, db } = vi.hoisted(() => ({
  auth: vi.fn(),
  hash: vi.fn(),
  revalidatePath: vi.fn(),
  db: {
    student: {
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

import { getStudents, createStudent, deleteStudent } from "./student-admin";

describe("student admin actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads students for admins", async () => {
    const students = [{ id: "student-1" }];
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    db.student.findMany.mockResolvedValue(students);

    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    db.student.findMany.mockResolvedValue(students);

    await expect(getStudents()).resolves.toEqual(students);
    expect(db.student.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        course: true,
        batch: true,
      },
    });
  });

  it("rejects student reads for non-admin users", async () => {
    auth.mockResolvedValue({ user: { id: "user-1", role: "COORDINATOR" } });

    auth.mockResolvedValue({ user: { id: "user-1", role: "COORDINATOR" } });

    await expect(getStudents()).rejects.toThrow("Unauthorized");
  });

  it("creates students through a transaction", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    hash.mockResolvedValue("hashed-password");
    db.$transaction.mockImplementation(async (callback: (tx: unknown) => Promise<void>) => {
      const tx = {
        user: {
          create: vi.fn().mockResolvedValue({ id: "user-1" }),
        },
        student: {
          create: vi.fn().mockResolvedValue({ id: "student-1" }),
        },
      };

      await callback(tx);
    });

    await expect(
      createStudent({
        name: "Test Student",
        email: "student@example.com",
        password: "Password123",
        phone: "9999999999",
        courseId: "course-1",
        batchId: "batch-1",
        enrollmentNo: "ENR001",
      })
    ).resolves.toEqual({ success: true });

    expect(hash).toHaveBeenCalledWith("Password123", 12);
    expect(db.$transaction).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalledWith("/admin/students");
  });

  it("rejects student creation when required fields are missing", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });

    await expect(
      createStudent({
        name: "",
        email: "student@example.com",
        password: "Password123",
        courseId: "course-1",
        batchId: "batch-1",
      })
    ).resolves.toEqual({ error: "Required fields are missing." });
    expect(hash).not.toHaveBeenCalled();
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it("returns duplicate email errors for student creation", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    hash.mockResolvedValue("hashed-password");
    db.$transaction.mockRejectedValue({ code: "P2002", meta: { target: ["email"] } });

    await expect(
      createStudent({
        name: "Test Student",
        email: "student@example.com",
        password: "Password123",
        courseId: "course-1",
        batchId: "batch-1",
      })
    ).resolves.toEqual({ error: "Email already exists." });
  });

  it("returns duplicate enrollment number errors for student creation", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    hash.mockResolvedValue("hashed-password");
    db.$transaction.mockRejectedValue({ code: "P2002", meta: { target: ["enrollment_no"] } });

    await expect(
      createStudent({
        name: "Test Student",
        email: "student2@example.com",
        password: "Password123",
        courseId: "course-1",
        batchId: "batch-1",
        enrollmentNo: "ENR001",
      })
    ).resolves.toEqual({ error: "Enrollment number already exists." });
  });

  it("returns a generic error for other student creation failures", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    hash.mockResolvedValue("hashed-password");
    db.$transaction.mockRejectedValue(new Error("db error"));

    await expect(
      createStudent({
        name: "Test Student",
        email: "student@example.com",
        password: "Password123",
        courseId: "course-1",
        batchId: "batch-1",
      })
    ).resolves.toEqual({ error: "Failed to create student." });
  });

  it("covers getErrorTargets fallback branches", async () => {
    auth.mockResolvedValue({ user: { role: "ADMIN" } });
    hash.mockResolvedValue("p");
    
    // Non-object meta
    db.$transaction.mockRejectedValueOnce({ code: "P2002", meta: null });
    await expect(createStudent({ name: "A", email: "e", password: "p", courseId: "c", batchId: "b" })).resolves.toEqual({
        error: "Failed to create student."
    });

    // Missing target
    db.$transaction.mockRejectedValueOnce({ code: "P2002", meta: { target: null } });
    await expect(createStudent({ name: "A", email: "e", password: "p", courseId: "c", batchId: "b" })).resolves.toEqual({
        error: "Failed to create student."
    });

    // Single target (string)
    db.$transaction.mockRejectedValueOnce({ code: "P2002", meta: { target: "email" } });
    await expect(createStudent({ name: "A", email: "e", password: "p", courseId: "c", batchId: "b" })).resolves.toEqual({
        error: "Email already exists."
    });
  });

  it("deletes the linked user when a student is removed", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    db.student.findUnique.mockResolvedValue({ userId: "user-1" });

    await expect(deleteStudent("student-1")).resolves.toEqual({ success: true });
    expect(db.user.delete).toHaveBeenCalledWith({ where: { id: "user-1" } });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/students");
  });

  it("returns success when the student record does not exist", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    db.student.findUnique.mockResolvedValue(null);

    await expect(deleteStudent("student-1")).resolves.toEqual({ success: true });
    expect(db.user.delete).not.toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/admin/students");
  });

  it("returns an error when student deletion fails", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    db.student.findUnique.mockRejectedValue(new Error("db error"));

    await expect(deleteStudent("student-1")).resolves.toEqual({ error: "Failed to delete student." });
  });
});
