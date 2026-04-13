"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { startOfWeek, endOfWeek } from "date-fns";

export async function getFacultyClasses() {
  const session = await auth();
  if (!session || session.user.role !== "FACULTY") return { error: "Unauthorized" };

  const faculty = await db.faculty.findUnique({
    where: { userId: session.user.id }
  });

  if (!faculty) return { error: "Faculty profile not found" };

  const sessions = await db.classSession.findMany({
    where: {
      facultyId: faculty.id,
      date: {
        gte: startOfWeek(new Date(), { weekStartsOn: 1 }),
        lte: endOfWeek(new Date(), { weekStartsOn: 1 })
      }
    },
    include: {
      subject: true,
      batch: {
        include: { course: true }
      }
    },
    orderBy: { startTime: "asc" }
  });

  return sessions;
}
