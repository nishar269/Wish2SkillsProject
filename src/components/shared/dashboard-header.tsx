"use client";

import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Search */}
      <div className="flex items-center gap-4 flex-1">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-10 w-10 text-slate-500"
          onClick={onMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="hidden md:flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2 w-full max-w-sm border border-slate-200 focus-within:ring-2 focus-within:ring-blue-100 transition-all group">
          <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <Input
            placeholder="Search resources..."
            className="border-0 bg-transparent h-auto p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-medium placeholder:text-slate-400"
          />
          <div className="ml-auto flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest shadow-sm">
             ⌘K
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition-all outline-none">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-blue-600 border-2 border-white shadow-sm" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 rounded-2xl border-slate-200 p-4 mt-2 shadow-xl bg-white">
            <DropdownMenuLabel className="font-bold text-sm mb-4">Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator className="mb-4" />
            <div className="py-8 text-center text-xs font-medium text-slate-400 italic">
              No new alerts in the feed.
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px bg-slate-200 mx-1" />

        {/* User Node */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 p-1 padding-left-3 rounded-full hover:bg-slate-50 transition-all outline-none border border-transparent hover:border-slate-200 pl-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-none mb-1">{user.name}</p>
                <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest leading-none">Account Level</p>
              </div>
              <Avatar className="h-8 w-8 border border-slate-200 shadow-sm transition-transform cursor-pointer">
                <AvatarFallback className="bg-blue-600 text-white text-[10px] font-bold">{initials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 rounded-2xl border-slate-200 p-4 mt-2 shadow-xl bg-white">
            <DropdownMenuLabel className="font-bold text-sm mb-4 text-slate-900">User Profile</DropdownMenuLabel>
            <DropdownMenuSeparator className="mb-4" />
            <DropdownMenuItem className="rounded-lg px-3 py-2 text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer">
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg px-3 py-2 text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer">
              Account Security
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-4" />
            <DropdownMenuItem onClick={onLogout} className="rounded-lg px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 transition-all cursor-pointer">
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
