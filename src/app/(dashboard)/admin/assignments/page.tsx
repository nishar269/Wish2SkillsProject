import { getAssignments } from "@/actions/faculty-assignment";
import { getFaculty } from "@/actions/faculty-admin";
import { getSubjects } from "@/actions/subject";
import { getBatches } from "@/actions/admin";
import ClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default async function AdminAssignmentsPage() {
  const [assignments, faculty, subjects, batches] = await Promise.all([
    getAssignments(),
    getFaculty(),
    getSubjects(),
    getBatches()
  ]);
  
  return (
    <ClientPage 
      initialAssignments={assignments} 
      facultyMembers={faculty}
      subjects={subjects}
      batches={batches}
    />
  );
}
