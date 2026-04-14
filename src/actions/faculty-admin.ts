"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

async function checkAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function getFaculty() {
  await checkAdmin();
  return await db.faculty.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      _count: {
        select: { facultyAssignments: true, createdAssignments: true, classSessions: true }
      }
    }
  });
}

export async function createFaculty(data: any) {
  await checkAdmin();
  
  if (!data.name || !data.email || !data.password) {
    return { error: "Required fields are missing." };
  }

  try {
    const passwordHash = await bcrypt.hash(data.password, 12);
    
    await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash,
          role: "FACULTY",
          status: "ACTIVE",
          phone: data.phone,
        }
      });

      await tx.faculty.create({
        data: {
          userId: user.id,
          specialization: data.specialization,
          experience: parseInt(data.experience) || 0,
          qualification: data.qualification,
        }
      });
    });

    revalidatePath("/admin/faculty");
    return { success: true };
  } catch (error: any) {
    if (error.code === "P2002") return { error: "Email already exists." };
    return { error: "Failed to create faculty member." };
  }
}

export async function deleteFaculty(id: string) {
  await checkAdmin();
  try {
    const faculty = await db.faculty.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (faculty) {
      await db.user.delete({ where: { id: faculty.userId } });
    }
    
    revalidatePath("/admin/faculty");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete faculty member." };
  }
}
