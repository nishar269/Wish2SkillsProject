"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

type AssignmentInput = {
  title: string;
  description?: string;
  batchId: string;
  subjectId: string;
  dueDate: string;
  totalPoints: string;
  fileUrl?: string;
};

async function checkFaculty() {
  const session = await auth();
  if (!session || session.user.role !== "FACULTY") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getFacultyAssignments() {
  const session = await checkFaculty();
  const faculty = await db.faculty.findUnique({ where: { userId: session.user.id } });
  if (!faculty) throw new Error("Faculty profile not found");

  return await db.assignment.findMany({
    where: { facultyId: faculty.id },
    include: {
      batch: true,
      subject: true,
      _count: { select: { submissions: true } }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function createAssignment(data: AssignmentInput) {
  const session = await checkFaculty();
  const faculty = await db.faculty.findUnique({ where: { userId: session.user.id } });
  if (!faculty) throw new Error("Faculty profile not found");

  try {
    await db.assignment.create({
      data: {
        title: data.title,
        description: data.description,
        batchId: data.batchId,
        subjectId: data.subjectId,
        dueDate: new Date(data.dueDate),
        totalPoints: parseInt(data.totalPoints) || 100,
        facultyId: faculty.id,
        fileUrl: data.fileUrl,
      }
    });

    revalidatePath("/faculty/assignments");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create assignment." };
  }
}

export async function getAssignmentSubmissions(assignmentId: string) {
    await checkFaculty();
    return await db.assignmentSubmission.findMany({
        where: { assignmentId },
        include: {
            student: { include: { user: true } }
        },
        orderBy: { submittedAt: "desc" }
    });
}

export async function gradeSubmission(submissionId: string, data: { grade: number, feedback?: string }) {
    await checkFaculty();
    try {
        await db.assignmentSubmission.update({
            where: { id: submissionId },
            data: {
                grade: data.grade,
                feedback: data.feedback,
                status: "GRADED"
            }
        });
        revalidatePath("/faculty/assignments");
        return { success: true };
    } catch {
        return { error: "Failed to grade submission." };
    }
}
