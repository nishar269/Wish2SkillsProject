"use server";

import { db } from "@/lib/db";

export async function getPublicPortfolio(studentId: string) {
  const student = await db.student.findUnique({
    where: { id: studentId },
    include: {
      user: { select: { name: true, email: true, image: true } },
      course: true,
      batch: true,
      results: { include: { test: true }, orderBy: { createdAt: "desc" } },
      applications: { include: { jobPost: true } },
    }
  });

  if (!student) return null;

  // Calculate Average Score
  const totalScore = student.results.reduce((acc, curr) => acc + (curr.score / curr.test.totalMarks), 0);
  const avgPerformance = student.results.length > 0 ? Math.round((totalScore / student.results.length) * 100) : 0;

  return {
    student,
    avgPerformance,
  };
}
