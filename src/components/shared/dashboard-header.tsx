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
    <header className="premium-shell sticky top-0 z-30 flex h-20 items-center justify-between px-5 md:px-6">
      <div className="flex flex-1 items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-[#5a4c38] lg:hidden"
          onClick={onMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="group hidden w-full max-w-md items-center gap-3 rounded-full border border-[hsl(var(--border)/0.95)] bg-white/85 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-all focus-within:border-[hsl(var(--surface-gold)/0.45)] md:flex">
          <Search className="h-4 w-4 text-[#8e7a58] transition-colors group-focus-within:text-[#af8545]" />
          <Input
            placeholder="Search campus records, students, resources..."
            className="h-auto border-0 bg-transparent p-0 text-sm font-medium shadow-none focus-visible:border-0 focus-visible:ring-0"
          />
          <div className="ml-auto flex items-center gap-1.5 rounded-full border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--surface-soft)/0.6)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8e7a58] shadow-sm">
            Ctrl K
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[hsl(var(--border)/0.9)] bg-white/80 text-[#5b4a34] transition-all outline-none hover:border-[hsl(var(--surface-gold)/0.45)] hover:text-[#af8545]"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#c7a46a] shadow-[0_0_12px_rgba(199,164,106,0.7)]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="mt-2 w-80 rounded-[24px] border-[hsl(var(--border)/0.9)] bg-[hsl(var(--card)/0.98)] p-4 shadow-[0_24px_60px_rgba(20,28,45,0.14)]">
            <DropdownMenuLabel className="mb-4 text-sm font-bold">Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator className="mb-4" />
            <div className="py-8 text-center text-xs font-medium italic text-slate-400">
              No new alerts in the feed.
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="mx-1 h-6 w-px bg-[hsl(var(--border)/0.95)]" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-3 rounded-full border border-transparent pl-3 pr-1.5 transition-all outline-none hover:border-[hsl(var(--border)/0.9)] hover:bg-white/55"
            >
              <div className="hidden text-right sm:block">
                <p className="mb-1 text-xs font-semibold leading-none text-slate-900">{user.name}</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] leading-none text-[#9d7b43]">
                  {user.role}
                </p>
              </div>
              <Avatar className="h-10 w-10 cursor-pointer border border-[hsl(var(--surface-gold)/0.35)] shadow-sm transition-transform">
                <AvatarFallback className="bg-[linear-gradient(135deg,#d5b482,#b78c46)] text-[10px] font-bold text-[#131b2c]">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="mt-2 w-64 rounded-[24px] border-[hsl(var(--border)/0.9)] bg-[hsl(var(--card)/0.98)] p-4 shadow-[0_24px_60px_rgba(20,28,45,0.14)]">
            <DropdownMenuLabel className="mb-4 text-sm font-bold text-slate-900">User Profile</DropdownMenuLabel>
            <DropdownMenuSeparator className="mb-4" />
            <DropdownMenuItem className="cursor-pointer rounded-2xl px-3 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-[hsl(var(--surface-soft)/0.65)] hover:text-slate-950">
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer rounded-2xl px-3 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-[hsl(var(--surface-soft)/0.65)] hover:text-slate-950">
              Account Security
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-4" />
            <DropdownMenuItem onClick={onLogout} className="cursor-pointer rounded-2xl px-3 py-2.5 text-xs font-semibold text-red-600 transition-all hover:bg-red-50">
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
