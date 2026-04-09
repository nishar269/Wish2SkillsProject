"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/shared/dashboard-sidebar";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { AIAssistant } from "@/components/shared/ai-assistant";
import { getNavConfig } from "@/config/navigation";
import { logoutAction } from "@/actions/auth";
import { Toaster } from "@/components/ui/sonner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Role } from "@/lib/permissions";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navConfig = getNavConfig(user.role as Role);

  const handleLogout = async () => {
    await logoutAction();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <DashboardSidebar
          items={navConfig.mainNav}
          label={navConfig.label}
          user={user}
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 border-none w-72">
          <DashboardSidebar
            items={navConfig.mainNav}
            label={navConfig.label}
            user={user}
            onLogout={handleLogout}
          />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader 
          user={user} 
          onLogout={handleLogout} 
          onMenuToggle={() => setIsMobileMenuOpen(true)} 
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      <Toaster position="top-right" richColors />
      <AIAssistant />
    </div>
  );
}
