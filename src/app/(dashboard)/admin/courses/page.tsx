import { getCourses } from "@/actions/admin";
import ClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = await getCourses();
  
  return <ClientPage initialCourses={courses} />;
}
