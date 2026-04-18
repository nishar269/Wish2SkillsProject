import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, revalidatePath, db } = vi.hoisted(() => ({
  auth: vi.fn(),
  revalidatePath: vi.fn(),
  db: {
    feeRecord: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    student: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db }));
vi.mock("next/cache", () => ({ revalidatePath }));

describe("fees actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ----- createFee -----

  it("creates a fee record for admins", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });

    const { createFee } = await import("./fees");

    await expect(
      createFee({
        studentId: "student-1",
        title: "Semester Fee",
        amount: 12000,
        dueDate: "2026-05-01",
      })
    ).resolves.toEqual({ success: true });

    expect(db.feeRecord.create).toHaveBeenCalledWith({
      data: {
        studentId: "student-1",
        title: "Semester Fee",
        amount: 12000,
        dueDate: new Date("2026-05-01"),
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/fees");
  });

  it("rejects createFee for non-admin users", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });

    const { createFee } = await import("./fees");

    await expect(
      createFee({ studentId: "s1", title: "Fee", amount: 100, dueDate: "2026-06-01" })
    ).rejects.toThrow("Unauthorized");
  });

  it("rejects createFee when there is no session", async () => {
    auth.mockResolvedValue(null);

    const { createFee } = await import("./fees");

    await expect(
      createFee({ studentId: "s1", title: "Fee", amount: 100, dueDate: "2026-06-01" })
    ).rejects.toThrow("Unauthorized");
  });

  it("returns an error when createFee db call throws", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    db.feeRecord.create.mockRejectedValue(new Error("db error"));

    const { createFee } = await import("./fees");

    await expect(
      createFee({ studentId: "s1", title: "Fee", amount: 100, dueDate: "2026-06-01" })
    ).resolves.toEqual({ error: "Failed to issue fee." });
  });

  // ----- getStudentFees -----

  it("returns an empty fee list when the student profile is missing", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.student.findUnique.mockResolvedValue(null);

    const { getStudentFees } = await import("./fees");

    await expect(getStudentFees()).resolves.toEqual([]);
    expect(db.feeRecord.findMany).not.toHaveBeenCalled();
  });

  it("returns fees for a valid student", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.student.findUnique.mockResolvedValue({ id: "student-1" });
    const fees = [{ id: "fee-1", title: "Tuition" }];
    db.feeRecord.findMany.mockResolvedValue(fees);

    const { getStudentFees } = await import("./fees");

    await expect(getStudentFees()).resolves.toEqual(fees);
    expect(db.feeRecord.findMany).toHaveBeenCalledWith({
      where: { studentId: "student-1" },
      orderBy: { dueDate: "asc" },
    });
  });

  it("rejects getStudentFees for non-student users", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });

    const { getStudentFees } = await import("./fees");

    await expect(getStudentFees()).rejects.toThrow("Unauthorized");
  });

  it("rejects getStudentFees when there is no session", async () => {
    auth.mockResolvedValue(null);

    const { getStudentFees } = await import("./fees");

    await expect(getStudentFees()).rejects.toThrow("Unauthorized");
  });

  // ----- payFee -----

  it("marks a fee as paid for a student", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });

    const { payFee } = await import("./fees");

    await expect(payFee("fee-1")).resolves.toEqual({ success: true });
    expect(db.feeRecord.update).toHaveBeenCalledWith({
      where: { id: "fee-1" },
      data: {
        status: "PAID",
        paidAt: expect.any(Date),
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/student/fees");
  });

  it("returns an error when payFee db call throws", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.feeRecord.update.mockRejectedValue(new Error("db error"));

    const { payFee } = await import("./fees");

    await expect(payFee("fee-1")).resolves.toEqual({ error: "Payment failed." });
  });

  it("rejects payFee for non-student users", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });

    const { payFee } = await import("./fees");

    await expect(payFee("fee-1")).rejects.toThrow("Unauthorized");
  });

  it("rejects payFee when there is no session", async () => {
    auth.mockResolvedValue(null);

    const { payFee } = await import("./fees");

    await expect(payFee("fee-1")).rejects.toThrow("Unauthorized");
  });

  // ----- getAllFees -----

  it("returns all fee records for an admin", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    const records = [{ id: "fee-1" }, { id: "fee-2" }];
    db.feeRecord.findMany.mockResolvedValue(records);

    const { getAllFees } = await import("./fees");

    await expect(getAllFees()).resolves.toEqual(records);
    expect(db.feeRecord.findMany).toHaveBeenCalledWith({
      include: { student: { include: { user: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
    });
  });

  // ----- deleteFee -----

  it("deletes a fee record and revalidates", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });

    const { deleteFee } = await import("./fees");

    await expect(deleteFee("fee-1")).resolves.toEqual({ success: true });
    expect(db.feeRecord.delete).toHaveBeenCalledWith({ where: { id: "fee-1" } });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/fees");
  });

  it("returns an error when deleteFee db call throws", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    db.feeRecord.delete.mockRejectedValue(new Error("db error"));

    const { deleteFee } = await import("./fees");

    await expect(deleteFee("fee-1")).resolves.toEqual({ error: "Failed to delete fee record." });
  });

  // ----- getStudentsForFees -----

  it("returns students for fee management", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    const students = [{ id: "s1", user: { name: "Alice" } }];
    db.student.findMany.mockResolvedValue(students);

    const { getStudentsForFees } = await import("./fees");

    await expect(getStudentsForFees()).resolves.toEqual(students);
    expect(db.student.findMany).toHaveBeenCalledWith({
      select: { id: true, user: { select: { name: true } } },
    });
  });
});
