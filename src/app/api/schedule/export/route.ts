import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

type ExportSession = {
  id: string;
  date: Date;
  room: string | null;
  subject: { name: string };
  faculty?: { user: { name: string } };
  batch?: { name: string };
};

export async function GET() {
  try {
    const session = await auth();
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const userId = session.user.id;
    const role = session.user.role;
    let sessions: ExportSession[] = [];

    // Fetch classes based on role
    if (role === "STUDENT") {
      const student = await db.student.findUnique({
        where: { userId },
        include: {
          batch: {
            include: {
              classSessions: {
                where: { date: { gte: new Date() } },
                include: { subject: true, faculty: { include: { user: true } } }
              }
            }
          }
        }
      });
      if (student?.batch) {
        sessions = student.batch.classSessions;
      }
    } else if (role === "FACULTY") {
      const faculty = await db.faculty.findUnique({
        where: { userId },
        include: {
          classSessions: {
            where: { date: { gte: new Date() } },
            include: { subject: true, batch: true }
          }
        }
      });
      if (faculty) {
        sessions = faculty.classSessions;
      }
    } else {
        return new NextResponse("Role not supported for calendar sync", { status: 400 });
    }

    if (sessions.length === 0) {
        return new NextResponse("No upcoming sessions found.", { status: 404 });
    }

    // Build standard ICS string
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Wish2Skill CampusOS//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH"
    ];

    sessions.forEach((s) => {
      // Create a 1.5 hr block for classes by default or use standard
      const startDate = new Date(s.date);
      const endDate = new Date(startDate.getTime() + 90 * 60000); // 90 minutes
      
      const formatIcsDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      const dtStart = formatIcsDate(startDate);
      const dtEnd = formatIcsDate(endDate);
      const uid = `${s.id}@wish2skill.com`;

      icsContent.push(
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${formatIcsDate(new Date())}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${s.subject.name} - Class`,
        `DESCRIPTION:${role === 'STUDENT' ? 'Prof. ' + (s.faculty?.user.name || 'Faculty') : 'Batch: ' + (s.batch?.name || 'N/A')}`,
        `LOCATION:${s.room || 'Campus'}`,
        "END:VEVENT"
      );
    });

    icsContent.push("END:VCALENDAR");

    return new NextResponse(icsContent.join("\r\n"), {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'attachment; filename="campusos-schedule.ics"',
      },
    });
  } catch (error) {
    console.error("Calendar Sync Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
