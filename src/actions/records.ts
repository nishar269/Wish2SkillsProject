"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function getRecordsStats() {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "RECORDS")) {
        throw new Error("Unauthorized");
    }

    const students = await db.student.count();
    const faculty = await db.faculty.count();
    const archiBatches = await db.batch.count({ where: { status: "COMPLETED" } });
    const totalExports = await db.auditLog.count({ where: { action: { contains: "EXPORT" } } });

    return {
        totalPeople: students + faculty,
        archives: archiBatches,
        generatedReports: totalExports,
        pendingExports: 0
    };
}

export async function triggerDataExport(type: "STUDENTS" | "FACULTY" | "ATTENDANCE") {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };

    // In a real system, this would generate a CSV and return a URL or stream.
    // For now, we log the action to make it dynamic.
    await db.auditLog.create({
        data: {
            userId: session.user.id,
            action: `EXPORT_${type}`,
            entity: "DATABASE",
            details: `User initiated a full ${type} export.`
        }
    });

    return { success: true, message: `${type} export started. Check back in a few moments.` };
}
