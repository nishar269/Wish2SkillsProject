import { getStudentFees } from "@/actions/fees";
import ClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default async function StudentFeesPage() {
  const fees = await getStudentFees();
  
  return <ClientPage initialFees={fees} />;
}
