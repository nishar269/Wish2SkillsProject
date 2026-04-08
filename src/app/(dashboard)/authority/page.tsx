import { auth } from "@/lib/auth";
import ClientPage from "./client-page";

export default async function AuthorityDashboardPage() {
  const session = await auth();

  // In a real app, you'd fetch real aggregation queries from Prisma here
  const stats = {}; 

  return <ClientPage stats={stats} />;
}
