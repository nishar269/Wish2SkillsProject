import { getFaculty } from "@/actions/faculty-admin";
import ClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default async function FacultyPage() {
  const facultyList = await getFaculty();
  
  return <ClientPage initialFaculty={facultyList} />;
}
