import { getFacultyClasses } from "@/actions/faculty-classes";
import FacultyClassesClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default async function FacultyClassesPage() {
  const sessions = await getFacultyClasses();
  
  if ("error" in sessions) return <div>{sessions.error}</div>;

  return <FacultyClassesClientPage initialSessions={sessions} />;
}
