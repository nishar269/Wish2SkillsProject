import { getFacultyTests } from "@/actions/tests";
import { getBatches } from "@/actions/admin";
import { getSubjects } from "@/actions/subject";
import ClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default async function FacultyTestsPage() {
  const [tests, batches, subjects] = await Promise.all([
    getFacultyTests(),
    getBatches(),
    getSubjects()
  ]);

  return <ClientPage 
    initialTests={tests} 
    batches={batches} 
    subjects={subjects} 
  />;
}
