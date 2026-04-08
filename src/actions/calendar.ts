"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

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
    db.announcement.findMany({
        take: 10,
        orderBy: { createdAt: "desc" }
    })
  ]);

  // Transform into a unified "Event" format
  const events = [
    ...sessions.map(s => ({
      id: s.id,
      title: `Class: ${s.subject.name}`,
      date: s.date,
      type: "SESSION",
      batch: s.batch.name,
      location: s.room || "Online"
    })),
    ...tests.map(t => ({
      id: t.id,
      title: `Exam: ${t.title}`,
      date: t.date,
      type: "EXAM",
      batch: t.batch.name
    }))
  ];

  return events;
}
