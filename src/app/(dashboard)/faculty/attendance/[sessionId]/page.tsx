import { getSessionStudents } from "@/actions/attendance";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import ClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default async function SessionAttendancePage({ params }: { params: { sessionId: string } }) {
  const { sessionId } = params;
  
  const classSession = await db.classSession.findUnique({
    where: { id: sessionId },
    include: {
        batch: true,
        subject: true
    }
  });

  if (!classSession) return notFound();

  const students = await getSessionStudents(sessionId);

  return (
    <ClientPage 
        session={classSession}
        initialStudents={students}
    />
  );
}
