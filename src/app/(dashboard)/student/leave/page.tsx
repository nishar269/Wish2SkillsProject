import { getMyLeaveRequests } from "@/actions/leave";
import ClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default async function StudentLeavePage() {
  const leaves = await getMyLeaveRequests();
  
  return <ClientPage initialLeaves={leaves} />;
}
