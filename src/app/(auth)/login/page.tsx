"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Shield,
  UserCog,
  Users,
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
    desc: "System and operations",
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
  { icon: Shield, text: "Role-Governed Authentication" },
  { icon: Users, text: "Multi-Role Portal Access" },
  { icon: BarChart3, text: "Analytics and Command Views" },
  { icon: BookOpen, text: "Academic Operations and AI" },
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister().catch(() => undefined);
      });
    });

    if ("caches" in window) {
      caches.keys().then((keys) => {
        keys
          .filter((key) => key.startsWith("wish2skill-"))
          .forEach((key) => {
            caches.delete(key).catch(() => undefined);
          });
      });
    }
  }, []);

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
    <div className="relative min-h-screen overflow-hidden bg-transparent text-[#f4ede0]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(214,182,123,0.18),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(70,130,113,0.14),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_34%)]" />
      <div className="relative grid min-h-screen lg:grid-cols-[1.06fr_0.94fr]">
        <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-14">
          <div className="absolute left-12 top-12 h-44 w-44 rounded-full bg-[#d2ae6d]/18 blur-3xl" />
          <div className="absolute bottom-16 right-10 h-52 w-52 rounded-full bg-[#4a8c78]/12 blur-3xl" />

          <div className="relative z-10 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#d9b97c,#b78c46)] text-[#09111d] shadow-[0_18px_50px_rgba(183,140,70,0.26)]">
              <GraduationCap className="h-7 w-7" />
            </div>
            <div>
              <h2 className="premium-title text-[2.35rem] leading-none text-white">Wish2Skill</h2>
              <p className="pt-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c8a46a]">
                CampusOS
              </p>
            </div>
          </div>

          <div className="relative z-10 max-w-2xl space-y-8">
            <div className="premium-kicker border-white/14 bg-white/9 text-[#e6d8bf]">
              <div className="h-2 w-2 rounded-full bg-[#c8a46a]" />
              Premium Institutional Access
            </div>

            <div className="space-y-5">
              <h1 className="premium-title text-6xl leading-[0.92] text-white xl:text-[5.5rem]">
                Dark, precise, premium.
                <span className="block text-[#d8b06a]">The login experience now looks like the product should.</span>
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-[#ddd1bc]">
                One clean access layer for administrators, faculty, students and coordinators. No neon gimmicks, no outdated sci-fi skin, just a controlled premium interface.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {FEATURES.map((feature) => (
                <div key={feature.text} className="rounded-[24px] border border-white/12 bg-white/[0.075] px-5 py-5 backdrop-blur-sm">
                  <feature.icon className="mb-4 h-5 w-5 text-[#e0bf8a]" />
                  <p className="text-sm leading-snug text-[#efe3cf]">{feature.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 grid max-w-xl grid-cols-3 gap-4">
            {[
              { value: "4", label: "live roles" },
              { value: "RBAC", label: "secured" },
              { value: "AI", label: "assisted" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-[24px] border border-white/12 bg-white/[0.075] px-4 py-4 backdrop-blur-sm">
                <p className="premium-title text-3xl text-white">{stat.value}</p>
                <p className="pt-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#b99c6f]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-10 md:px-10 lg:px-14">
          <div className="w-full max-w-xl rounded-[34px] border border-white/14 bg-[linear-gradient(180deg,rgba(24,35,54,0.92),rgba(14,23,37,0.95))] p-7 shadow-[0_28px_100px_rgba(0,0,0,0.3)] backdrop-blur-xl md:p-10">
            <div className="mb-8 flex items-center gap-4 lg:hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#d9b97c,#b78c46)] text-[#09111d]">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <div className="premium-title text-3xl text-white">Wish2Skill</div>
                <div className="pt-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#b99c6f]">
                  CampusOS
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="premium-kicker border-white/14 bg-white/[0.08] text-[#e4d5bd]">Secure Access</div>
              <h1 className="premium-title pt-3 text-5xl text-white">Welcome back</h1>
              <p className="text-sm leading-relaxed text-[#d0c2ac]">
                Sign in to the institutional workspace. Access is role-governed and routed to the correct dashboard after verification.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#b99c6f]">
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
                        ? "border-[#c8a46a] bg-[rgba(199,164,106,0.16)] text-white shadow-[0_12px_30px_rgba(183,140,70,0.14)]"
                        : "border-white/12 bg-white/[0.07] hover:border-[#8c6b37] hover:bg-white/[0.11]"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-colors ${
                        selectedRole === account.role
                          ? "bg-[linear-gradient(135deg,#d9b97c,#b78c46)] text-[#09111d]"
                          : "bg-white/[0.12] text-[#e2bf85] group-hover:bg-white/[0.17]"
                      }`}
                    >
                      <account.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{account.role}</p>
                      <p className="pt-1 text-[11px] text-[#d0c2ac]">{account.desc}</p>
                    </div>
                    {selectedRole === account.role && (
                      <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-[#d7b170]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#132033] px-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#b59a70]">
                  Or use your credentials
                </span>
              </div>
            </div>

            <form action={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-200">
                  <Shield className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a99574]">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@institution.edu"
                  required
                  disabled={isPending}
                  className="border-white/10 bg-white/[0.05] text-white placeholder:text-[#6f7a8e] focus-visible:bg-white/[0.08]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a99574]">
                    Password
                  </Label>
                  <Link href="/forgot-password" className="text-[11px] font-semibold text-[#d3ae69] hover:text-white">
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
                    className="border-white/10 bg-white/[0.05] pr-11 text-white placeholder:text-[#6f7a8e] focus-visible:bg-white/[0.08]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8e7960] transition-colors hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                size="lg"
                className="w-full border-[#d5b274] bg-[linear-gradient(135deg,#dfbf85,#b78c46)] text-[#08111e] hover:bg-[linear-gradient(135deg,#e6c78f,#c2944b)]"
              >
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
              <p className="text-xs text-[#9f9178]">
                Need access?{" "}
                <Link href="/" className="font-semibold text-[#d3ae69] hover:text-white">
                  Contact your administrator
                </Link>
              </p>
              <p className="pt-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7f705a]">
                (c) 2026 Wish2Skill CampusOS
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
