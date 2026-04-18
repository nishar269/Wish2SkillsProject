"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function getAdminReportData() {
  const session = await auth();
  if (!session || !["ADMIN", "AUTHORITY", "RECORDS"].includes(session.user.role)) {
    return { error: "Unauthorized" };
  }

  const studentsCount = await db.student.count();
  const facultyCount = await db.faculty.count();
  const coursesCount = await db.course.count();
  const batchesCount = await db.batch.count();

  const recentResults = await db.result.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      student: { include: { user: true } },
      test: true
    }
  });

  const enrollmentStats = await db.student.groupBy({
    by: ['courseId'],
    _count: { _all: true }
  });

  const courses = await db.course.findMany({
      select: { id: true, name: true }
  });

  const courseMap = Object.fromEntries(courses.map(c => [c.id, c.name]));

  return {
    summary: {
      students: studentsCount,
      faculty: facultyCount,
      courses: coursesCount,
      batches: batchesCount
    },
    recentActivity: recentResults,
    enrollmentByCourse: enrollmentStats.map(stat => ({
        name: courseMap[stat.courseId] || "Unknown",
        count: stat._count._all
    }))
  };
}

export async function getInstitutionalKPIs() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "AUTHORITY")) {
    throw new Error("Unauthorized");
  }

  // 1. Institutional Score (Attendance + Results)
  const totalAttendance = await db.attendance.count();
  const presentAttendance = await db.attendance.count({ where: { status: "PRESENT" } });
  const attendanceRate = totalAttendance > 0 ? (presentAttendance / totalAttendance) * 100 : 85;

  const avgMarksRatio = await db.result.aggregate({
    _avg: { marksObtained: true }
  });
  
  // Base score on attendance + average academic performance
  const institutionalScore = Math.round((attendanceRate + (avgMarksRatio._avg.marksObtained || 70)) / 2);

  // 2. Community Health (Forum activity)
  const forumPosts = await db.forumPost.count();
  const forumComments = await db.forumComment.count();
  const totalEngagement = forumPosts + forumComments;
  const healthLabel = totalEngagement > 50 ? "Excellent" : totalEngagement > 20 ? "Good" : "Growing";

  // 3. Financial Health (Fees collected vs requested)
  const totalFees = await db.feeRecord.aggregate({ _sum: { amount: true } });
  const paidFees = await db.feeRecord.aggregate({ _sum: { amount: true }, where: { status: "PAID" } });
  const totalFeeAmount = totalFees._sum.amount ?? 0;
  const paidFeeAmount = paidFees._sum.amount ?? 0;
  const collectionEfficiency = totalFeeAmount > 0 ? (paidFeeAmount / totalFeeAmount) * 100 : 98;

  return {
    institutionalScore,
    attendanceRate: Math.round(attendanceRate),
    healthLabel,
    totalEngagement,
    collectionEfficiency: Math.round(collectionEfficiency)
  };
}
