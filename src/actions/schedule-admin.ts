"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function checkAdminOrCoordinator() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "COORDINATOR")) {
    throw new Error("Unauthorized");
  }
}

export async function getClassSessions(batchId?: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  return await db.classSession.findMany({
    where: batchId ? { batchId } : {},
    orderBy: { date: "asc" },
    include: {
      batch: true,
      subject: true,
      faculty: {
        include: { user: true }
      }
    }
  });
}

export async function createClassSession(data: any) {
  await checkAdminOrCoordinator();

  if (!data.batchId || !data.subjectId || !data.facultyId || !data.date || !data.startTime || !data.endTime) {
    return { error: "Required fields are missing." };
  }

  try {
    const startDateTime = new Date(`${data.date}T${data.startTime}`);
    const endDateTime = new Date(`${data.date}T${data.endTime}`);

    await db.classSession.create({
      data: {
        batchId: data.batchId,
        subjectId: data.subjectId,
        facultyId: data.facultyId,
        date: new Date(data.date),
        startTime: startDateTime,
        endTime: endDateTime,
        room: data.room,
        meetLink: data.meetLink,
        topic: data.topic,
        status: "SCHEDULED",
      }
    });

    // TODO: Trigger notification service here in Phase 7

    revalidatePath("/admin/schedule");
    revalidatePath("/coordinator/schedule");
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: "Failed to schedule class session." };
  }
}

export async function deleteClassSession(id: string) {
  await checkAdminOrCoordinator();
  try {
    await db.classSession.delete({ where: { id } });
    revalidatePath("/admin/schedule");
    revalidatePath("/coordinator/schedule");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete scheduled class." };
  }
}
