"use client";

import { useTransition } from "react";
import { updateSystemSettings } from "@/actions/settings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, Shield, Bell, School, Loader2 } from "lucide-react";
import { toast } from "sonner";

type SettingsData = {
    instituteName: string;
    contactEmail: string;
    academicYear: string;
    timezone: string;
};

export default function AdminSettingsClientPage({ initialSettings }: { initialSettings: SettingsData }) {
  const [isPending, startTransition] = useTransition();

  async function handleUpdate(formData: FormData) {
      const data = [
          { key: "instituteName", value: formData.get("instituteName") as string },
          { key: "contactEmail", value: formData.get("contactEmail") as string },
          { key: "academicYear", value: formData.get("academicYear") as string },
          { key: "timezone", value: formData.get("timezone") as string },
      ];

      startTransition(async () => {
          const res = await updateSystemSettings(data);
          if (res?.error) {
              toast.error(res.error);
          } else {
              toast.success("System settings updated dynamically!");
          }
      });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Institute Settings</h1>
        <p className="text-muted-foreground">Configure your global platform preferences dynamically.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-2 lg:col-span-1">
          <Button variant="secondary" className="w-full justify-start"><School className="mr-2 h-4 w-4" /> General</Button>
          <Button variant="ghost" className="w-full justify-start"><Shield className="mr-2 h-4 w-4" /> Security</Button>
          <Button variant="ghost" className="w-full justify-start"><Bell className="mr-2 h-4 w-4" /> Notifications</Button>
          <Button variant="ghost" className="w-full justify-start"><Globe className="mr-2 h-4 w-4" /> Domains</Button>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <form action={handleUpdate} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Institute Identity</CardTitle>
                  <CardDescription>Update your organization's dynamic information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="instituteName">Institute Name</Label>
                    <Input id="instituteName" name="instituteName" defaultValue={initialSettings.instituteName} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Admin Contact Email</Label>
                      <Input id="contactEmail" name="contactEmail" type="email" defaultValue={initialSettings.contactEmail} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="academicYear">Current Academic Year</Label>
                      <Input id="academicYear" name="academicYear" defaultValue={initialSettings.academicYear} required />
                    </div>
                  </div>
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
                        <select id="timezone" name="timezone" defaultValue={initialSettings.timezone} className="w-full bg-transparent outline-none text-sm" required>
                            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                            <option value="America/New_York">America/New_York (EST)</option>
                            <option value="Europe/London">Europe/London (GMT)</option>
                        </select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                      <Button type="submit" disabled={isPending} className="bg-cyan-600 hover:bg-cyan-700 font-bold">
                          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Dynamic Settings
                      </Button>
                  </div>
                </CardContent>
              </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
