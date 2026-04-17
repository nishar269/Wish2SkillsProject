"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

type JobPostInput = {
  title: string;
  company: string;
  location: string;
  type: string;
  salaryRange?: string;
  description: string;
  requirements: string;
};

function getErrorCode(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error
    ? String((error as { code: unknown }).code)
    : null;
}

async function checkAdmin() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "COORDINATOR")) {
    throw new Error("Unauthorized");
  }
}

export async function createJobPost(data: JobPostInput) {
  await checkAdmin();
  try {
    await db.jobPost.create({
      data: {
        title: data.title,
        company: data.company,
        location: data.location,
        type: data.type,
        salaryRange: data.salaryRange,
        description: data.description,
        requirements: data.requirements,
      }
    });
    revalidatePath("/career");
    return { success: true };
  } catch {
    return { error: "Failed to post job." };
  }
}

export async function getJobs() {
    return await db.jobPost.findMany({
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { applications: true } } }
    });
}

export async function applyForJob(jobId: string, resumeUrl?: string) {
    const session = await auth();
    if (!session || session.user.role !== "STUDENT") throw new Error("Unauthorized");

    const student = await db.student.findUnique({ where: { userId: session.user.id } });
    if (!student) throw new Error("Student profile not found");

    try {
        await db.jobApplication.create({
            data: {
                jobId,
                studentId: student.id,
                resumeUrl
            }
        });
        revalidatePath("/career");
        return { success: true };
    } catch (error) {
        if (getErrorCode(error) === "P2002") return { error: "You have already applied for this job." };
        return { error: "Failed to apply." };
    }
}

export async function getStudentApplications() {
    const session = await auth();
    if (!session || session.user.role !== "STUDENT") throw new Error("Unauthorized");
    const student = await db.student.findUnique({ where: { userId: session.user.id } });
    if (!student) return [];

    return await db.jobApplication.findMany({
        where: { studentId: student.id },
        include: { job: true },
        orderBy: { createdAt: "desc" }
    });
}
