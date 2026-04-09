import { getAllFees, getStudentsForFees } from "@/actions/fees";
import AdminFeesClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default async function AdminFeesPage() {
  const [fees, students] = await Promise.all([
      getAllFees(),
      getStudentsForFees()
  ]);

  return <AdminFeesClientPage initialFees={fees} students={students} />;
}
