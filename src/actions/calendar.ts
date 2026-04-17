"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  type: "SESSION" | "EXAM" | "ANNOUNCEMENT";
  batch?: string;
  location?: string;
};

export async function getCalendarEvents() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  // Fetch different types of events
  const [sessions, tests, announcements] = await Promise.all([
    db.classSession.findMany({
      include: { subject: true, batch: true },
      where: session.user.role === 'STUDENT' ? { batch: { students: { some: { userId: session.user.id } } } } : {}
    }),
    db.test.findMany({
      include: { subject: true, batch: true },
      where: session.user.role === 'STUDENT' ? { batch: { students: { some: { userId: session.user.id } } } } : {}
    }),
    db.notification.findMany({
      where:
        session.user.role === "STUDENT"
          ? {
              OR: [
                { targetRole: "STUDENT" },
                { targetRole: null, targetBatchId: null },
              ],
            }
          : { targetBatchId: null },
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Transform into a unified "Event" format
  const events: CalendarEvent[] = [
    ...sessions.map(s => ({
      id: s.id,
      title: `Class: ${s.subject.name}`,
      date: s.date,
      type: "SESSION" as const,
      batch: s.batch.name,
      location: s.room || "Online",
    })),
    ...tests.map(t => ({
      id: t.id,
      title: `Exam: ${t.title}`,
      date: t.date,
      type: "EXAM" as const,
      batch: t.batch.name,
    })),
    ...announcements.map((announcement) => ({
      id: announcement.id,
      title: `Announcement: ${announcement.title}`,
      date: announcement.createdAt,
      type: "ANNOUNCEMENT" as const,
      location: "CampusOS",
    })),
  ];

  return events;
}
