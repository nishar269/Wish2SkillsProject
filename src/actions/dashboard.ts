"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function getStudentDashboardData() {
  const session = await auth();
  if (!session || session.user.role !== "STUDENT") throw new Error("Unauthorized");

  const student = await db.student.findUnique({
    where: { userId: session.user.id },
    include: {
      user: true,
      course: true,
      batch: {
        include: {
          course: true,
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

  const totalClasses = student.attendances.length;
  const presentClasses = student.attendances.filter(a => a.status === 'PRESENT').length;
  const attendancePercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

  // Synthesize Gamification Engine
  const resultXP = student.results.reduce((acc, curr) => acc + (curr.marksObtained * 10), 0);
  const totalXP = (presentClasses * 50) + resultXP;
  
  const level = Math.floor(Math.pow(totalXP / 100, 0.75)) + 1;
  const xpForNextLevel = Math.ceil(Math.pow(level, 1/0.75) * 100);
  const xpForCurrentLevel = Math.ceil(Math.pow(level - 1, 1/0.75) * 100);
  
  const progressRatio = xpForNextLevel === xpForCurrentLevel 
    ? 100 
    : ((totalXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;

  const gamification = {
    level,
    xp: totalXP,
    nextLevelXp: xpForNextLevel,
    progress: Math.min(Math.max(progressRatio, 0), 100),
    streak: presentClasses > 0 ? presentClasses % 10 + 2 : 0, 
    badges: [
       { name: "First Login", icon: "Flame", color: "amber-500", bg: "bg-amber-500/10" },
       ...(totalXP > 500 ? [{ name: "Scholar", icon: "BookOpen", color: "blue-500", bg: "bg-blue-500/10" }] : []),
       ...(attendancePercentage > 90 ? [{ name: "Iron Will", icon: "Shield", color: "emerald-500", bg: "bg-emerald-500/10" }] : []),
    ]
  };

  return {
    student,
    attendancePercentage,
    upcomingClasses: student.batch.classSessions,
    notifications: student.batch.notifications,
    latestResult: student.results[0] || null,
    gamification
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
      facultyAssignments: true, // This is FacultyAssignment model used for workload mapping
      createdAssignments: true // This is the Assignment model used for coursework
    }
  });

  if (!faculty) throw new Error("Faculty profile not found");

  return {
    upcomingClasses: faculty.classSessions,
    totalMaterials: faculty.uploadedMaterials.length,
    activeAssignments: faculty.createdAssignments.length,
    loadCount: faculty.facultyAssignments.length
  };
}

export async function getAuthorityDashboardData() {
    const session = await auth();
    console.log('DASHBOARD_ACCESS: User =', session?.user?.email, 'Role =', session?.user?.role);
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "COORDINATOR")) {
        console.error('DASHBOARD_ACCESS: Unauthorized access attempt detected.');
        throw new Error("Unauthorized");
    }

    try {
        console.log('DASHBOARD_DATA: Fetching aggregate counts...');
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
    } catch (error) {
        console.error('DASHBOARD_DATA: Database fetch failed:', error);
        throw error;
    }
}
