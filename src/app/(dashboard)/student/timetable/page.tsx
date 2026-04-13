import { getStudentTimetable } from "@/actions/timetable";
import StudentTimetableClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default async function TimetablePage() {
  const sessions = await getStudentTimetable();
  
  if ("error" in sessions) return <div>{sessions.error}</div>;

  return <StudentTimetableClientPage initialSessions={sessions} />;
}
