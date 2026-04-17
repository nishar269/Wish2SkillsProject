"use client";

import React, { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, MailCheck, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { forgotPasswordAction } from "@/actions/auth";

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await forgotPasswordAction(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess(true);
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="space-y-2 text-center pb-6">
          <CardTitle className="text-2xl font-bold tracking-tight">Recovery Protocol</CardTitle>
          <CardDescription>
            Enter your registered institution email to receive a secure password reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-6 text-center">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <MailCheck className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-lg text-slate-900">Email Dispatched</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  If an account exists for that email, a secure reset link has been dispatched to your inbox.
                </p>
              </div>
              <Button asChild className="w-full mt-4" variant="outline">
                <Link href="/login">Return to Sign In</Link>
              </Button>
            </div>
          ) : (
            <form action={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 text-xs font-semibold border border-red-100">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold">Institutional Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="you@wish2skill.com" 
                  required 
                  className="h-11"
                />
              </div>
              <Button type="submit" disabled={isPending} className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-bold">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Dispatch Reset Link"}
              </Button>
              <div className="text-center pt-2">
                <Link href="/login" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">
                  <ArrowLeft className="h-3 w-3 mr-1.5" /> Back to Authorization
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
