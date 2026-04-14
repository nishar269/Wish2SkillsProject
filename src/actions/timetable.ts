"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { startOfWeek, endOfWeek } from "date-fns";

export async function getStudentTimetable() {
  const session = await auth();
  if (!session) return { error: "Unauthorized" };

  const student = await db.student.findUnique({
    where: { userId: session.user.id }
  });

  if (!student) return { error: "Student not found" };

  const sessions = await db.classSession.findMany({
    where: {
      batchId: student.batchId,
      date: {
        gte: startOfWeek(new Date(), { weekStartsOn: 1 }),
        lte: endOfWeek(new Date(), { weekStartsOn: 1 })
      }
    },
    include: {
      subject: true,
      faculty: {
        include: { user: true }
      }
    },
    orderBy: { startTime: "asc" }
  });

  return sessions;
}
