"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getStudentAssignments() {
    const session = await auth();
    if (!session || session.user.role !== "STUDENT") throw new Error("Unauthorized");

    const student = await db.student.findUnique({
        where: { userId: session.user.id }
    });

    if (!student) throw new Error("Student profile not found");

    return await db.assignment.findMany({
        where: { batchId: student.batchId },
        include: {
            subject: true,
            faculty: { include: { user: true } },
            submissions: {
                where: { studentId: student.id }
            }
        },
        orderBy: { dueDate: "asc" }
    });
}

export async function submitAssignment(assignmentId: string, fileUrl: string) {
    const session = await auth();
    if (!session || session.user.role !== "STUDENT") throw new Error("Unauthorized");

    const student = await db.student.findUnique({
        where: { userId: session.user.id }
    });

    if (!student) throw new Error("Student profile not found");

    try {
        await db.assignmentSubmission.upsert({
            where: {
                assignmentId_studentId: {
                    assignmentId,
                    studentId: student.id
                }
            },
            update: {
                fileUrl,
                submittedAt: new Date(),
                status: "SUBMITTED"
            },
            create: {
                assignmentId,
                studentId: student.id,
                fileUrl,
                status: "SUBMITTED"
            }
        });

        revalidatePath("/student/assignments");
        return { success: true };
    } catch (error) {
        return { error: "Failed to submit assignment." };
    }
}
