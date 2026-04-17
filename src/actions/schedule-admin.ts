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

type StudentEmailRecipient = {
  user: {
    email: string;
  };
};

type BatchWithStudents = {
  id: string;
  students: Array<{
    user: {
      email: string | null;
    };
  }>;
};

type SubjectInfo = {
  id: string;
  name: string;
};

function getTimetableUrl() {
  return `${process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? ""}/student/timetable`;
}

function notifyBatchStudents(
  students: StudentEmailRecipient[],
  subjectLine: string,
  title: string,
  message: string,
  actionUrl: string
) {
  students.forEach((student) => {
    sendNotificationEmail(
      student.user.email,
      subjectLine,
      title,
      message,
      "View Timetable",
      actionUrl
    ).catch((err) => console.error("Email error:", err));
  });
}

function getRecipients(batch: BatchWithStudents | null) {
  if (!batch) return [];

  return batch.students.filter((student) => Boolean(student.user.email)) as StudentEmailRecipient[];
}

function buildScheduleEmailMessage(data: ClassSessionInput, subjectName: string) {
  return `<p>A class session for <b>${subjectName}</b> has been scheduled or updated.</p>
    <p><b>Date:</b> ${new Date(data.date).toLocaleDateString()}</p>
    <p><b>Time:</b> ${data.startTime} to ${data.endTime}</p>
    ${data.topic ? `<p><b>Topic:</b> ${data.topic}</p>` : ""}
    ${data.room ? `<p><b>Room:</b> ${data.room}</p>` : ""}
    ${data.meetLink ? `<p><b>Join Link:</b> <a href="${data.meetLink}">${data.meetLink}</a></p>` : ""}`;
}

function buildCancellationMessage(session: {
  date: Date;
  startTime: Date;
  endTime: Date;
  topic?: string | null;
}, subjectName: string) {
  const startTime = new Date(session.startTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = new Date(session.endTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `<p>The scheduled class for <b>${subjectName}</b> has been cancelled or moved.</p>
    <p><b>Date:</b> ${new Date(session.date).toLocaleDateString()}</p>
    <p><b>Time:</b> ${startTime} to ${endTime}</p>
    ${session.topic ? `<p><b>Topic:</b> ${session.topic}</p>` : ""}`;
}

async function getBatchAndSubject(batchId: string, subjectId: string) {
  const [batchInfo, subjectInfo] = await Promise.all([
    db.batch.findUnique({
      where: { id: batchId },
      include: {
        students: {
          include: { user: { select: { email: true } } },
        },
      },
    }),
    db.subject.findUnique({
      where: { id: subjectId },
    }),
  ]);

  return {
    batchInfo: batchInfo as BatchWithStudents | null,
    subjectInfo: subjectInfo as SubjectInfo | null,
  };
}

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

    const { batchInfo, subjectInfo } = await getBatchAndSubject(data.batchId, data.subjectId);

    if (batchInfo && subjectInfo) {
      notifyBatchStudents(
        getRecipients(batchInfo),
        `Class Scheduled: ${subjectInfo.name}`,
        "Upcoming Class Notification",
        buildScheduleEmailMessage(data, subjectInfo.name),
        getTimetableUrl()
      );
    }

    revalidatePath("/admin/schedule");
    revalidatePath("/coordinator/schedule");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to schedule class session." };
  }
}

export async function updateClassSession(id: string, data: ClassSessionInput) {
  await checkAdminOrCoordinator();

  if (!id || !data.batchId || !data.subjectId || !data.facultyId || !data.date || !data.startTime || !data.endTime) {
    return { error: "Required fields are missing." };
  }

  try {
    const existingSession = await db.classSession.findUnique({
      where: { id },
      include: {
        batch: {
          include: {
            students: {
              include: { user: { select: { email: true } } },
            },
          },
        },
        subject: true,
      },
    });

    if (!existingSession) {
      return { error: "Class session not found." };
    }

    const startDateTime = new Date(`${data.date}T${data.startTime}`);
    const endDateTime = new Date(`${data.date}T${data.endTime}`);

    await db.classSession.update({
      where: { id },
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
      },
    });

    const { batchInfo: updatedBatch, subjectInfo: updatedSubject } = await getBatchAndSubject(data.batchId, data.subjectId);

    if (existingSession.batch.id !== data.batchId) {
      notifyBatchStudents(
        getRecipients(existingSession.batch as BatchWithStudents),
        `Class Moved: ${existingSession.subject.name}`,
        "Class Schedule Update",
        buildCancellationMessage(existingSession, existingSession.subject.name),
        getTimetableUrl()
      );
    }

    if (updatedBatch && updatedSubject) {
      notifyBatchStudents(
        getRecipients(updatedBatch),
        `Class Updated: ${updatedSubject.name}`,
        "Class Schedule Update",
        buildScheduleEmailMessage(data, updatedSubject.name),
        getTimetableUrl()
      );
    }

    revalidatePath("/admin/schedule");
    revalidatePath("/coordinator/schedule");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to update scheduled class." };
  }
}

export async function deleteClassSession(id: string) {
  await checkAdminOrCoordinator();
  try {
    const scheduledClass = await db.classSession.findUnique({
      where: { id },
      include: {
        batch: {
          include: {
            students: {
              include: { user: { select: { email: true } } },
            },
          },
        },
        subject: true,
      },
    });

    await db.classSession.delete({ where: { id } });

    if (scheduledClass) {
      notifyBatchStudents(
        getRecipients(scheduledClass.batch as BatchWithStudents),
        `Class Cancelled: ${scheduledClass.subject.name}`,
        "Class Schedule Update",
        buildCancellationMessage(scheduledClass, scheduledClass.subject.name),
        getTimetableUrl()
      );
    }

    revalidatePath("/admin/schedule");
    revalidatePath("/coordinator/schedule");
    return { success: true };
  } catch {
    return { error: "Failed to delete scheduled class." };
  }
}
