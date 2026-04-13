import { getStudentPerformanceData } from "@/actions/performance";
import StudentPerformanceClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default async function PerformancePage() {
  const data = await getStudentPerformanceData();
  
  if ("error" in data) return <div>{data.error}</div>;

  return <StudentPerformanceClientPage data={data} />;
}
