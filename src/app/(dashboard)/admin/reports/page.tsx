import { getAdminReportData } from "@/actions/reports";
import AdminReportsClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const data = await getAdminReportData();
  
  if ("error" in data) return <div>{data.error}</div>;

  return <AdminReportsClientPage data={data} />;
}
