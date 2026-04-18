import { getAdminReportData } from "@/actions/reports";
import AdminReportsClientPage from "../../admin/reports/client-page";

export const dynamic = "force-dynamic";

export default async function RecordsReportsPage() {
  const data = await getAdminReportData();

  if ("error" in data) {
    return <div className="p-8 text-rose-500">{data.error}</div>;
  }

  return <AdminReportsClientPage data={data} />;
}
