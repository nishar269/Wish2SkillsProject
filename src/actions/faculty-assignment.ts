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

export async function getAssignments() {
  await checkAdmin();
  return await db.facultyAssignment.findMany({
    include: {
      faculty: { include: { user: true } },
      subject: true,
      batch: true,
    }
  });
}

export async function createAssignment(data: { facultyId: string, subjectId: string, batchId: string }) {
  await checkAdmin();
  
  try {
    await db.facultyAssignment.create({
      data: {
        facultyId: data.facultyId,
        subjectId: data.subjectId,
        batchId: data.batchId,
      }
    });

    revalidatePath("/admin/assignments");
    return { success: true };
  } catch (error: any) {
    if (error.code === "P2002") return { error: "This faculty is already assigned to this subject and batch." };
    return { error: "Failed to create assignment." };
  }
}

export async function deleteAssignment(id: string) {
  await checkAdmin();
  try {
    await db.facultyAssignment.delete({ where: { id } });
    revalidatePath("/admin/assignments");
    return { success: true };
  } catch (error) {
    return { error: "Failed to remove assignment." };
  }
}
