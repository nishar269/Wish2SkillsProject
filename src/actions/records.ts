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
    const recentExports = await db.auditLog.findMany({
        where: { action: { contains: "EXPORT" } },
        orderBy: { createdAt: "desc" },
        take: 5
    });

    return {
        totalPeople: students + faculty,
        archives: archiBatches,
        generatedReports: totalExports,
        recentExports,
        pendingExports: 0
    };
}

function buildCSV(data: Array<Record<string, unknown>>): string {
    if (data.length === 0) return "";
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(row => 
        Object.values(row).map((value) => {
            if (value === null || value === undefined) return '""';
            const str = String(value);
            return str.includes(',') || str.includes('"') || str.includes('\n') 
                ? `"${str.replace(/"/g, '""')}"` 
                : str;
        }).join(",")
    );
    return [headers, ...rows].join("\n");
}

export async function triggerDataExport(type: "STUDENTS" | "FACULTY" | "ATTENDANCE") {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") return { error: "Unauthorized" };

    try {
        let csvData = "";

        if (type === "STUDENTS") {
            const students = await db.student.findMany({ include: { user: true, course: true, batch: true } });
            const flatData = students.map(s => ({
                ID: s.id,
                Name: s.user.name,
                Email: s.user.email,
                EnrollmentNo: s.enrollmentNo ?? "N/A",
                Course: s.course?.name || "N/A",
                Batch: s.batch?.name || "N/A",
            }));
            csvData = buildCSV(flatData);
        } else if (type === "FACULTY") {
            const faculty = await db.faculty.findMany({
                include: {
                    user: true,
                    facultyAssignments: {
                        include: {
                            subject: true,
                        },
                    },
                },
            });
            const flatData = faculty.map(f => ({
                ID: f.id,
                Name: f.user.name,
                Email: f.user.email,
                Specialization: f.specialization || "N/A",
                Subjects: Array.from(new Set(f.facultyAssignments.map((assignment) => assignment.subject.name))).join("; "),
            }));
            csvData = buildCSV(flatData);
        } else if (type === "ATTENDANCE") {
            const attendance = await db.attendance.findMany({ 
                include: { 
                    student: { include: { user: true } }, 
                    session: { include: { subject: true } } 
                } 
            });
            const flatData = attendance.map(a => ({
                Date: a.session.date.toISOString().split("T")[0],
                Subject: a.session.subject.name,
                StudentName: a.student.user.name,
                Status: a.status,
                MarkedAt: a.markedAt ? a.markedAt.toISOString() : "N/A",
            }));
            csvData = buildCSV(flatData);
        }

        await db.auditLog.create({
            data: {
                userId: session.user.id,
                action: `EXPORT_${type}`,
                entity: "DATABASE",
                details: `User generated a full ${type} CSV export. Lines: ${csvData ? csvData.split('\n').length - 1 : 0}`
            }
        });

        return { success: true, csv: csvData, message: `${type} export generated successfully.` };
    } catch (error) {
        console.error("Data Export Error:", error);
        return { error: `Failed to generate ${type} export.` };
    }
}

export async function getArchiveInventory() {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "RECORDS")) {
        throw new Error("Unauthorized");
    }

    const [completedBatches, exportLogs] = await Promise.all([
        db.batch.findMany({
            where: { status: "COMPLETED" },
            orderBy: { updatedAt: "desc" },
            include: {
                course: true,
                _count: {
                    select: {
                        students: true,
                        classSessions: true,
                    },
                },
            },
        }),
        db.auditLog.findMany({
            where: { action: { contains: "EXPORT" } },
            orderBy: { createdAt: "desc" },
            take: 10,
            include: {
                user: {
                    select: {
                        name: true,
                        role: true,
                    },
                },
            },
        }),
    ]);

    return {
        completedBatches,
        exportLogs,
    };
}
