import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Globe, Shield, Bell, School } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Institute Settings</h1>
        <p className="text-muted-foreground">Configure your global platform preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-2 lg:col-span-1">
          <Button variant="secondary" className="w-full justify-start"><School className="mr-2 h-4 w-4" /> General</Button>
          <Button variant="ghost" className="w-full justify-start"><Shield className="mr-2 h-4 w-4" /> Security</Button>
          <Button variant="ghost" className="w-full justify-start"><Bell className="mr-2 h-4 w-4" /> Notifications</Button>
          <Button variant="ghost" className="w-full justify-start"><Globe className="mr-2 h-4 w-4" /> Domains</Button>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Institute Identity</CardTitle>
              <CardDescription>Update your organization's name and contact information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instituteName">Institute Name</Label>
                <Input id="instituteName" defaultValue="Wish2Skill Academy" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Admin Contact Email</Label>
                  <Input id="contactEmail" defaultValue="admin@wish2skill.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="academicYear">Current Academic Year</Label>
                  <Input id="academicYear" defaultValue="2026-2027" />
                </div>
              </div>
              <Button className="bg-cyan-600 hover:bg-cyan-700">Save Changes</Button>
            </CardContent>
          </Card>

           <Card>
            <CardHeader>
              <CardTitle>Timezone & Formatting</CardTitle>
              <CardDescription>Set how dates and times are displayed globally.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Default Timezone</Label>
                <div className="border rounded-md px-3 py-2 bg-slate-50 dark:bg-slate-900 border-slate-200">
                    <select id="timezone" className="w-full bg-transparent outline-none text-sm">
                        <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                        <option value="America/New_York">America/New_York (EST)</option>
                        <option value="Europe/London">Europe/London (GMT)</option>
                    </select>
                </div>
              </div>
              <Button variant="outline">Update Metrics</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
