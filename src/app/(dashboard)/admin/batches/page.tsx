import { getBatches, getCourses } from "@/actions/admin";
import ClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default async function BatchesPage() {
  const [batches, courses] = await Promise.all([
    getBatches(),
    getCourses()
  ]);
  
  return <ClientPage initialBatches={batches} courses={courses} />;
}
