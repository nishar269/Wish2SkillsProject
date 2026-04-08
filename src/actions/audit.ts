"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function logAction(action: string, entity: string, entityId?: string, details?: string) {
  const session = await auth();
  if (!session) return;

  try {
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action,
        entity,
        entityId,
        details,
      }
    });
  } catch (error) {
    console.error("Audit Log Error:", error);
  }
}

export async function getAuditLogs() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  return await db.auditLog.findMany({
    include: { user: { select: { name: true, role: true } } },
    orderBy: { createdAt: "desc" },
    take: 100
  });
}
