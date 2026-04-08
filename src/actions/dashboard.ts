"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function getStudentDashboardData() {
  const session = await auth();
  if (!session || session.user.role !== "STUDENT") throw new Error("Unauthorized");

  const student = await db.student.findUnique({
    where: { userId: session.user.id },
    include: {
      course: true,
      batch: {
        include: {
          classSessions: {
            where: { date: { gte: new Date(new Date().setHours(0,0,0,0)) } },
            include: { subject: true, faculty: { include: { user: true } } },
            orderBy: { date: "asc" },
            take: 4
          },
          notifications: { take: 4, orderBy: { createdAt: "desc" } }
        }
      },
      results: { take: 1, orderBy: { createdAt: "desc" }, include: { test: true } },
      attendances: true
    }
  });

  if (!student) throw new Error("Student profile not found");

  // Calculate Attendance %
  const totalClasses = student.attendances.length;
  const presentClasses = student.attendances.filter(a => a.status === 'PRESENT').length;
  const attendancePercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

  return {
    student,
    attendancePercentage,
    upcomingClasses: student.batch.classSessions,
    notifications: student.batch.notifications,
    latestResult: student.results[0] || null
  };
}

export async function getFacultyDashboardData() {
  const session = await auth();
  if (!session || session.user.role !== "FACULTY") throw new Error("Unauthorized");

  const faculty = await db.faculty.findUnique({
    where: { userId: session.user.id },
    include: {
      classSessions: {
        where: { date: { gte: new Date(new Date().setHours(0,0,0,0)) } },
        include: { subject: true, batch: true },
        orderBy: { date: "asc" },
        take: 4
      },
      uploadedMaterials: { take: 5, orderBy: { createdAt: "desc" } },
      assignments: true, // This is FacultyAssignment model used for workload mapping
      createdAssignments: true // This is the Assignment model used for coursework
    }
  });

  if (!faculty) throw new Error("Faculty profile not found");

  return {
    upcomingClasses: faculty.classSessions,
    totalMaterials: faculty.uploadedMaterials.length,
    activeAssignments: faculty.createdAssignments.length,
    loadCount: faculty.assignments.length
  };
}

export async function getAuthorityDashboardData() {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN" && session.user.role !== "COORDINATOR") {
        throw new Error("Unauthorized");
    }

    const [studentCount, facultyCount, courseCount, recentLogs] = await Promise.all([
        db.student.count(),
        db.faculty.count(),
        db.course.count(),
        db.auditLog.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { user: true } })
    ]);

    return {
        studentCount,
        facultyCount,
        courseCount,
        recentLogs
    };
}
