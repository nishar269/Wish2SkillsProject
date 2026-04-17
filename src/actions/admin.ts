"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { courseSchema } from "@/lib/validations";

type BatchInput = {
  name: string;
  courseId: string;
  capacity?: string;
  startDate: string;
  endDate?: string;
  status?: "UPCOMING" | "ACTIVE" | "COMPLETED";
};

function getErrorCode(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error
    ? String((error as { code: unknown }).code)
    : null;
}

// --- Middleware/Helper to check admin ---
async function checkAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

async function checkAuth() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "FACULTY" && session.user.role !== "COORDINATOR")) {
    throw new Error("Unauthorized");
  }
}

// ==========================================
// COURSE MANAGEMENT ACTIONS
// ==========================================

export async function getCourses() {
  await checkAuth();
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
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid course data." };

  try {
    await db.course.create({ data: parsed.data });
    revalidatePath("/admin/courses");
    return { success: true };
  } catch (error) {
    if (getErrorCode(error) === "P2002") return { error: "Course name or code already exists." };
    return { error: "Failed to create course." };
  }
}

export async function deleteCourse(id: string) {
  await checkAdmin();
  try {
    await db.course.delete({ where: { id } });
    revalidatePath("/admin/courses");
    return { success: true };
  } catch {
    return { error: "Cannot delete course because it has associated batches or students." };
  }
}

// ==========================================
// BATCH MANAGEMENT ACTIONS
// ==========================================

export async function getBatches() {
  await checkAuth();
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

export async function createBatch(data: BatchInput) {
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
        capacity: data.capacity ? parseInt(data.capacity, 10) || 30 : 30,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: data.status || "UPCOMING"
      }
    });
    revalidatePath("/admin/batches");
    return { success: true };
  } catch (error) {
    if (getErrorCode(error) === "P2002") return { error: "Batch name already exists." };
    return { error: "Failed to create batch." };
  }
}

export async function deleteBatch(id: string) {
  await checkAdmin();
  try {
    await db.batch.delete({ where: { id } });
    revalidatePath("/admin/batches");
    return { success: true };
  } catch {
    return { error: "Cannot delete batch because it has associated students or classes." };
  }
}
