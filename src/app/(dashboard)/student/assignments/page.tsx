import { getStudentAssignments } from "@/actions/student-assignments";
import ClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default async function StudentAssignmentsPage() {
  const assignments = await getStudentAssignments();
  
  return <ClientPage initialAssignments={assignments} />;
}
