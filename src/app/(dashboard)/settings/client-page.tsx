"use client";

import { useState, useTransition } from "react";
import { updateProfile, updatePassword } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, Lock, Phone, Mail, Shield, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function SettingsClientPage({ user }: { user: any }) {
  const [isPending, startTransition] = useTransition();

  async function handleProfileUpdate(formData: FormData) {
    const data = {
        name: formData.get("name") as string,
        phone: formData.get("phone") as string,
    };

    startTransition(async () => {
        const res = await updateProfile(data);
        if (res?.error) toast.error(res.error);
        else toast.success("Profile updated successfully!");
    });
  }

  async function handlePasswordUpdate(formData: FormData) {
    const current = formData.get("current") as string;
    const newPass = formData.get("new") as string;
    const confirm = formData.get("confirm") as string;

    if (newPass !== confirm) {
        return toast.error("Passwords do not match!");
    }

    startTransition(async () => {
        const res = await updatePassword({ current, new: newPass });
        if (res?.error) toast.error(res.error);
        else {
            toast.success("Password changed successfully!");
            (document.getElementById("pass-form") as HTMLFormElement).reset();
        }
    });
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">Manage your profile, preferences and security.</p>
      </div>

      <div className="flex items-center gap-6 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
         <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-3xl font-black">
            {user.name[0]}
         </div>
         <div className="space-y-1">
            <h2 className="text-xl font-bold">{user.name}</h2>
            <div className="flex items-center gap-2">
                <Badge className="bg-cyan-100 text-cyan-700 hover:bg-cyan-100 border-0">{user.role}</Badge>
                <span className="text-xs text-muted-foreground">• Active Member</span>
            </div>
         </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-transparent border-b rounded-none w-full justify-start gap-8 h-auto p-0">
          <TabsTrigger value="profile" className="data-[state=active]:border-b-2 data-[state=active]:border-cyan-600 rounded-none bg-transparent px-0 pb-4 h-full text-sm font-semibold">Personal Info</TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:border-b-2 data-[state=active]:border-cyan-600 rounded-none bg-transparent px-0 pb-4 h-full text-sm font-semibold">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
              <CardDescription>Update your public profile details.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input id="name" name="name" defaultValue={user.name} className="pl-10" />
                        </div>
                    </div>
                    <div className="space-y-2 opacity-60">
                        <Label htmlFor="email">Email Address (Locked)</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input id="email" value={user.email} disabled className="pl-10" />
                        </div>
                    </div>
                </div>
                <div className="space-y-2 max-w-md">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input id="phone" name="phone" defaultValue={user.phone || ""} className="pl-10" placeholder="+91..." />
                    </div>
                </div>
                <Button type="submit" disabled={isPending} className="bg-cyan-600 hover:bg-cyan-700">
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {user.role === "STUDENT" && (
            <Card className="border-0 shadow-sm bg-slate-50 dark:bg-slate-900/50">
                <CardHeader>
                <CardTitle className="text-md font-bold">Academic Record</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Enrollment No</span>
                        <span className="font-mono font-bold">{user.student?.enrollmentNo}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Registration Date</span>
                        <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Change Password</CardTitle>
              <CardDescription>Ensure your account remains secure with a strong password.</CardDescription>
            </CardHeader>
            <CardContent>
              <form id="pass-form" action={handlePasswordUpdate} className="space-y-4 max-w-md">
                <div className="space-y-2">
                    <Label htmlFor="current">Current Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input id="current" name="current" type="password" required className="pl-10" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="new">New Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input id="new" name="new" type="password" required className="pl-10" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirm">Confirm New Password</Label>
                    <div className="relative">
                        <Shield className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input id="confirm" name="confirm" type="password" required className="pl-10" />
                    </div>
                </div>
                <Button type="submit" disabled={isPending} className="w-full bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-black">
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
