"use client";

import { useState, useTransition } from "react";
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

import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DEMO_ACCOUNTS = [
  {
    role: "Admin",
    email: "admin@wish2skill.com",
    password: "Password123",
    icon: UserCog,
    desc: "Full system access",
  },
  {
    role: "Faculty",
    email: "faculty@wish2skill.com",
    password: "Password123",
    icon: BookOpen,
    desc: "Classes and attendance",
  },
  {
    role: "Student",
    email: "student@wish2skill.com",
    password: "Password123",
    icon: GraduationCap,
    desc: "Learning dashboard",
  },
  {
    role: "Coordinator",
    email: "coord@wish2skill.com",
    password: "Password123",
    icon: ClipboardCheck,
    desc: "Batch management",
  },
];

const FEATURES = [
  { icon: Shield, text: "Secure RBAC Authentication" },
  { icon: Users, text: "Multi-Role Dashboard Access" },
  { icon: BarChart3, text: "Real-Time Analytics and Reports" },
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
    const emailInput = document.getElementById("email") as HTMLInputElement | null;
    const passwordInput = document.getElementById("password") as HTMLInputElement | null;

    if (emailInput && passwordInput) {
      emailInput.value = email;
      passwordInput.value = password;
      setSelectedRole(role);
      setError(null);
    }
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        <div className="premium-dark-panel premium-grid relative m-4 hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-[#c7a46a]/18 blur-3xl" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#d5b482,#b78c46)] text-[#131b2c] shadow-[0_12px_30px_rgba(199,164,106,0.3)]">
              <GraduationCap className="h-7 w-7" />
            </div>
            <div>
              <h2 className="premium-title text-[2rem] leading-none text-white">Wish2Skill</h2>
              <p className="pt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#c7a46a]">
                CampusOS Platform
              </p>
            </div>
          </div>

          <div className="relative z-10 max-w-xl space-y-8">
            <div className="premium-kicker border-white/10 bg-white/8 text-[#d9cbb2]">
              <div className="h-2 w-2 rounded-full bg-[#c7a46a]" />
              Institution Control Layer
            </div>

            <div className="space-y-5">
              <h1 className="premium-title text-6xl leading-[0.96] text-white xl:text-7xl">
                Secure institutional access with a premium command-room feel.
              </h1>
              <p className="max-w-lg text-lg leading-relaxed text-[#d6c5aa]">
                Sign in to an environment built for administrators, faculty, students and coordinators. Clean operations, premium presence, no visual clutter.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {FEATURES.map((feature) => (
                <div key={feature.text} className="rounded-[22px] border border-white/8 bg-white/6 px-4 py-4">
                  <feature.icon className="mb-3 h-5 w-5 text-[#f0d6a5]" />
                  <span className="text-sm leading-snug text-[#e8dcc7]">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-4">
            {[
              { value: "6", label: "roles" },
              { value: "GPS", label: "verified" },
              { value: "AI", label: "guided" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-[22px] border border-white/8 bg-white/6 px-4 py-4">
                <p className="premium-title text-3xl text-white">{stat.value}</p>
                <p className="pt-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#bda174]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-10 md:px-10">
          <div className="premium-shell w-full max-w-xl px-7 py-8 md:px-10 md:py-10">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#d5b482,#b78c46)] text-[#131b2c]">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <div className="premium-title text-3xl text-[#141c2d]">Wish2Skill</div>
                <div className="pt-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#9d7b43]">
                  CampusOS
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="premium-kicker border-[#e0d5c4] bg-white/65 text-[#9d7b43]">Secure Access</div>
              <h1 className="premium-title pt-3 text-5xl text-[#141c2d]">Welcome back</h1>
              <p className="text-sm leading-relaxed text-[#665843]">
                Sign in to enter the institutional workspace. Access is role-governed and tuned to your dashboard.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#92754a]">
                Quick Demo Access
              </p>
              <div className="grid grid-cols-2 gap-3">
                {DEMO_ACCOUNTS.map((account) => (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => fillCredentials(account.email, account.password, account.role)}
                    className={`group flex items-center gap-3 rounded-[22px] border px-4 py-3 text-left transition-all ${
                      selectedRole === account.role
                        ? "border-[#c7a46a] bg-[rgba(199,164,106,0.16)] text-[#141c2d] shadow-[0_12px_30px_rgba(183,140,70,0.12)]"
                        : "border-[#e3d8c9] bg-white/72 hover:border-[#ccb083] hover:bg-white"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-colors ${
                        selectedRole === account.role
                          ? "bg-[linear-gradient(135deg,#d5b482,#b78c46)] text-[#131b2c]"
                          : "bg-[#f2eadf] text-[#8f6c35] group-hover:bg-[#ede1cd]"
                      }`}
                    >
                      <account.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{account.role}</p>
                      <p className="pt-1 text-[11px] text-[#6d5f48]">{account.desc}</p>
                    </div>
                    {selectedRole === account.role && (
                      <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-[#8f6c35]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#e4dacb]" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#f6f1e8] px-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#9b8060]">
                  Or use your credentials
                </span>
              </div>
            </div>

            <form action={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
                  <Shield className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b694e]">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@institution.edu"
                  required
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b694e]">
                    Password
                  </Label>
                  <Link href="/forgot-password" className="text-[11px] font-semibold text-[#9d7b43] hover:text-[#141c2d]">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    disabled={isPending}
                    className="pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8d7857] transition-colors hover:text-[#141c2d]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={isPending} size="lg" className="w-full">
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Enter Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="pt-6 text-center">
              <p className="text-xs text-[#7b6a51]">
                Need access?{" "}
                <Link href="/" className="font-semibold text-[#9d7b43] hover:text-[#141c2d]">
                  Contact your administrator
                </Link>
              </p>
              <p className="pt-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#b39a75]">
                (c) 2026 Wish2Skill CampusOS
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
