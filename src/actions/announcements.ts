"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sendNotificationEmail } from "@/lib/mail";

const announcementTypeMap = {
  GENERAL: "INFO",
  ACADEMIC: "SUCCESS",
  URGENT: "URGENT",
} as const;

type AnnouncementTone = keyof typeof announcementTypeMap;

export async function getAnnouncements() {
  return await db.notification.findMany({
    where: {
      targetBatchId: null,
      targetRole: null,
    },
    orderBy: { createdAt: "desc" },
    include: { creator: { select: { name: true } } },
  });
}

export async function createAnnouncement(data: {
  title: string;
  content: string;
  type: AnnouncementTone;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");

  try {
    await db.notification.create({
      data: {
        title: data.title,
        message: data.content,
        type: announcementTypeMap[data.type],
        createdBy: session.user.id,
      },
    });

    revalidatePath("/admin/announcements");
    revalidatePath("/student/notifications");
    revalidatePath("/student");

    // Async trigger email (don't await for faster response)
    const activeUsers = await db.user.findMany({
      select: { email: true },
      where: { status: "ACTIVE" },
    });
    activeUsers.forEach((user) => {
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
  } catch {
    return { error: "Failed to post announcement." };
  }
}

export async function deleteAnnouncement(id: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");

  try {
    await db.notification.delete({ where: { id } });
    revalidatePath("/admin/announcements");
    revalidatePath("/student/notifications");
    revalidatePath("/student");
    return { success: true };
  } catch {
    return { error: "Failed to delete announcement." };
  }
}
