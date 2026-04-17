"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getStudentNotifications() {
  const session = await auth();
  if (!session || session.user.role !== "STUDENT") throw new Error("Unauthorized");

  const student = await db.student.findUnique({
    where: { userId: session.user.id }
  });

  if (!student) throw new Error("Student not found");

  return await db.notification.findMany({
    where: {
      OR: [
        { targetBatchId: student.batchId },
        { targetRole: "STUDENT" },
        { targetBatchId: null, targetRole: null } // Global
      ]
    },
    orderBy: { createdAt: "desc" },
    include: { creator: { select: { name: true } } }
  });
}

export async function markAsRead(id: string) {
    const session = await auth();
    if (!session) return;

    try {
        await db.notification.update({
            where: { id },
            data: {
                readBy: {
                    push: session.user.id
                }
            }
        });
        revalidatePath("/student/notifications");
        return { success: true };
    } catch {
        return { error: "Failed to mark as read." };
    }
}
