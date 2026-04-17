import { getAdminReportData } from "@/actions/reports";
import ClientPage from "./client-page";

export default async function AuthorityDashboardPage() {
  const data = await getAdminReportData();
  
  // If there's an error (e.g., unauthorized), return null or fallback
  if ("error" in data) return <div>Unauthorized</div>;

  return <ClientPage stats={data} />;
}
