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

  it("returns an empty fee list when the student profile is missing", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.student.findUnique.mockResolvedValue(null);

    const { getStudentFees } = await import("./fees");

    await expect(getStudentFees()).resolves.toEqual([]);
    expect(db.feeRecord.findMany).not.toHaveBeenCalled();
  });

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
});
