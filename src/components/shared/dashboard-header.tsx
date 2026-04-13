"use client";

import { Bell, Search, Menu, Command, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
  onMenuToggle?: () => void;
  onLogout: () => void;
}

export function DashboardHeader({ user, onMenuToggle, onLogout }: DashboardHeaderProps) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-28 flex items-center px-10 relative z-30">
      <div className="w-full h-20 glass rounded-[2.5rem] px-8 flex items-center justify-between shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent pointer-events-none" />
        
        {/* Search */}
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden w-12 h-12 rounded-2xl bg-white/5 border border-white/10"
            onClick={onMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden lg:flex items-center gap-4 bg-white/5 rounded-2xl px-6 py-3 w-[450px] border border-white/5 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all group">
            <Search className="h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
            <Input
              placeholder="Query Intelligence Node..."
              className="border-0 bg-transparent h-auto p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-[11px] font-black uppercase tracking-[0.2em] placeholder:text-slate-600"
            />
            <div className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900 border border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-500">
               <Command className="h-3 w-3" /> K
            </div>
          </div>
        </div>

        {/* Intelligence Actions */}
        <div className="flex items-center gap-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative w-12 h-12 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-white/10 transition-all outline-none group">
                  <Bell className="h-5 w-5 transition-transform group-hover:rotate-12" />
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,1)] border-2 border-[#020617]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 glass rounded-[2rem] border-white/10 p-4 mt-2 shadow-2xl">
              <DropdownMenuLabel className="font-black italic uppercase tracking-tighter text-sm mb-4">Signal Flow</DropdownMenuLabel>
              <DropdownMenuSeparator className="opacity-10 mb-4" />
              <div className="py-12 text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic">
                Inbound Stream: Silent
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-10 w-px bg-white/10 mx-2" />

          {/* User Node */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-4 p-2 pl-4 rounded-[1.75rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all outline-none group">
                <div className="text-right hidden md:block">
                  <p className="text-[10px] font-black italic uppercase text-white leading-none mb-1">{user.name}</p>
                  <p className="text-[8px] font-black uppercase tracking-[0.3em] text-cyan-500 leading-none">Access Active</p>
                </div>
                <Avatar className="h-10 w-10 border-2 border-cyan-500/20 shadow-xl transition-transform group-hover:scale-110">
                  <AvatarFallback className="bg-slate-900 text-[10px] font-black uppercase tracking-widest text-cyan-400">{initials}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 glass rounded-[2rem] border-white/10 p-4 mt-2 shadow-2xl">
              <DropdownMenuLabel className="font-black italic uppercase tracking-tighter text-sm mb-4">Node Profile</DropdownMenuLabel>
              <DropdownMenuSeparator className="opacity-10 mb-4" />
              <DropdownMenuItem className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 hover:text-cyan-400 transition-colors cursor-pointer">
                Terminal Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 hover:text-cyan-400 transition-colors cursor-pointer">
                Security Audit
              </DropdownMenuItem>
              <DropdownMenuSeparator className="opacity-10 my-4" />
              <DropdownMenuItem onClick={onLogout} className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer">
                Terminate Stream
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
