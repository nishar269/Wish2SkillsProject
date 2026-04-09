import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/shared/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <DashboardShell
      user={{
        name: session.user.name || "User",
        email: session.user.email || "",
        role: session.user.role || "STUDENT",
      }}
    >
      {children}
    </DashboardShell>
  );
}
