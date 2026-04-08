import { getStudentAttendance } from "@/actions/attendance";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import ClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default async function StudentAttendancePage() {
  const session = await auth();
  if (!session) return null;

  const student = await db.student.findUnique({
    where: { userId: session.user.id }
  });

  if (!student) return null;

  // Get current session student can mark attendance for
  const today = new Date();
  const startOfDay = new Date(today.setHours(0,0,0,0));
  const endOfDay = new Date(today.setHours(23,59,59,999));

  const availableSession = await db.classSession.findFirst({
    where: {
        batchId: student.batchId,
        date: {
            gte: startOfDay,
            lte: endOfDay
        },
        status: "SCHEDULED" // Or ONGOING
    },
    include: {
        subject: true
    }
  });

  const history = await getStudentAttendance();

  return <ClientPage history={history} availableSession={availableSession} />;
}
