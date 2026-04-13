"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { GraduationCap, LogOut, ChevronLeft, Moon, Sun, Orbit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import type { SidebarNavItem } from "@/config/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (!mounted) return <aside className="h-screen w-72 glass border-r-0" />;

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "h-[calc(100vh-2rem)] m-4 glass rounded-[3rem] transition-all duration-700 flex flex-col relative z-40 overflow-hidden shadow-2xl",
          collapsed ? "w-24" : "w-80"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
        
        {/* Header */}
        <div className="h-24 flex items-center px-8 relative">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-3xl border border-white/10 shadow-lg subtle-glow group">
              <GraduationCap className="h-6 w-6 text-cyan-400 group-hover:rotate-12 transition-transform" />
            </div>
            {!collapsed && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <span className="font-black italic tracking-tighter text-lg uppercase">CampusOS</span>
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-cyan-500 leading-none mt-1">Prime Node</p>
              </motion.div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-white/10 transition-all"
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform duration-700", collapsed && "rotate-180")} />
          </button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-4 py-6 scrollbar-hide">
          <nav className="space-y-3">
            {items.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              const link = (
                <Link
                  href={item.href}
                  onClick={onLinkClick}
                  className={cn(
                    "relative flex items-center gap-4 px-5 py-4 rounded-[1.75rem] transition-all duration-500 group",
                    isActive 
                      ? "bg-white/10 text-white shadow-xl border border-white/10" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-indigo-500/10 rounded-[1.75rem] blur-sm"
                    />
                  )}
                  <Icon className={cn("h-5 w-5 relative z-10 transition-all duration-500", isActive ? "text-cyan-400 scale-110" : "group-hover:text-cyan-400")} />
                  {!collapsed && (
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] relative z-10">{item.title}</span>
                  )}
                  {isActive && (
                     <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,1)]" />
                  )}
                </Link>
              );

              return collapsed ? (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right" className="glass border-white/10 font-black italic uppercase text-[10px] tracking-widest text-cyan-400 px-4 py-2">
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
        <div className="p-6 mt-auto">
          <div className={cn(
            "p-5 rounded-[2.5rem] bg-white/5 border border-white/5 flex items-center gap-4 transition-all duration-700 overflow-hidden",
            collapsed && "px-3"
          )}>
            <Avatar className="h-10 w-10 border-2 border-cyan-500/20 shadow-2xl">
              <AvatarFallback className="bg-slate-900 text-[10px] font-black uppercase tracking-widest text-cyan-400">{initials}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-[10px] font-black italic uppercase text-white truncate leading-none mb-1">{user.name}</p>
                <p className="text-[8px] font-black uppercase tracking-widest text-cyan-500 truncate leading-none">{user.role}</p>
              </div>
            )}
          </div>
          <button
              onClick={onLogout}
              className={cn(
                  "w-full mt-4 flex items-center justify-center gap-3 p-4 rounded-2xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-500 text-[10px] font-black uppercase tracking-widest group",
                  collapsed && "px-2"
              )}
          >
              <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              {!collapsed && <span>Identify Terminal</span>}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
