"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function checkAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function createFee(data: { studentId: string, title: string, amount: number, dueDate: string }) {
  await checkAdmin();
  try {
    await db.feeRecord.create({
      data: {
        studentId: data.studentId,
        title: data.title,
        amount: data.amount,
        dueDate: new Date(data.dueDate),
      }
    });
    revalidatePath("/admin/fees");
    return { success: true };
  } catch {
    return { error: "Failed to issue fee." };
  }
}

export async function getStudentFees() {
    const session = await auth();
    if (!session || session.user.role !== "STUDENT") throw new Error("Unauthorized");
    const student = await db.student.findUnique({ where: { userId: session.user.id } });
    if (!student) return [];

    return await db.feeRecord.findMany({
        where: { studentId: student.id },
        orderBy: { dueDate: "asc" }
    });
}

export async function payFee(feeId: string) {
    const session = await auth();
    if (!session || session.user.role !== "STUDENT") throw new Error("Unauthorized");

    try {
        await db.feeRecord.update({
            where: { id: feeId },
            data: {
                status: "PAID",
                paidAt: new Date()
            }
        });
        revalidatePath("/student/fees");
        return { success: true };
    } catch {
        return { error: "Payment failed." };
    }
}

export async function getAllFees() {
    await checkAdmin();
    return await db.feeRecord.findMany({
        include: { student: { include: { user: { select: { name: true } } } } },
        orderBy: { createdAt: "desc" }
    });
}

export async function deleteFee(id: string) {
    await checkAdmin();
    try {
        await db.feeRecord.delete({ where: { id } });
        revalidatePath("/admin/fees");
        return { success: true };
    } catch {
        return { error: "Failed to delete fee record." };
    }
}

export async function getStudentsForFees() {
    await checkAdmin();
    return await db.student.findMany({
        select: { id: true, user: { select: { name: true } } }
    });
}
