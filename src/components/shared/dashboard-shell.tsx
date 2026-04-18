"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { DashboardSidebar } from "@/components/shared/dashboard-sidebar";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { getNavConfig } from "@/config/navigation";
import { logoutAction } from "@/actions/auth";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Role } from "@/lib/permissions";

const AIAssistant = dynamic(
  () => import("./ai-assistant").then((m) => m.AIAssistant),
  { ssr: false, loading: () => null }
);

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
    <div className="flex min-h-svh overflow-hidden bg-transparent">
      <div className="hidden lg:flex">
        <DashboardSidebar
          items={navConfig.mainNav}
          label={navConfig.label}
          user={user}
          onLogout={handleLogout}
        />
      </div>

      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-80 border-none bg-transparent p-0 shadow-none">
          <DashboardSidebar
            items={navConfig.mainNav}
            label={navConfig.label}
            user={user}
            onLogout={handleLogout}
            onLinkClick={() => setIsMobileMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(214,182,123,0.22),transparent_26%),radial-gradient(circle_at_top_left,rgba(96,134,120,0.1),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_34%)]" />
        <div className="relative flex h-full flex-col overflow-hidden px-3 py-3 md:px-4">
          <DashboardHeader
            user={user}
            onLogout={handleLogout}
            onMenuToggle={() => setIsMobileMenuOpen(true)}
          />

          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-7xl px-2 py-5 md:px-4 md:py-6">{children}</div>
          </main>
        </div>
      </div>

      <AIAssistant />
    </div>
  );
}
