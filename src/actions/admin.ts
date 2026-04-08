"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { courseSchema, batchSchema } from "@/lib/validations";
import { logAction } from "@/actions/audit";

// --- Middleware/Helper to check admin ---
async function checkAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

// ==========================================
// COURSE MANAGEMENT ACTIONS
// ==========================================

export async function getCourses() {
  await checkAdmin();
  return await db.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { batches: true, students: true, subjects: true }
      }
    }
  });
}

export async function createCourse(formData: FormData) {
  await checkAdmin();
  
  const rawData = {
    name: formData.get("name"),
    code: formData.get("code"),
    description: formData.get("description"),
    durationMonths: parseInt(formData.get("durationMonths") as string),
    status: formData.get("status") || "ACTIVE",
  };

  const parsed = courseSchema.safeParse(rawData);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  try {
    await db.course.create({ data: parsed.data as any });
    revalidatePath("/admin/courses");
    return { success: true };
  } catch (error: any) {
    if (error.code === "P2002") return { error: "Course name or code already exists." };
    return { error: "Failed to create course." };
  }
}

export async function deleteCourse(id: string) {
  await checkAdmin();
  try {
    await db.course.delete({ where: { id } });
    revalidatePath("/admin/courses");
    return { success: true };
  } catch (error) {
    return { error: "Cannot delete course because it has associated batches or students." };
  }
}

// ==========================================
// BATCH MANAGEMENT ACTIONS
// ==========================================

export async function getBatches() {
  await checkAdmin();
  return await db.batch.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      course: true,
      _count: {
        select: { students: true }
      }
    }
  });
}

export async function createBatch(data: any) {
  await checkAdmin();
  
  // Quick manual validation for now
  if (!data.name || !data.courseId || !data.startDate) {
    return { error: "Required fields are missing." };
  }

  try {
    await db.batch.create({
      data: {
        name: data.name,
        courseId: data.courseId,
        capacity: parseInt(data.capacity) || 30,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: data.status || "UPCOMING"
      }
    });
    revalidatePath("/admin/batches");
    return { success: true };
  } catch (error: any) {
    if (error.code === "P2002") return { error: "Batch name already exists." };
    return { error: "Failed to create batch." };
  }
}

export async function deleteBatch(id: string) {
  await checkAdmin();
  try {
    await db.batch.delete({ where: { id } });
    revalidatePath("/admin/batches");
    return { success: true };
  } catch (error) {
    return { error: "Cannot delete batch because it has associated students or classes." };
  }
}
