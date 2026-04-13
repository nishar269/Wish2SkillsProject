import { getFacultyStudents } from "@/actions/faculty-students";
import FacultyStudentsClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default async function FacultyStudentsPage() {
    const students = await getFacultyStudents();

    return (
        <FacultyStudentsClientPage initialStudents={students} />
    );
}
