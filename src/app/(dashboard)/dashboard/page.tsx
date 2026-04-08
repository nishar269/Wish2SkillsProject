import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getRoleDashboardPath } from "@/config/navigation";
import type { Role } from "@/generated/prisma";

export default async function DashboardRedirectPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const dashboardPath = getRoleDashboardPath(session.user.role as Role);
  redirect(dashboardPath);
}
