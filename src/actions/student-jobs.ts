"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function applyToJob(jobId: string, resumeUrl: string) {
    const session = await auth();
    if (!session || session.user.role !== "STUDENT") throw new Error("Unauthorized");

    const student = await db.student.findUnique({ where: { userId: session.user.id } });
    if (!student) throw new Error("Student profile not found");

    try {
        await db.jobApplication.create({
            data: {
                jobId,
                studentId: student.id,
                resumeUrl,
                status: "PENDING"
            }
        });
        revalidatePath("/student/jobs");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "You have already applied for this position or a system error occurred." };
    }
}
