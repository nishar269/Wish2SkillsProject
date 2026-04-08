import { getStudents } from "@/actions/student-admin";
import { getCourses, getBatches } from "@/actions/admin";
import ClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  const [students, courses, batches] = await Promise.all([
    getStudents(),
    getCourses(),
    getBatches()
  ]);
  
  return (
    <ClientPage 
      initialStudents={students} 
      courses={courses} 
      batches={batches} 
    />
  );
}
