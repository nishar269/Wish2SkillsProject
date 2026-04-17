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

export function DashboardSidebar({ items, label, user, onLogout, onLinkClick }: DashboardSidebarProps) {
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
          "h-screen bg-white border-r border-slate-200 transition-all duration-300 flex flex-col relative z-40 shadow-sm",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <span className="block font-bold text-slate-900 tracking-tight truncate">CampusOS</span>
                <span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400 truncate">
                  {label}
                </span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-white transition-all"
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform duration-300", collapsed && "rotate-180")} />
          </button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-6 px-3">
          <nav className="space-y-1">
            {items.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              const link = (
                <Link
                  href={item.href}
                  onClick={onLinkClick}
                  className={cn(
                    "relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group",
                    isActive 
                      ? "bg-blue-50 text-blue-700 font-semibold" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  )}
                >
                  <Icon className={cn("h-5 w-5 shrink-0 transition-colors", isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
                  {!collapsed && (
                    <span className="text-sm truncate">{item.title}</span>
                  )}
                  {isActive && !collapsed && (
                     <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 shadow-sm" />
                  )}
                </Link>
              );

              return collapsed ? (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right" className="font-bold text-xs bg-slate-950 text-white border-none">
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <div key={item.href}>{link}</div>
              );
            })}
          </nav>
        </ScrollArea>

        {/* User Profile */}
        <div className="p-4 mt-auto border-t border-slate-100 bg-slate-50/50">
          <div className={cn(
            "p-3 rounded-xl bg-white border border-slate-200 flex items-center gap-3 transition-all",
            collapsed && "px-1 justify-center border-none bg-transparent"
          )}>
            <Avatar className="h-9 w-9 border border-slate-200 shrink-0">
              <AvatarFallback className="bg-blue-600/10 text-blue-700 text-xs font-bold">{initials}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate leading-none mb-1">{user.name}</p>
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider truncate leading-none">{user.role}</p>
              </div>
            )}
          </div>
          <button
              type="button"
              onClick={onLogout}
              className={cn(
                  "w-full mt-3 flex items-center justify-center gap-2 p-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all text-xs font-bold group",
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
