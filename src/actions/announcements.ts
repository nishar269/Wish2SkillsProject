"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getAnnouncements() {
  return await db.announcement.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } }
  });
}

export async function createAnnouncement(data: { title: string, content: string, type: string }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");

  try {
    await db.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        type: data.type,
        authorId: session.user.id,
      }
    });

    revalidatePath("/admin/announcements");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Failed to post announcement." };
  }
}

export async function deleteAnnouncement(id: string) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");
    
    try {
        await db.announcement.delete({ where: { id } });
        revalidatePath("/admin/announcements");
        return { success: true };
    } catch (error) {
        return { error: "Failed to delete announcement." };
    }
}
