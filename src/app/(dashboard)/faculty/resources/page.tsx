import { getMaterials } from "@/actions/materials";
import { getSubjects } from "@/actions/subject";
import { auth } from "@/lib/auth";
import ClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default async function FacultyResourcesPage() {
  const session = await auth();
  if (!session) return null;

  const [materials, subjects] = await Promise.all([
    getMaterials(),
    getSubjects()
  ]);

  return <ClientPage initialMaterials={materials} subjects={subjects} />;
}
