"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function getStudentProfile(userId: string) {
  return db.student.findUnique({
    where: { userId },
    select: { id: true },
  });
}

export async function getMyLeaveRequests() {
  const session = await auth();
  if (!session || session.user.role !== "STUDENT") throw new Error("Unauthorized");

  const student = await getStudentProfile(session.user.id);
  if (!student) throw new Error("Student not found");

  return db.leaveRequest.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: "desc" },
    include: {
      reviewer: {
        select: { name: true, role: true },
      },
    },
  });
}

export async function applyForLeave(data: { reason: string; start: string; end: string }) {
  const session = await auth();
  if (!session || session.user.role !== "STUDENT") throw new Error("Unauthorized");

  const student = await getStudentProfile(session.user.id);
  if (!student) return { error: "Student profile not found." };

  const startDate = new Date(data.start);
  const endDate = new Date(data.end);
  if (Number.isNaN(startDate.valueOf()) || Number.isNaN(endDate.valueOf())) {
    return { error: "Invalid leave dates provided." };
  }
  if (endDate < startDate) {
    return { error: "End date cannot be earlier than start date." };
  }

  try {
    await db.leaveRequest.create({
      data: {
        studentId: student.id,
        reason: data.reason,
        startDate,
        endDate,
        status: "PENDING",
      },
    });

    revalidatePath("/student/leave");
    return { success: true };
  } catch {
    return { error: "Failed to submit leave request." };
  }
}

export async function getPendingLeaves() {
  const session = await auth();
  if (
    !session ||
    (session.user.role !== "ADMIN" &&
      session.user.role !== "COORDINATOR" &&
      session.user.role !== "FACULTY")
  ) {
    throw new Error("Unauthorized");
  }

  return db.leaveRequest.findMany({
    where: { status: "PENDING" },
    include: {
      student: {
        include: {
          user: { select: { name: true, role: true, email: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function processLeaveRequest(id: string, status: "APPROVED" | "REJECTED", remarks?: string) {
  const session = await auth();
  if (
    !session ||
    (session.user.role !== "ADMIN" &&
      session.user.role !== "COORDINATOR" &&
      session.user.role !== "FACULTY")
  ) {
    throw new Error("Unauthorized");
  }

  try {
    await db.leaveRequest.update({
      where: { id },
      data: {
        status,
        reviewedBy: session.user.id,
        reviewNotes: remarks,
      },
    });

    revalidatePath("/admin/leave");
    revalidatePath("/student/leave");
    return { success: true };
  } catch {
    return { error: "Failed to process request." };
  }
}
