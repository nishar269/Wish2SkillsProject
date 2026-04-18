"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { GraduationCap, LogOut, ChevronLeft } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import type { SidebarNavItem } from "@/config/navigation";
import { useState } from "react";

interface DashboardSidebarProps {
  items: SidebarNavItem[];
  label: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
  onLogout: () => void;
  onLinkClick?: () => void;
}

export function DashboardSidebar({
  items,
  label,
  user,
  onLogout,
  onLinkClick,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "premium-dark-panel premium-grid relative z-40 m-3 flex h-[calc(100vh-1.5rem)] flex-col overflow-hidden transition-all duration-300",
          collapsed ? "w-24" : "w-72"
        )}
      >
        <div className="flex h-20 items-center border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#d5b482,#b78c46)] shadow-[0_10px_30px_rgba(199,164,106,0.34)]">
              <GraduationCap className="h-5 w-5 text-[#101826]" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <span className="block truncate font-heading text-[1.5rem] leading-none tracking-[-0.04em] text-white">
                  Wish2Skill
                </span>
                <span className="block truncate pt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#c7a46a]">
                  {label}
                </span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-full border border-white/16 bg-white/9 text-[#e3d4bb] transition-all hover:border-[#c7a46a]/45 hover:bg-white/14 hover:text-white"
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform duration-300", collapsed && "rotate-180")} />
          </button>
        </div>

        <ScrollArea className="flex-1 px-4 py-6">
          <nav className="space-y-2">
            {items.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              const link = (
                <Link
                  href={item.href}
                  onClick={onLinkClick}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200",
                    isActive
                      ? "bg-[linear-gradient(135deg,rgba(214,182,123,0.28),rgba(214,182,123,0.12))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-[#d7b67b]/50"
                      : "text-[#e3d4bb] hover:bg-white/11 hover:text-white"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      isActive ? "text-[#f6d8a6]" : "text-[#b7a07a] group-hover:text-[#f6d8a6]"
                    )}
                  />
                  {!collapsed && <span className="truncate text-sm font-medium">{item.title}</span>}
                  {isActive && !collapsed && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-[#f3d29b] shadow-[0_0_14px_rgba(243,210,155,0.7)]" />
                  )}
                </Link>
              );

              return collapsed ? (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right" className="border-none bg-[#101826] text-xs font-semibold text-[#f3e8d4] shadow-xl">
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <div key={item.href}>{link}</div>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="mt-auto border-t border-white/10 p-4">
          <div
            className={cn(
              "flex items-center gap-3 rounded-[22px] border border-white/12 bg-white/9 p-3 transition-all",
              collapsed && "justify-center border-none bg-transparent px-1"
            )}
          >
            <Avatar className="h-10 w-10 shrink-0 border border-[#c7a46a]/30">
              <AvatarFallback className="bg-[linear-gradient(135deg,#d5b482,#b78c46)] text-xs font-bold text-[#111a2b]">
                {initials}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="min-w-0">
                <p className="mb-1 truncate text-sm font-semibold leading-none text-[#fbf5ea]">{user.name}</p>
                <p className="truncate text-[10px] font-semibold uppercase tracking-[0.24em] leading-none text-[#b89b6b]">
                  {user.role}
                </p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onLogout}
            className={cn(
              "group mt-3 flex w-full items-center justify-center gap-2 rounded-2xl p-3 text-xs font-semibold text-[#f2d7be] transition-all hover:bg-[rgba(161,78,59,0.22)] hover:text-white",
              collapsed && "px-0"
            )}
          >
            <LogOut className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-1" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
