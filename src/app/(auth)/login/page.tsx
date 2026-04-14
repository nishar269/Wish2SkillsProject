"use client";

import React, { useState, useTransition } from "react";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Eye, EyeOff, Loader2, ShieldCheck, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await loginAction(formData);
        if (result?.error) {
          setError(result.error);
        } else {
          // Reliable hard refresh for standard UI stability
          window.location.href = "/dashboard";
        }
      } catch (err) {
        setError("An unexpected error occurred. Please try again.");
      }
    });
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 selection:bg-blue-100">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <div className="text-center">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Access CampusOS</h1>
                <p className="text-sm font-medium text-slate-500">Sign in to your student terminal</p>
            </div>
        </div>

        <Card className="pleasant-card border-none">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl font-bold">Secure Login</CardTitle>
            <CardDescription className="text-xs font-medium">Enter your credentials to synchronize data</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 text-red-600 text-[11px] font-bold border border-red-100 text-center">
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-slate-700 ml-1">Account Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="name@institute.com"
                  required 
                  disabled={isPending} 
                  className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-100 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" title="password" className="text-xs font-bold text-slate-700 ml-1">Access Secret</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••"
                    required 
                    disabled={isPending} 
                    className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-100 rounded-xl pr-12"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-bold px-1">
                <button type="button" className="text-blue-600 hover:underline">Forgot password?</button>
                <div className="flex items-center gap-1.5 text-slate-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Secure Node</span>
                </div>
              </div>

              <Button type="submit" disabled={isPending} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-100 transition-all active:scale-95 group">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Sign In
                <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-4">Quick Access Nodes</p>
                <div className="grid grid-cols-2 gap-2">
                    {[
                      { role: "Admin", email: "admin@wish2skill.com" },
                      { role: "Student", email: "student@wish2skill.com" },
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
                        className="p-3 text-[10px] font-bold border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all text-slate-600 hover:text-blue-700"
                      >
                        {demo.role} Demo
                      </button>
                    ))}
                </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-[11px] font-medium text-slate-400">
            Need an account? Contact your institute administration.
        </p>
      </div>
    </div>
  );
}
