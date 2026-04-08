"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// --- Faculty Actions ---

export async function getFacultySessions() {
  const session = await auth();
  if (!session || session.user.role !== "FACULTY") {
    throw new Error("Unauthorized");
  }

  const faculty = await db.faculty.findUnique({
    where: { userId: session.user.id }
  });

  if (!faculty) throw new Error("Faculty profile not found");

  return await db.classSession.findMany({
    where: { facultyId: faculty.id },
    orderBy: { date: "desc" },
    include: {
      batch: true,
      subject: true,
    }
  });
}

export async function getSessionStudents(sessionId: string) {
    const session = await auth();
    if (!session || (session.user.role !== "FACULTY" && session.user.role !== "ADMIN")) {
      throw new Error("Unauthorized");
    }

    const classSession = await db.classSession.findUnique({
        where: { id: sessionId },
        select: { batchId: true }
    });

    if (!classSession) throw new Error("Session not found");

    return await db.student.findMany({
        where: { batchId: classSession.batchId },
        include: {
            user: true,
            attendances: {
                where: { sessionId }
            }
        }
    });
}

export async function markAttendanceBulk(sessionId: string, records: { studentId: string, status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED" }[]) {
    const session = await auth();
    if (!session || (session.user.role !== "FACULTY" && session.user.role !== "ADMIN")) {
      throw new Error("Unauthorized");
    }

    try {
        await db.$transaction(
            records.map(record => db.attendance.upsert({
                where: {
                    studentId_sessionId: {
                        studentId: record.studentId,
                        sessionId
                    }
                },
                update: {
                    status: record.status,
                    markedAt: new Date(),
                },
                create: {
                    studentId: record.studentId,
                    sessionId,
                    status: record.status,
                    markedAt: new Date(),
                }
            }))
        );

        revalidatePath(`/faculty/attendance/${sessionId}`);
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Failed to save attendance records." };
    }
}

// --- Student Actions ---

export async function getStudentAttendance() {
    const session = await auth();
    if (!session || session.user.role !== "STUDENT") {
      throw new Error("Unauthorized");
    }

    const student = await db.student.findUnique({
        where: { userId: session.user.id }
    });

    if (!student) throw new Error("Student profile not found");

    return await db.attendance.findMany({
        where: { studentId: student.id },
        include: {
            session: {
                include: {
                    subject: true,
                    faculty: { include: { user: true } }
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });
}

export async function selfMarkAttendance(sessionId: string, coords?: { lat: number, lng: number }) {
    const session = await auth();
    if (!session || session.user.role !== "STUDENT") {
      throw new Error("Unauthorized");
    }

    const student = await db.student.findUnique({
        where: { userId: session.user.id }
    });

    if (!student) throw new Error("Student profile not found");

    // Check if session exists and is part of student's batch
    const classSession = await db.classSession.findUnique({
        where: { id: sessionId },
    });

    if (!classSession || classSession.batchId !== student.batchId) {
        return { error: "Invalid session for your batch." };
    }

    // Check time window (must be during class time or small grace period)
    const now = new Date();
    // Simplified check: only allowed on the day of class (could be more strict)
    if (format(now, "yyyy-MM-dd") !== format(new Date(classSession.date), "yyyy-MM-dd")) {
        return { error: "You can only mark attendance on the scheduled day." };
    }

    try {
        await db.attendance.upsert({
            where: {
                studentId_sessionId: {
                    studentId: student.id,
                    sessionId
                }
            },
            update: {
                status: "PRESENT",
                markedAt: now,
                latitude: coords?.lat,
                longitude: coords?.lng,
            },
            create: {
                studentId: student.id,
                sessionId,
                status: "PRESENT",
                markedAt: now,
                latitude: coords?.lat,
                longitude: coords?.lng,
            }
        });

        revalidatePath("/student/attendance");
        return { success: true };
    } catch (error) {
        return { error: "Failed to mark attendance." };
    }
}

function format(date: Date, pattern: string) {
    // Basic internal format helper
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return pattern.replace("yyyy", String(y)).replace("MM", m).replace("dd", d);
}
