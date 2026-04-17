"use client";

import React, { useState, useTransition } from "react";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  GraduationCap,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  Users,
  BookOpen,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  UserCog,
  ClipboardCheck,
} from "lucide-react";

const DEMO_ACCOUNTS = [
  {
    role: "Admin",
    email: "admin@wish2skill.com",
    password: "Password123",
    icon: UserCog,
    color: "bg-blue-600",
    lightColor: "bg-blue-50 text-blue-700 border-blue-200",
    desc: "Full system access",
  },
  {
    role: "Faculty",
    email: "faculty@wish2skill.com",
    password: "Password123",
    icon: BookOpen,
    color: "bg-indigo-600",
    lightColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    desc: "Classes & attendance",
  },
  {
    role: "Student",
    email: "student@wish2skill.com",
    password: "Password123",
    icon: GraduationCap,
    color: "bg-emerald-600",
    lightColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    desc: "Learning dashboard",
  },
  {
    role: "Coordinator",
    email: "coord@wish2skill.com",
    password: "Password123",
    icon: ClipboardCheck,
    color: "bg-amber-600",
    lightColor: "bg-amber-50 text-amber-700 border-amber-200",
    desc: "Batch management",
  },
];

const FEATURES = [
  { icon: Shield, text: "Secure RBAC Authentication" },
  { icon: Users, text: "Multi-Role Dashboard Access" },
  { icon: BarChart3, text: "Real-Time Analytics & Reports" },
  { icon: BookOpen, text: "AI-Powered Learning Tools" },
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await loginAction(formData);
        if (result?.error) {
          setError(result.error);
        } else {
          window.location.href = "/dashboard";
        }
      } catch {
        setError("An unexpected error occurred. Please try again.");
      }
    });
  }

  function fillCredentials(email: string, password: string, role: string) {
    const e = document.getElementById("email") as HTMLInputElement;
    const p = document.getElementById("password") as HTMLInputElement;
    if (e && p) {
      e.value = email;
      p.value = password;
      setSelectedRole(role);
      setError(null);
    }
  }

  return (
    <div className="min-h-screen flex font-sans selection:bg-blue-100">
      {/* Left Panel — Branding & Features */}
      <div className="hidden lg:flex lg:w-[52%] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-32 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px]" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-xl tracking-tight">Wish2Skill</h2>
              <p className="text-blue-400 text-[10px] font-semibold uppercase tracking-[0.2em]">CampusOS Platform</p>
            </div>
          </div>

          {/* Hero Content */}
          <div className="space-y-8 max-w-lg">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                System Online
              </div>
              <h1 className="text-4xl xl:text-5xl font-bold text-white leading-[1.15] tracking-tight">
                AI-Powered Institute{" "}
                <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Management
                </span>
              </h1>
              <p className="text-slate-400 text-base leading-relaxed">
                A comprehensive ERP & LMS solution designed for modern educational institutions.
                Streamline operations, automate workflows, and enhance learning with AI.
              </p>
            </div>

            {/* Feature list */}
            <div className="grid grid-cols-2 gap-3">
              {FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5">
                  <f.icon className="h-4 w-4 text-blue-400 shrink-0" />
                  <span className="text-white/70 text-xs font-medium">{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer stats */}
          <div className="flex items-center gap-8">
            <div>
              <p className="text-2xl font-bold text-white">6</p>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">User Roles</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <p className="text-2xl font-bold text-white">50+</p>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Features</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <p className="text-2xl font-bold text-white">AI</p>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Integrated</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">Wish2Skill</span>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back
            </h1>
            <p className="text-slate-500 text-sm">
              Sign in to access your institute dashboard
            </p>
          </div>

          {/* Quick Role Selector */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Quick Access — Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => fillCredentials(account.email, account.password, account.role)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all duration-200 group ${
                    selectedRole === account.role
                      ? account.lightColor + " border-current shadow-sm"
                      : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    selectedRole === account.role ? account.color + " text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                  }`}>
                    <account.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${selectedRole === account.role ? "" : "text-slate-700"}`}>
                      {account.role}
                    </p>
                    <p className={`text-[10px] ${selectedRole === account.role ? "opacity-70" : "text-slate-400"}`}>
                      {account.desc}
                    </p>
                  </div>
                  {selectedRole === account.role && (
                    <CheckCircle2 className="h-3.5 w-3.5 ml-auto shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white px-3 text-slate-400 font-bold tracking-widest">
                Or enter credentials
              </span>
            </div>
          </div>

          {/* Login Form */}
          <form action={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 text-xs font-semibold border border-red-100">
                <Shield className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-slate-600">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@institution.edu"
                required
                disabled={isPending}
                className="h-11 border-slate-200 focus:border-blue-500 rounded-xl text-sm bg-slate-50 focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-bold text-slate-600">
                  Password
                </Label>
                <button type="button" className="text-[10px] font-bold text-blue-600 hover:text-blue-700">
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  disabled={isPending}
                  className="h-11 border-slate-200 focus:border-blue-500 rounded-xl text-sm pr-11 bg-slate-50 focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 group"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <>
                  Sign In to Dashboard
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="pt-4 text-center space-y-3">
            <p className="text-xs text-slate-400">
              Don&apos;t have an account?{" "}
              <Link href="/" className="text-blue-600 font-bold hover:text-blue-700">
                Contact your Admin
              </Link>
            </p>
            <p className="text-[10px] text-slate-300 font-medium">
              © 2026 Wish2Skill CampusOS — Secure Authentication Protocol
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
