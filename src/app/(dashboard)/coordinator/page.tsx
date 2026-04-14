import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  GraduationCap,
  Calendar,
  AlertTriangle,
  ClipboardCheck
} from "lucide-react";

export default async function CoordinatorDashboardPage() {
  const session = await auth();

  const stats = [
    {
      title: "Managed Batches",
      value: "8",
      detail: "Active across 3 courses",
      icon: GraduationCap,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Avg Attendance",
      value: "88%",
      detail: "Slight dip this week",
      icon: ClipboardCheck,
      color: "from-amber-500 to-amber-600",
    },
    {
      title: "Classes Today",
      value: "14",
      detail: "4 starting soon",
      icon: Calendar,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      title: "Weak Students",
      value: "12",
      detail: "Require attention",
      icon: AlertTriangle,
      color: "from-red-500 to-red-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome, {session?.user?.name?.split(" ")[0]}! 📋
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor your batches and oversee academic operations.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.detail}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Adding a placeholder for the batch monitoring section */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Batch Monitoring (Demo)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Detailed batch metrics will appear here.</div>
        </CardContent>
      </Card>
    </div>
  );
}
