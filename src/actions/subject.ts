"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

type SubjectInput = {
  name: string;
  code: string;
  courseId: string;
  credits?: string;
};

function getErrorCode(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error
    ? String((error as { code: unknown }).code)
    : null;
}

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

export async function createSubject(data: SubjectInput) {
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
        credits: data.credits ? parseInt(data.credits, 10) || 3 : 3,
      }
    });
    revalidatePath("/admin/subjects");
    return { success: true };
  } catch (error) {
    if (getErrorCode(error) === "P2002") return { error: "Subject code already exists." };
    return { error: "Failed to create subject." };
  }
}

export async function deleteSubject(id: string) {
  await checkAdmin();
  try {
    await db.subject.delete({ where: { id } });
    revalidatePath("/admin/subjects");
    return { success: true };
  } catch {
    return { error: "Cannot delete subject because it is linked to classes or materials." };
  }
}
