import { getSubjects } from "@/actions/subject";
import { getCourses } from "@/actions/admin";
import ClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default async function SubjectsPage() {
  const [subjects, courses] = await Promise.all([
    getSubjects(),
    getCourses()
  ]);
  
  return <ClientPage initialSubjects={subjects} courses={courses} />;
}
