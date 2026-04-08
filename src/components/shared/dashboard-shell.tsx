"use client";

import { useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/shared/dashboard-sidebar";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { AIAssistant } from "@/components/shared/ai-assistant";
import { getNavConfig } from "@/config/navigation";
import { logoutAction } from "@/actions/auth";
import { Toaster } from "@/components/ui/sonner";
import type { Role } from "@/generated/prisma";

interface DashboardShellProps {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export function DashboardShell({ children, user }: DashboardShellProps) {
  const router = useRouter();
  const navConfig = getNavConfig(user.role as Role);

  const handleLogout = async () => {
    await logoutAction();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <div className="hidden lg:flex">
        <DashboardSidebar
          items={navConfig.mainNav}
          label={navConfig.label}
          user={user}
          onLogout={handleLogout}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader user={user} onLogout={handleLogout} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      <Toaster position="top-right" richColors />
      <AIAssistant />
    </div>
  );
}
