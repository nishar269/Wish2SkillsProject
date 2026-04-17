"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sendNotificationEmail } from "@/lib/mail";

type ClassSessionInput = {
  batchId: string;
  subjectId: string;
  facultyId: string;
  date: string;
  startTime: string;
  endTime: string;
  room?: string;
  meetLink?: string;
  topic?: string;
};

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

export async function createClassSession(data: ClassSessionInput) {
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

    const batchInfo = await db.batch.findUnique({
      where: { id: data.batchId },
      include: {
        students: {
          include: { user: { select: { email: true } } }
        },
        course: true,
      }
    });

    const subjectInfo = await db.subject.findUnique({
      where: { id: data.subjectId }
    });

    if (batchInfo && subjectInfo) {
      batchInfo.students.forEach((student) => {
        if (student.user.email) {
          sendNotificationEmail(
            student.user.email,
            `Class Scheduled: ${subjectInfo.name}`,
            "Upcoming Class Notification",
            `<p>A new class session for <b>${subjectInfo.name}</b> has been scheduled.</p>
             <p><b>Date:</b> ${new Date(data.date).toLocaleDateString()}</p>
             <p><b>Time:</b> ${data.startTime} to ${data.endTime}</p>
             ${data.topic ? `<p><b>Topic:</b> ${data.topic}</p>` : ""}
             ${data.room ? `<p><b>Room:</b> ${data.room}</p>` : ""}
             ${data.meetLink ? `<p><b>Join Link:</b> <a href="${data.meetLink}">${data.meetLink}</a></p>` : ""}`,
            "View Timetable",
            `${process.env.NEXTAUTH_URL}/student/timetable`
          ).catch(err => console.error("Email error:", err)); // Async fire-and-forget
        }
      });
    }

    revalidatePath("/admin/schedule");
    revalidatePath("/coordinator/schedule");
    return { success: true };
  } catch (error) {
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
  } catch {
    return { error: "Failed to delete scheduled class." };
  }
}
