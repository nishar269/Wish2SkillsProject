"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getMyLeaveRequests() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  return await db.leaveRequest.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" }
  });
}

export async function applyForLeave(data: { type: string, reason: string, start: string, end: string }) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  try {
    await db.leaveRequest.create({
      data: {
        userId: session.user.id,
        type: data.type,
        reason: data.reason,
        startDate: new Date(data.start),
        endDate: new Date(data.end),
        status: "PENDING"
      }
    });

    revalidatePath("/student/leave");
    revalidatePath("/faculty/leave");
    return { success: true };
  } catch (error) {
    return { error: "Failed to submit leave request." };
  }
}

export async function getPendingLeaves() {
    const session = await auth();
    // Faculty can see their batch students' leaves? Or Admin?
    // For now, let's allow Admin/Faculty to see all pending
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "COORDINATOR" && session.user.role !== "FACULTY")) {
        throw new Error("Unauthorized");
    }

    return await db.leaveRequest.findMany({
        where: { status: "PENDING" },
        include: { user: { select: { name: true, role: true, email: true } } },
        orderBy: { createdAt: "asc" }
    });
}

export async function processLeaveRequest(id: string, status: "APPROVED" | "REJECTED", remarks?: string) {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "COORDINATOR" && session.user.role !== "FACULTY")) {
        throw new Error("Unauthorized");
    }

    try {
        await db.leaveRequest.update({
            where: { id },
            data: { 
                status: status as any,
                remarks 
            }
        });

        revalidatePath("/admin/leave");
        revalidatePath("/faculty/leave");
        return { success: true };
    } catch (error) {
        return { error: "Failed to process request." };
    }
}
