"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function getFacultyStudents() {
    const session = await auth();
    if (!session || session.user.role !== "FACULTY") {
        throw new Error("Unauthorized");
    }

    const faculty = await db.faculty.findUnique({
        where: { userId: session.user.id },
        include: {
            facultyAssignments: {
                include: {
                    batch: {
                        include: {
                            students: {
                                include: {
                                    user: true,
                                    course: true,
                                    batch: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!faculty) throw new Error("Faculty profile not found");

    // Flatten students from all assigned batches and remove duplicates
    const studentMap = new Map();
    faculty.facultyAssignments.forEach(fa => {
        fa.batch.students.forEach(student => {
            if (!studentMap.has(student.id)) {
                studentMap.set(student.id, student);
            }
        });
    });

    return Array.from(studentMap.values());
}
