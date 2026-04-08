"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sendNotificationEmail } from "@/lib/mail";

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

    // Async trigger email (don't await for faster response)
    const activeUsers = await db.user.findMany({ select: { email: true }, where: { status: 'ACTIVE' } });
    activeUsers.forEach(user => {
        sendNotificationEmail(
            user.email, 
            `New Announcement: ${data.title}`, 
            "Platform Announcement", 
            data.content, 
            "View Dashboard", 
            `${process.env.NEXTAUTH_URL}/dashboard`
        );
    });

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
