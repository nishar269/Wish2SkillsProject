"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Eye, EyeOff, Loader2, BookOpen, Users, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await loginAction(formData);
        if (result?.error) {
          setError(result.error);
        } else if (result?.success) {
          router.push("/dashboard");
          router.refresh();
        }
      } catch (err) {
        setError("An unexpected error occurred. Please try again.");
      }
    });
  }

  return (
    <div className="min-h-screen flex selection:bg-cyan-500/30">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-24 text-white space-y-12">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/5 rounded-[2rem] backdrop-blur-3xl border border-white/10 shadow-2xl subtle-glow">
              <GraduationCap className="h-12 w-12 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Wish2Skill</h1>
              <p className="text-cyan-400 text-xs font-black uppercase tracking-[0.4em] mt-1">CampusOS Node</p>
            </div>
          </div>
          <div className="space-y-6">
            <h2 className="text-7xl font-black italic tracking-tighter uppercase leading-[0.9]">
              Smart Institute<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-indigo-400">
                Management
              </span>
            </h2>
            <p className="text-slate-400 text-lg font-bold italic tracking-wide max-w-md border-l-2 border-cyan-500/30 pl-6">
              Establish total operational control with next-generation AI institutional intelligence.
            </p>
          </div>

          <div className="flex gap-8">
             <div className="flex flex-col gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-cyan-500">Live Nodes</span>
                <span className="text-2xl font-black">2.4k+</span>
             </div>
             <div className="flex flex-col gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-indigo-500">Active Sync</span>
                <span className="text-2xl font-black italic">99.9%</span>
             </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#020617] relative">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #1e293b 1px, transparent 0)' , backgroundSize: '40px 40px' }} />
        <div className="w-full max-w-md relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <Card className="glass border-white/10 rounded-[3rem] p-4">
            <CardHeader className="text-center pb-8 pt-8">
              <div className="mx-auto w-16 h-1 w-1 bg-cyan-500 rounded-full mb-8 shadow-[0_0_15px_rgba(6,182,212,1)]" />
              <CardTitle className="text-3xl font-black italic tracking-tighter uppercase">Identify Node</CardTitle>
              <CardDescription className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">Protocol Authentication Required</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 rounded-2xl bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest border border-red-500/20 text-center animate-shake">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Neural Address</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="ADMIN@NODE.PROTOCOL"
                    required 
                    disabled={isPending} 
                    className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 text-xs font-bold tracking-widest focus:ring-cyan-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Access Secret</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      name="password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••"
                      required 
                      disabled={isPending} 
                      className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 text-xs font-bold tracking-widest focus:ring-cyan-500/50 pr-12"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" disabled={isPending} className="w-full h-14 bg-white text-slate-950 hover:bg-cyan-400 hover:text-slate-950 rounded-2xl font-black italic uppercase tracking-widest text-sm shadow-2xl transition-all active:scale-95 group">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2 group-hover:scale-125 transition-transform" />}
                  Initiate Stream
                </Button>
                
                <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-3">
                  {[
                    { role: "Master", email: "admin@wish2skill.com" },
                    { role: "Mentor", email: "faculty@wish2skill.com" },
                    { role: "Node", email: "student@wish2skill.com" },
                    { role: "Coord", email: "coord@wish2skill.com" },
                  ].map((demo) => (
                    <button
                      key={demo.role}
                      type="button"
                      onClick={() => {
                        const emailInput = document.getElementById("email") as HTMLInputElement;
                        const passwordInput = document.getElementById("password") as HTMLInputElement;
                        if (emailInput && passwordInput) {
                          emailInput.value = demo.email;
                          passwordInput.value = "Password123";
                        }
                      }}
                      className="px-4 py-3 text-[9px] font-black uppercase tracking-widest border border-white/5 rounded-xl hover:bg-white/5 hover:border-cyan-500/50 transition-all text-slate-500 hover:text-cyan-400"
                    >
                      {demo.role} Sync
                    </button>
                  ))}
                </div>
              </form>
            </CardContent>
          </Card>
          <p className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">© 2026 Wish2Skill CampusOS Node System</p>
        </div>
      </div>
    </div>
  );
}
