"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

type FeedbackSubmission = {
  message: string;
  rating: number;
  facultyId?: string;
  category?: string;
};

async function getStudentProfile(userId: string) {
  return db.student.findUnique({
    where: { userId },
    select: { id: true },
  });
}

export async function submitFeedback(data: FeedbackSubmission) {
  const session = await auth();
  if (!session || session.user.role !== "STUDENT") throw new Error("Unauthorized");

  const student = await getStudentProfile(session.user.id);
  if (!student) return { error: "Student profile not found." };

  try {
    await db.feedback.create({
      data: {
        studentId: student.id,
        message: data.message,
        rating: data.rating,
        facultyId: data.facultyId,
      },
    });

    revalidatePath("/admin/feedback");
    return { success: true };
  } catch {
    return { error: "Failed to submit feedback." };
  }
}

export async function getAllFeedback() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");

  return db.feedback.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      student: { include: { user: { select: { name: true, role: true } } } },
      faculty: { include: { user: { select: { name: true } } } },
      subject: { select: { name: true, code: true } },
    },
  });
}
