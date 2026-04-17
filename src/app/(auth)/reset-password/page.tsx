"use client";

import React, { useState, useTransition, useEffect, Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, KeyRound, ShieldAlert, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resetPasswordAction } from "@/actions/auth";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
        setError("Invalid request. Missing security token.");
    }
  }, [token]);

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await resetPasswordAction(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess(true);
      }
    });
  }

  if (success) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
            <Card className="w-full max-w-md shadow-xl border-0 text-center py-6">
                <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center -translate-y-2 mb-4">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <CardHeader className="space-y-2 pt-0 text-center pb-6">
                    <CardTitle className="text-2xl font-bold tracking-tight">Access Restored</CardTitle>
                    <CardDescription>Your password has been successfully reset.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                        <Link href="/login">Proceed to Login</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="space-y-2 text-center pb-6">
          <CardTitle className="text-2xl font-bold tracking-tight">Deploy New Credential</CardTitle>
          <CardDescription>
            Allocate a robust new password to secure your institutional account.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <form action={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 text-xs font-semibold border border-red-100">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
              
              <input type="hidden" name="token" value={token || ""} />

              <div className="space-y-2">
                <Label htmlFor="password" className="font-bold">New Password</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                  minLength={8}
                  className="h-11"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="font-bold">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  type="password" 
                  required 
                  minLength={8}
                  className="h-11"
                  placeholder="••••••••"
                />
              </div>

              <Button type="submit" disabled={isPending || !token} className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-bold">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Authorize"} <KeyRound className="h-4 w-4 ml-1" />
              </Button>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">Loading security protocol...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
