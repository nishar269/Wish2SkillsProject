"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function checkFacultyOrAdmin() {
  const session = await auth();
  if (!session || (session.user.role !== "FACULTY" && session.user.role !== "ADMIN")) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getMaterials(subjectId?: string) {
    return await db.material.findMany({
        where: subjectId ? { subjectId } : {},
        include: {
            subject: true,
            faculty: { include: { user: true } }
        },
        orderBy: { createdAt: "desc" }
    });
}

export async function createMaterial(data: { 
    title: string, 
    description?: string, 
    fileUrl: string, 
    fileType: string, 
    subjectId: string 
}) {
    const session = await checkFacultyOrAdmin();
    
    let facultyId: string | undefined;
    if (session.user.role === "FACULTY") {
        const fac = await db.faculty.findUnique({ where: { userId: session.user.id } });
        facultyId = fac?.id;
    }

    try {
        await db.material.create({
            data: {
                title: data.title,
                description: data.description,
                fileUrl: data.fileUrl,
                fileType: data.fileType,
                subjectId: data.subjectId,
                facultyId: facultyId,
            }
        });

        revalidatePath("/faculty/resources");
        revalidatePath("/student/resources");
        return { success: true };
    } catch (error) {
        return { error: "Failed to upload material record." };
    }
}

export async function deleteMaterial(id: string) {
    await checkFacultyOrAdmin();
    try {
        await db.material.delete({ where: { id } });
        revalidatePath("/faculty/resources");
        return { success: true };
    } catch (error) {
        return { error: "Failed to delete material." };
    }
}
