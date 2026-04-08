import { getPendingLeaves } from "@/actions/leave";
import ClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default async function AdminLeavePage() {
  const leaves = await getPendingLeaves();
  
  return <ClientPage initialLeaves={leaves} />;
}
