import { getFacultyAssignments } from "@/actions/assignments";
import { getBatches } from "@/actions/admin";
import { getSubjects } from "@/actions/subject";
import ClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default async function FacultyAssignmentsPage() {
  const [assignments, batches, subjects] = await Promise.all([
    getFacultyAssignments(),
    getBatches(),
    getSubjects()
  ]);

  return <ClientPage 
    initialAssignments={assignments} 
    batches={batches} 
    subjects={subjects} 
  />;
}
