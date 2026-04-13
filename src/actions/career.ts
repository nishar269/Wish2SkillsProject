"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function checkAdmin() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "COORDINATOR")) {
    throw new Error("Unauthorized");
  }
  return session;
}

async function checkAuth() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function getJobPosts() {
  await checkAuth();
  return await db.jobPost.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } }
  });
}

export async function createJobPost(data: {
  title: string;
  company: string;
  location: string;
  type: string;
  salaryRange?: string;
  description: string;
  requirements: string;
}) {
  await checkAdmin();
  try {
    await db.jobPost.create({
      data: {
        ...data,
      }
    });
    revalidatePath("/admin/career");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create job post." };
  }
}

export async function deleteJobPost(id: string) {
  await checkAdmin();
  try {
    await db.jobPost.delete({ where: { id } });
    revalidatePath("/admin/career");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete job post." };
  }
}

export async function getJobApplications(jobId: string) {
  await checkAdmin();
  return await db.jobApplication.findMany({
    where: { jobId },
    include: { student: { include: { user: { select: { name: true, email: true } } } } },
    orderBy: { createdAt: "desc" }
  });
}

export async function updateApplicationStatus(id: string, status: string) {
    await checkAdmin();
    try {
        await db.jobApplication.update({
            where: { id },
            data: { status }
        });
        return { success: true };
    } catch (error) {
        return { error: "Failed to update status." };
    }
}
