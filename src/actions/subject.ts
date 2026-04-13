"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function checkAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

async function checkAuth() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "FACULTY" && session.user.role !== "COORDINATOR" && session.user.role !== "STUDENT")) {
    throw new Error("Unauthorized");
  }
}

export async function getSubjects() {
  await checkAuth();
  return await db.subject.findMany({
    orderBy: { name: "asc" },
    include: {
      course: true,
      _count: {
        select: { classSessions: true, materials: true, tests: true }
      }
    }
  });
}

export async function createSubject(data: any) {
  await checkAdmin();
  
  if (!data.name || !data.code || !data.courseId) {
    return { error: "Required fields are missing." };
  }

  try {
    await db.subject.create({
      data: {
        name: data.name,
        code: data.code,
        courseId: data.courseId,
        credits: parseInt(data.credits) || 3,
      }
    });
    revalidatePath("/admin/subjects");
    return { success: true };
  } catch (error: any) {
    if (error.code === "P2002") return { error: "Subject code already exists." };
    return { error: "Failed to create subject." };
  }
}

export async function deleteSubject(id: string) {
  await checkAdmin();
  try {
    await db.subject.delete({ where: { id } });
    revalidatePath("/admin/subjects");
    return { success: true };
  } catch (error) {
    return { error: "Cannot delete subject because it is linked to classes or materials." };
  }
}
