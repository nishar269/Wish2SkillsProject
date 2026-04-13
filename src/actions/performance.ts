"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function getStudentPerformanceData() {
  const session = await auth();
  if (!session) return { error: "Unauthorized" };

  const student = await db.student.findUnique({
    where: { userId: session.user.id },
    include: {
      results: {
        include: { test: { include: { subject: true } } },
        orderBy: { createdAt: "desc" }
      },
      attendances: {
        include: { session: true }
      }
    }
  });

  if (!student) return { error: "Student not found" };

  // Calculate stats
  const totalTests = student.results.length;
  const avgMarks = totalTests > 0 
    ? (student.results.reduce((acc, r) => acc + (r.marksObtained / r.test.totalMarks), 0) / totalTests) * 100 
    : 0;

  const totalSessions = student.attendances.length;
  const presentSessions = student.attendances.filter(a => a.status === "PRESENT").length;
  const attendanceRate = totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 0;

  return {
    results: student.results,
    stats: {
        totalTests,
        avgMarks: Math.round(avgMarks),
        attendanceRate: Math.round(attendanceRate),
        subjectsMastered: new Set(student.results.map(r => r.test.subjectId)).size
    }
  };
}
