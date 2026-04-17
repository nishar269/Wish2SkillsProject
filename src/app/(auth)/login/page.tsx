"use client";

import React, { useState, useTransition } from "react";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Eye, EyeOff, Loader2 } from "lucide-react";

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
          window.location.href = "/dashboard";
        }
      } catch {
        setError("An unexpected error occurred. Please try again.");
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white selection:bg-blue-100 font-sans">
      <div className="w-full max-w-sm space-y-10">
        <div className="flex flex-col items-center gap-4">
            <GraduationCap className="h-10 w-10 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Sign In</h1>
        </div>

        <form action={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-lg bg-red-50 text-red-600 text-xs font-bold border border-red-100 text-center">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-bold text-gray-700 ml-1">Email Address</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="admin@wish2skill.com"
              required 
              disabled={isPending} 
              className="h-12 border-gray-200 focus:border-blue-500 rounded-lg text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" title="password" className="text-sm font-bold text-gray-700 ml-1">Password</Label>
            <div className="relative">
              <Input 
                id="password" 
                name="password" 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                required 
                disabled={isPending} 
                className="h-12 border-gray-200 focus:border-blue-500 rounded-lg text-base pr-12"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={isPending} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-base transition-all">
            {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Continue
          </Button>
        </form>

        <div className="pt-10 border-t border-gray-100 grid grid-cols-2 gap-4">
            <button
                type="button"
                onClick={() => {
                    const e = document.getElementById("email") as HTMLInputElement;
                    const p = document.getElementById("password") as HTMLInputElement;
                    if (e && p) { e.value = "admin@wish2skill.com"; p.value = "Password123"; }
                }}
                className="flex flex-col items-center p-4 border border-gray-100 rounded-lg hover:border-blue-200 hover:bg-blue-50 transition-all group"
            >
                <span className="text-xs font-bold text-gray-500 group-hover:text-blue-600 uppercase">Admin Demo</span>
            </button>
            <button
                type="button"
                onClick={() => {
                    const e = document.getElementById("email") as HTMLInputElement;
                    const p = document.getElementById("password") as HTMLInputElement;
                    if (e && p) { e.value = "student@wish2skill.com"; p.value = "Password123"; }
                }}
                className="flex flex-col items-center p-4 border border-gray-100 rounded-lg hover:border-blue-200 hover:bg-blue-50 transition-all group"
            >
                <span className="text-xs font-bold text-gray-500 group-hover:text-blue-600 uppercase">Student Demo</span>
            </button>
        </div>
      </div>
    </div>
  );
}
