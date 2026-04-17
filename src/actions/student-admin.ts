"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

type StudentInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  courseId: string;
  batchId: string;
  enrollmentNo?: string;
  parentPhone?: string;
  address?: string;
};

function getErrorCode(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error
    ? String((error as { code: unknown }).code)
    : null;
}

function getErrorTargets(error: unknown) {
  if (typeof error !== "object" || error === null || !("meta" in error)) return [];
  const meta = (error as { meta?: { target?: unknown } }).meta;
  if (!meta?.target) return [];
  return Array.isArray(meta.target) ? meta.target.map(String) : [String(meta.target)];
}

async function checkAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function getStudents() {
  await checkAdmin();
  return await db.student.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      course: true,
      batch: true,
    }
  });
}

export async function createStudent(data: StudentInput) {
  await checkAdmin();
  
  if (!data.name || !data.email || !data.password || !data.courseId || !data.batchId) {
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
          role: "STUDENT",
          status: "ACTIVE",
          phone: data.phone,
        }
      });

      await tx.student.create({
        data: {
          userId: user.id,
          courseId: data.courseId,
          batchId: data.batchId,
          enrollmentNo: data.enrollmentNo,
          parentPhone: data.parentPhone,
          address: data.address,
        }
      });
    });

    revalidatePath("/admin/students");
    return { success: true };
  } catch (error) {
    if (getErrorCode(error) === "P2002") {
        const targets = getErrorTargets(error);
        if (targets.includes("email")) return { error: "Email already exists." };
        if (targets.includes("enrollment_no")) return { error: "Enrollment number already exists." };
    }
    return { error: "Failed to create student." };
  }
}

export async function deleteStudent(id: string) {
  await checkAdmin();
  try {
    const student = await db.student.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (student) {
      await db.user.delete({ where: { id: student.userId } });
    }
    
    revalidatePath("/admin/students");
    return { success: true };
  } catch {
    return { error: "Failed to delete student." };
  }
}
