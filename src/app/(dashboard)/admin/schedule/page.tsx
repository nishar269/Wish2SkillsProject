import { getClassSessions } from "@/actions/schedule-admin";
import { getBatches } from "@/actions/admin";
import { getSubjects } from "@/actions/subject";
import { getFaculty } from "@/actions/faculty-admin";
import ClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const [sessions, batches, subjects, faculty] = await Promise.all([
    getClassSessions(),
    getBatches(),
    getSubjects(),
    getFaculty()
  ]);
  
  return (
    <ClientPage 
      initialSessions={sessions} 
      batches={batches}
      subjects={subjects}
      facultyMembers={faculty}
    />
  );
}
